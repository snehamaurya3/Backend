const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const User = require("./models/User");
const Admin = require("./models/Admin");
const bcrypt = require("bcrypt");
//  const { generateToken } = require("./utils");
const { generateToken } = require("./controllers/utils");

const userAuthRoutes = require("./routes/userAuthRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/user", userAuthRoutes);
app.use("/api/admin", adminAuthRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get("/", (req, res) => {
  res.send(" Health Assure Backend is running...");
});


// ---------------- USER ----------------
// Signup
app.post("/api/users/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const user = new User({ name, email, password });
    await user.save();

    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Signup error:", err);   
    res.status(500).json({ message: "Error in signup", error: err.message });
  }
});

// Login (only one active session)
app.post("/api/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    if (user.sessionActive) return res.status(403).json({ message: "User already logged in elsewhere" });

    const token = generateToken(user._id, "user");
    user.sessionActive = true;
    await user.save();

    // res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    res.json({
      message: "User logged in successfully",
    });
  } catch (err) {
    res.status(500).json({ message: "Error in login" });
  }
});

// Logout
app.post("/api/users/logout", async (req, res) => {
  try {
    const { email } = req.body;
    await User.findOneAndUpdate({ email }, { sessionActive: false });
    res.json({ message: "User logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error in logout" });
  }
});

// ---------------- ADMIN ----------------
// Signup
app.post("/api/admins/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) return res.status(400).json({ message: "Admin already exists" });

    const admin = new Admin({ name, email, password });
    await admin.save();

    res.json({ message: "Admin registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error in signup" });
  }
});

// Login
// ---------------- ADMIN LOGIN ----------------
app.post("/api/admins/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    if (admin.sessionActive) {
      return res.status(403).json({ message: "Admin already logged in elsewhere" });
    }

    const token = generateToken(admin._id, "admin");
    admin.sessionActive = true;
    await admin.save();

    // res.json({
    //   token,
    //   admin: { id: admin._id, name: admin.name, email: admin.email }
    // });
    res.json({
      message: "Admin logged in successfully",
    });
  } catch (err) {
    console.error("Admin login error:", err.message);
    res.status(500).json({ message: "Error in login" });
  }
});

// Logout
app.post("/api/admins/logout", async (req, res) => {
  try {
    const { email } = req.body;
    await Admin.findOneAndUpdate({ email }, { sessionActive: false });
    res.json({ message: "Admin logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error in logout" });
  }
});

