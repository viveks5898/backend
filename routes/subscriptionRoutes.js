import express from "express";
import { 
  createSubscription, 
  createCustomer, 
  cancelSubscription, 
  upgradeSubscription 
} from "../controllers/subscriptionController.js";

const router = express.Router();

// Route to create a subscription
router.post("/create", createSubscription);

// Route to create a customer
router.post("/create-customer", createCustomer);

// Route to cancel a subscription immediately
router.post("/cancel-subscription", cancelSubscription);

// Route to upgrade a subscription plan
router.post("/upgrade", upgradeSubscription);

export default router;
