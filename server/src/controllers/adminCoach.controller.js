const db = require("../config/database");

exports.getCoachRequests = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM coach_requests ORDER BY created_at DESC"
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    next(err);
  }
};

exports.approveCoachRequest = async (req, res) => {
  const { id } = req.params;

  // ============1️⃣ Fetch request
  const [[request]] = await db.execute(
    "SELECT * FROM coach_requests WHERE id = ?",
    [id]
  );

  if (!request) {
    return res.status(404).json({ message: "Request not found" });
  }

  // ============2️⃣ Check if this user is already become a coach
  const [alreadyCoach] = await db.execute(
    "SELECT id FROM coaches WHERE user_id = ?",
    [request.user_id]
  );

  if (alreadyCoach.length > 0) {
    return res.status(400).json({
      success: false,
      message: "This user is already a coach"
    });
  }

  // ============3️⃣ Insert EXACT approved data into coaches
  await db.execute(
    `INSERT INTO coaches (
      user_id,
      first_name,
      last_name,
      specialization,
      experience_years,
      bio,
      achievements,
      hourly_rate,
      profile_image,
      is_available
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, true)`,
    [
      request.user_id,
      request.first_name,
      request.last_name,
      request.specialization,
      request.experience_years,
      request.bio,
      request.achievements,
      request.hourly_rate,
      request.profile_image
      
    ]
  );

  // =================4️⃣ Mark request approved
  await db.execute(
    "UPDATE coach_requests SET status='approved' WHERE id = ?",
    [id]
  );

  res.json({
    success: true,
    message: "Coach approved successfully",
  });
};


exports.rejectCoachRequest = async (req, res) => {
  const { id } = req.params;

  await db.execute(
    "UPDATE coach_requests SET status='rejected' WHERE id=?",
    [id]
  );

  res.json({ success: true });
};
