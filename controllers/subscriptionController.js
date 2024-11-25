import Stripe from "stripe";
import User from "../models/userModel.js";
import Subscription from "../models/subscriptionModel.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Step 1: Create a Customer
export const createCustomer = async (req, res) => {
  try {
    const { name, email, token } = req.body;

    if (!name || !email || !token) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const customer = await stripe.customers.create({
      name,
      email,
    });

    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: { token: token },
      billing_details: {
        name,
        email,
        address: {
          line1: "123 Main Street", // Required
          line2: "Apt 4B", // Optional
          city: "San Francisco", // Optional
          state: "CA", // Optional
          postal_code: "94111", // Optional
          country: "US", // Optional (ISO 3166-1 alpha-2 format)
        },
      },
    });

    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: customer.id,
    });

    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethod.id,
      },
    });

    res.status(200).json({ success: true, customer });
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({ error: error.message });
  }
};

// Step 2: Create a Subscription
export const createSubscription = async (req, res) => {
  try {
    const { customerId, priceId, userId, paymentPlan, amount, credit } =
      req.body;

    if (!customerId || !priceId || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create a subscription for the customer
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
    });

    console.log("subscription", subscription);

    // Save the subscription in the database
    const newSubscription = new Subscription({
      subscriptionId: subscription.id,
      customerId,
      userId,
      startDate: new Date(subscription.current_period_start * 1000),
      endDate: new Date(subscription.current_period_end * 1000),
    });

    await newSubscription.save();

    // Update user's payment status
    await User.findByIdAndUpdate(userId, {
      paymentStatus: "paid",
      credit: credit,
      amount: amount,
      paymentPlan: paymentPlan,
      customerId: customerId,
    });

    res.status(200).json({
      success: true,
      subscription,
      paymentIntent: subscription.latest_invoice.payment_intent,
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({ error: error.message });
  }
};
// Step 3: Upgrade Subscription Plan
export const upgradeSubscription = async (req, res) => {
  try {
    const { subscriptionId, newPriceId, userId, credit, amount, paymentPlan } =
      req.body;

    if (!subscriptionId || !newPriceId || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Fetch the existing subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Update the subscription to the new price plan
    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        items: [
          {
            id: subscription.items.data[0].id, // Keep the existing item ID
            price: newPriceId, // Replace with the new price ID
          },
        ],
        proration_behavior: "create_prorations", // Handle proration (adjust charges for the current billing cycle)
      }
    );

    // Update the subscription details in your database
    await Subscription.findOneAndUpdate(
      { subscriptionId },
      {
        endDate: new Date(updatedSubscription.current_period_end * 1000),
      }
    );

    // Update the user’s details with the new subscription information
    await User.findByIdAndUpdate(userId, {
      credit: credit,
      amount: amount,
      paymentPlan: paymentPlan,
    });

    res.status(200).json({
      success: true,
      updatedSubscription,
    });
  } catch (error) {
    console.error("Error upgrading subscription:", error);
    res.status(500).json({ error: error.message });
  }
};

// Step 4: Cancel Subscription
export const cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId, userId } = req.body;

    if (!subscriptionId || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Cancel the subscription immediately
    const canceledSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: true,
      }
    );
    // Update the subscription record in the database
    await Subscription.findOneAndUpdate(
      { subscriptionId },
      {
        status: "canceled",
        endDate: new Date(), // Use the cancellation date
      }
    );

    // Update the user’s payment status in the database
    await User.findByIdAndUpdate(userId, {
      paymentStatus: "unpaid",
      paymentPlan: "plan_basic",
    });

    res.status(200).json({
      success: true,
      message: "Subscription canceled successfully",
      canceledSubscription,
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    res.status(500).json({ error: error.message });
  }
};




// Step 1: Create Payment Intent for Buying Credits
export const buyCredits = async (req, res) => {
  try {
    const { userId, creditAmount, customerName, customerAddress } = req.body;

    if (!userId || !creditAmount || creditAmount <= 0) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    // Validate customer details
    // if (!customerName || !customerAddress || !customerAddress.line1 || !customerAddress.postal_code) {
    //   return res.status(400).json({ error: "Customer name and valid address are required" });
    // }


  
    // Calculate the payment amount in cents (Stripe works with smallest currency units)
    const pricePerCredit = 1; // $1 per credit
    const totalPrice = creditAmount * pricePerCredit;
    const amountInCents = Math.round(totalPrice * 100);

    // Create a payment intent with customer name and address
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      payment_method_types: ["card"],
      description: `${creditAmount} credits purchase for $${totalPrice.toFixed(2)}`,
      shipping: {
        name: "customerName",
        address: {
          line1: "123 Main Street", // Required
          line2: "Apt 4B", // Optional
          city: "San Francisco", // Optional
          state: "CA", // Optional
          postal_code: "94111", // Optional
          country: "US", // Optional (ISO 3166-1 alpha-2 format)
        },
      },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret, // Needed for frontend
    });
  } catch (error) {
    console.error("Error in buyCredits API:", error);
    res.status(500).json({ error: error.message });
  }
};



// Step 2: Confirm Credit Purchase and Update User Credits
export const confirmCreditPurchase = async (req, res) => {
  try {
    const { userId, paymentIntentId, creditAmount } = req.body;

    if (!userId || !paymentIntentId || !creditAmount || creditAmount <= 0) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        error: "Payment not successful. Please try again.",
      });
    }

    // Find the user in the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the user's credit balance
    const updatedCredits = user.credit ? user.credit + creditAmount : creditAmount;

    await User.findByIdAndUpdate(userId, { credit: updatedCredits });

    res.status(200).json({
      success: true,
      message: "Credits purchased successfully!",
      updatedCredits,
    });
  } catch (error) {
    console.error("Error confirming credit purchase:", error);
    res.status(500).json({ error: error.message });
  }
};
