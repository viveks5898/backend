import express from 'express';
import { signup, login, refreshToken, forgotPassword, updateUser, updatePaymentPlan,getProfile } from '../controllers/authController.js';

const router = express.Router();

// Auth routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);
router.put("/update/:id", updateUser);
router.get("/profile", getProfile);

router.put("/update-payment-plan/:id", updatePaymentPlan);

export default router;
