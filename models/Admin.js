const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  hospitalName: { type: String, required: true },
  headName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  activeSession: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model("Admin", adminSchema);
