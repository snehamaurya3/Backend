const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const { generateToken } = require("./utils");

// Signup
exports.signup = async (req, res) => {
  try {
    const { hospitalName, headName, email, password } = req.body;

    let existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Admin already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const admin = new Admin({ hospitalName, headName, email, password: hashed });
    await admin.save();

    res.status(201).json({ msg: "Admin signup successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    if (admin.activeSession) {
      return res.status(403).json({ msg: "Admin already logged in elsewhere" });
    }

    const jti = Date.now().toString();
    const token = generateToken(admin._id, "admin", jti);

    admin.activeSession = jti;
    await admin.save();

    res.json({ token, role: "admin" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);
    if (admin) {
      admin.activeSession = null;
      await admin.save();
    }
    res.json({ msg: "Admin logged out" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
