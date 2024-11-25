import express from 'express';
import { signup, login, refreshToken, forgotPassword, updateUser, updatePaymentPlan,getProfile, deductCredit } from '../controllers/authController.js';
import authenticateToken from '../middleware/authMiddleware.js';
const router = express.Router();

// Auth routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);
router.put("/update/:id", updateUser);
router.get("/profile", getProfile);
router.post("/deduct-credit", authenticateToken, deductCredit);

router.put("/update-payment-plan/:id", updatePaymentPlan);

export default router;
