const express = require("express");
const { signup, login, logout } = require("../controllers/adminAuthController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", protect("admin"), logout);

router.get("/dashboard", protect("admin"), (req, res) => {
  res.json({ msg: `Welcome Admin: ${req.user.headName}` });
});

module.exports = router;
