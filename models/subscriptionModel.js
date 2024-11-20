import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    subscriptionId: { type: String, required: true, unique: true }, // Unique identifier for the subscription
    customerId: { type: String, required: true }, // Customer identifier (e.g., payment processor ID)
    startDate: { type: Date, required: true }, // Subscription start date
    endDate: { type: Date, required: true }, // Subscription end date
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the User model
    status: { type: String, enum: ["active", "unpaid", "cancelled"], default: "unpaid" }, 
  }, { timestamps: true }); // Automatically adds createdAt and updatedAt timestamps
  
export default mongoose.model("Subscription", subscriptionSchema);   

  