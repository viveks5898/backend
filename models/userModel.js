import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  refreshToken: { type: String },
  paymentPlan: { type: String, default: "plan_basic" },
  customerId: { type: String }, // Customer identifier (e.g., payment processor ID)
  logo: { type: String }, 
  paymentStatus: { type: String, enum: ["paid", "unpaid"], default: "unpaid" }, 
  amount: { type: Number, default: 0 },
  credit: { type: Number, default: 0 } 

});

export default mongoose.model("User", userSchema);   
 