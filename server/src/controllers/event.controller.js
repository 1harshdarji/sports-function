/**
 * Event Controller (District-style)
 */

const db = require('../config/database');


/**
 * Get all events (listing page)
 */
const getAllEvents = async (req, res, next) => {
  try {
    const [events] = await db.execute(`
    SELECT
      e.id,
      e.title,
      e.category,
      e.image_url,
      e.location,

      MIN(s.price) AS price,
      MIN(s.event_date) AS event_date,
      MIN(s.start_time) AS start_time

    FROM events e
    LEFT JOIN event_slots s ON s.event_id = e.id
    WHERE e.status = 'upcoming'
    GROUP BY e.id
    ORDER BY e.created_at DESC
  `);


    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
};


/**
 * Get event details + available dates
 */
const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [[event]] = await db.execute(
      `
      SELECT 
        id,
        title,
        description,
        category,
        image_url,
        location
      FROM events
      WHERE id = ?
      `,
      [id]
    );

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const [dates] = await db.execute(
      `
      SELECT DISTINCT event_date
      FROM event_slots
      WHERE event_id = ?
      ORDER BY event_date ASC
      `,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...event,
        available_dates: dates.map(d => d.event_date)
      }
    });
  } catch (err) {
    next(err);
  }
};


/**
 * Get slots for event by date
 */
const getEventSlotsByDate = async (req, res, next) => {
  try {
    const { id: eventId } = req.params;
    const { date } = req.query;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: "eventId is required",
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "date is required",
      });
    }

    const [slots] = await db.execute(
      `
      SELECT
        id,
        event_id,
        event_date,
        start_time,
        end_time,
        price,
        total_seats,
        booked_seats,
        (total_seats - booked_seats) AS seats_left,
        CASE
          WHEN (total_seats - booked_seats) <= 0 THEN 'sold_out'
          ELSE 'open'
        END AS status
      FROM event_slots
      WHERE event_id = ?
        AND DATE(event_date) = DATE(?)
      ORDER BY start_time ASC
      `,
      [eventId, date]
    );

    res.json({
      success: true,
      data: slots,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Create event + auto-generate slots (ADMIN)
 */
const createEvent = async (req, res, next) => {
  const conn = await db.getConnection();

  try {
    const {
      title,
      description,
      category,
      image_url,
      location,
      price,
      start_date,
      end_date,
      total_seats
    } = req.body;

    await conn.beginTransaction();

    // 1️⃣ Create event
    const [eventResult] = await conn.execute(
      `INSERT INTO events 
       (title, description, category, image_url, location, price, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, 'upcoming', ?)`,
      [title, description, category, image_url, location, price, req.user.id]
    );

    const eventId = eventResult.insertId;

    // 2️⃣ Create DAYS (not slots)
    // 2️⃣ Create TIME SLOTS per day (District-style)
  const slotTimes = [
    { start: "21:30:00", end: "22:45:00" },
    { start: "22:45:00", end: "00:00:00" }
  ];

  const current = new Date(start_date);
  const last = new Date(end_date);

  while (current <= last) {
    const dateStr = current.toISOString().slice(0, 10);

    for (const slot of slotTimes) {
      await conn.execute(
        `INSERT INTO event_slots 
        (event_id, event_date, start_time, end_time, total_seats, booked_seats, status)
        VALUES (?, ?, ?, ?, ?, 0, 'open')`,
        [
          eventId,
          dateStr,
          slot.start,
          slot.end,
          total_seats
        ]
      );
    }

    current.setDate(current.getDate() + 1);
  }
    await conn.commit();

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      eventId
    });

  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

const bookEvent = async (req, res, next) => {
  const conn = await db.getConnection();

  try {
    const userId = req.user.id;          // from auth middleware
    const { eventId, slotId, quantity } = req.body;

    if (quantity < 1 || quantity > 3) {
      return res.status(400).json({
        success: false,
        message: "You can book max 3 tickets"
      });
    }

    await conn.beginTransaction();

    /* 1️⃣ Check slot availability */
    const [[slot]] = await conn.execute(
      `SELECT total_seats, booked_seats, status
       FROM event_slots
       WHERE id = ? AND event_id = ? FOR UPDATE`,
      [slotId, eventId]
    );

    if (!slot || slot.status === 'sold_out') {
      throw new Error("Slot not available");
    }

    const seatsLeft = slot.total_seats - slot.booked_seats;

    if (seatsLeft < quantity) {
      throw new Error("Not enough seats available");
    }

    /* 2️⃣ Check user limit (max 3 per event) */
    const [[userBooking]] = await conn.execute(
      `SELECT COALESCE(SUM(quantity),0) AS booked
       FROM event_bookings
       WHERE user_id = ? AND event_id = ? AND status = 'confirmed'`,
      [userId, eventId]
    );

    if (userBooking.booked + quantity > 3) {
      throw new Error("Max 3 tickets allowed per user");
    }

    /* 3️⃣ Insert booking */
    await conn.execute(
      `INSERT INTO event_bookings (user_id, event_id, slot_id, quantity, status)
       VALUES (?, ?, ?, ?, 'confirmed')`,
      [userId, eventId, slotId, quantity]
    );

    /* 4️⃣ Update seats */
    await conn.execute(
      `UPDATE event_slots
       SET booked_seats = booked_seats + ?
       WHERE id = ?`,
      [quantity, slotId]
    );

    /* 5️⃣ Auto sold-out */
    await conn.execute(
      `UPDATE event_slots
       SET status = 'sold_out'
       WHERE id = ? AND booked_seats >= total_seats`,
      [slotId]
    );

    await conn.commit();

    res.json({
      success: true,
      message: "Booking confirmed"
    });

  } catch (err) {
    await conn.rollback();
    res.status(400).json({
      success: false,
      message: err.message
    });
  } finally {
    conn.release();
  }
};

const getMyEventBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.execute(`
      SELECT 
        eb.id,
        e.title,
        e.location,
        es.event_date,
        es.start_time,
        es.end_time,
        eb.quantity,
        es.price,
        (eb.quantity * es.price) AS total_amount
      FROM event_bookings eb
      JOIN events e ON eb.event_id = e.id
      JOIN event_slots es ON eb.slot_id = es.id
      WHERE eb.user_id = ?
      ORDER BY es.event_date DESC
    `, [userId]);

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};


module.exports = {
  getAllEvents,
  getEventById,
  getEventSlotsByDate,
  createEvent,
  bookEvent,
  getMyEventBookings
};
