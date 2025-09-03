const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { generateToken } = require("./utils");

// Signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed });
    await user.save();

    res.status(201).json({ msg: "User signup successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    if (user.activeSession) {
      return res.status(403).json({ msg: "User already logged in elsewhere" });
    }

    const jti = Date.now().toString();
    const token = generateToken(user._id, "user", jti);

    user.activeSession = jti;
    await user.save();

    res.json({ token, role: "user" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.activeSession = null;
      await user.save();
    }
    res.json({ msg: "User logged out" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
