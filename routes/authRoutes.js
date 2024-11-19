const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Auth routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/forgot-password", authController.forgotPassword);
router.put("/update/:id", authController.updateUser);
router.put("/update-payment-plan/:id", authController.updatePaymentPlan);

module.exports = router;
