const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  refreshToken: { type: String },
  paymentPlan: { type: String, default: "basic" } // Default plan is "basic"
});

module.exports = mongoose.model("User", userSchema);