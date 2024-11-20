import Subscription from "../models/subscriptionModel.js";
import User from "../models/userModel.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  
  

// Helper function to handle subscription updates
async function handleSubscriptionUpdate(subscription) {
  const { id, customer, status, current_period_start, current_period_end } = subscription;

  // Find the user associated with this customer
  const user = await User.findOne({ customerId: customer });

  if (!user) {
    console.error("User not found for customer ID:", customer);
    return;
  }

  // Update or create the subscription in the database
  await Subscription.findOneAndUpdate(
    { subscriptionId: id },
    {
      subscriptionId: id,
      customerId: customer,
      startDate: new Date(current_period_start * 1000),
      endDate: new Date(current_period_end * 1000),
      status, // Save the current status of the subscription
      userId: user._id,
    },
    { upsert: true, new: true }
  );

  // Update user's payment status
  user.paymentStatus = status === "active" ? "paid" : "unpaid";
  await user.save();
}

// Helper function to handle subscription cancellations
async function handleSubscriptionCancellation(subscription) {
  const { id } = subscription;

  // Delete subscription from the database
  const deletedSubscription = await Subscription.findOneAndDelete({ subscriptionId: id });

  if (deletedSubscription) {
    // Optionally update user payment status to 'unpaid' or other logic
    const user = await User.findById(deletedSubscription.userId);
    if (user) {
      user.paymentStatus = "unpaid";
      await user.save();
    }
  }
}

// Helper function to handle successful payments
async function handlePaymentSuccess(invoice) {
  const { subscription, customer } = invoice;

  // Find the associated subscription
  const sub = await Subscription.findOne({ subscriptionId: subscription });
  if (sub) {
    // Optionally, update subscription and user status on successful payment
    sub.status = "active";
    await sub.save();

    const user = await User.findById(sub.userId);
    if (user) {
      user.paymentStatus = "paid";
      await user.save();
    }
  }
}

// Helper function to handle payment failures
async function handlePaymentFailure(invoice) {
  const { subscription, customer } = invoice;

  // Find the associated subscription
  const sub = await Subscription.findOne({ subscriptionId: subscription });
  if (sub) {
    // Optionally, update subscription and user status on payment failure
    sub.status = "past_due";
    await sub.save();

    const user = await User.findById(sub.userId);
    if (user) {
      user.paymentStatus = "unpaid";
      await user.save();
    }
  }
}

export { handlePaymentFailure, handlePaymentSuccess,handleSubscriptionCancellation,handleSubscriptionUpdate };
