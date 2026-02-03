const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const { submitCoachRequest, getMyCoachRequest } = require("../controllers/coachRequest.controller");
const { authenticate } = require("../middleware/auth.middleware");

// 🔽 MULTER CONFIG
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads/coach-requests"));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + ext);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Certificate → PDF only
    if (file.fieldname === "certificate") {
      if (file.mimetype !== "application/pdf") {
        return cb(new Error("Certificate must be a PDF"));
      }
    }

    // Profile Image → JPG / PNG
    if (file.fieldname === "profileImage") {
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.mimetype)) {
        return cb(new Error("Profile image must be JPG or PNG"));
      }
    }

    cb(null, true);
  },
});
router.post(
  "/coach-requests",
  authenticate, 
  upload.fields([
    { name: "certificate", maxCount: 1 },
    { name: "profileImage", maxCount: 1 },
  ]),

  submitCoachRequest
);

router.get(
  "/coach-requests/my",
  authenticate,
  getMyCoachRequest
);

module.exports = router;

