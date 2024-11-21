import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authenticateToken from "./middleware/authMiddleware.js";
import connectDB from "./config/db.js"; // Use import to get the connectDB function
import authRoutes from "./routes/authRoutes.js";
import dataRoutes from "./routes/dataRoute.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import openAiRoutes from "./routes/openAiRoutes.js"
import bodyParser from "body-parser";
import {
  handlePaymentSuccess,
  handleSubscriptionCancellation,
  handleSubscriptionUpdate,
} from "./controllers/webhookController.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
dotenv.config(); 

connectDB();

// Create Express app
const app = express();

app.use(cors()); 

app.post(
  "/webhook",
  express.raw({ type: "application/json" }), // Use raw middleware to preserve the raw body
  async (req, res) => {
    console.log("req.headers", req.headers);

    const sig = req.headers["stripe-signature"];
    let event;
    console.log("abfsd", sig);

    try {
      console.log("asfdfsads");

      // Construct the event using the raw body
      event = stripe.webhooks.constructEvent(
        req.body, // This is the raw body
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log("aftertru");
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Log the full event for debugging
    console.log("Webhook Event:", JSON.stringify(event, null, 2));

    // Handle the webhook event
    try {
      switch (event.type) {
        case "customer.subscription.created":
        case "customer.subscription.updated":
          await handleSubscriptionUpdate(event.data.object);
          break;
        case "customer.subscription.deleted":
          await handleSubscriptionCancellation(event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Error handling webhook:", error.message);
      res.status(500).send("Webhook handling error.");
    }
  }
);

app.use(express.json());

app.use("/api/", authRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/openAi", openAiRoutes);


app.use("/api/subscription", subscriptionRoutes);

app.use(bodyParser.json());

app.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});
// Basic route
app.get("/", (req, res) => {
  res.send("Hello, MongoDB!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
