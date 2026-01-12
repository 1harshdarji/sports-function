const db = require("../config/database");

/* ===============================
   GET ADMIN EVENTS
================================ */
const getAdminEvents = async (req, res, next) => {
  try {
    const [events] = await db.execute(`
      SELECT
        e.id,
        e.title,
        e.category,
        e.location,
        e.status,
        MIN(s.event_date) AS start_date,
        MAX(s.event_date) AS end_date,
        COUNT(s.id) AS total_slots,
        SUM(s.booked_seats) AS total_booked
      FROM events e
      LEFT JOIN event_slots s ON s.event_id = e.id
      GROUP BY e.id
      ORDER BY e.created_at DESC
    `);

    res.json({
      success: true,
      data: events
    });
  } catch (err) {
    next(err);
  }
};

/* ===============================
   GET EVENT SLOTS (ADMIN)
================================ */
const getAdminEventSlots = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const [slots] = await db.execute(
      `
      SELECT
        id,
        event_date,
        start_time,
        end_time,
        total_seats,
        booked_seats,
        (total_seats - booked_seats) AS seats_left,
        status
      FROM event_slots
      WHERE event_id = ?
      ORDER BY event_date ASC, start_time ASC
      `,
      [eventId]
    );

    res.json({
      success: true,
      data: slots,
    });
  } catch (err) {
    next(err);
  }
};

/* ===============================
   ENABLE SLOT
================================ */
const enableEventSlot = async (req, res, next) => {
  try {
    const { slotId } = req.params;

    await db.execute(
      `UPDATE event_slots SET status = 'open' WHERE id = ?`,
      [slotId]
    );

    res.json({
      success: true,
      message: "Slot enabled successfully",
    });
  } catch (err) {
    next(err);
  }
};

/* ===============================
   DISABLE SLOT
================================ */
const disableEventSlot = async (req, res, next) => {
  try {
    const { slotId } = req.params;

    await db.execute(
      `UPDATE event_slots SET status = 'disabled' WHERE id = ?`,
      [slotId]
    );

    res.json({
      success: true,
      message: "Slot disabled successfully",
    });
  } catch (err) {
    next(err);
  }
};

/* ===============================
   CREATE EVENT (ADMIN)
================================ */
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      image_url,
      location,
      price,
      is_free,
      event_date,
    } = req.body;

    const adminId = req.user.id; // from auth middleware

    // ✅ basic validation
    if (!title || !category || !location) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const [result] = await db.execute(
      `
      INSERT INTO events
      (title, description, category, image_url, location, price, is_free, status, event_date, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'upcoming', ?, ?)
      `,
      [
        title,
        description || "",
        category,
        image_url || null,
        location,
        price || 0,
        is_free ? 1 : 0,
        event_date,
        adminId,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      eventId: result.insertId,
    });
  } catch (err) {
    next(err);
  }
};


module.exports = {
  getAdminEvents,
  getAdminEventSlots,
  enableEventSlot,
  disableEventSlot,
  createEvent,
};
