const db = require("../config/database");

exports.submitCoachRequest = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // check if user already has a pending or approved request
    const [existing] = await db.execute(
      `SELECT id FROM coach_requests 
      WHERE user_id = ? AND status IN ('pending', 'approved')`,
      [userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a coach request."
      });
    }

    const {
      firstName,
      lastName,
      age,
      gender,
      email,
      phone,
      country,
      specialization,
      experience,
      location,
      bio,
      achievements,
      hourlyRate,
    } = req.body;

    const certificateUrl = req.files?.certificate
      ? `/uploads/coach-requests/${req.files.certificate[0].filename}`
      : null;

    const profileImage = req.files?.profileImage
      ? `/uploads/coach-requests/${req.files.profileImage[0].filename}`
      : null;


    await db.execute(
      `INSERT INTO coach_requests (
        user_id,
        first_name,
        last_name,
        age,
        gender,
        email,
        phone,
        country,
        specialization,
        experience_years,
        preferred_location,
        bio,
        achievements,
        certificate_url,
        profile_image,
        hourly_rate,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        userId,
        firstName,
        lastName,
        age,
        gender,
        email,
        phone,
        country,
        specialization,
        experience,
        location,
        bio,
        achievements,
        certificateUrl,
        profileImage,
        hourlyRate || null
      ]
    );

    res.status(201).json({
      success: true,
      message: "Coach request submitted successfully. Await admin approval.",
    });
  } catch (err) {
    next(err);
  }
};


exports.getMyCoachRequest = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.execute(
      "SELECT * FROM coach_requests WHERE user_id = ? LIMIT 1",
      [userId]
    );

    if (rows.length === 0) {
      return res.json({
        success: true,
        data: null,
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (err) {
    console.error("Get my coach request failed:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch coach request",
    });
  }
};