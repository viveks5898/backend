import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';


// Environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

export const signup = async (req, res) => {
    const { fullName, email, password, paymentPlan } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
        return res.status(400).json({
            status: "error",
            code: 400,
            message: "All fields are required",
        });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            status: "error",
            code: 400,
            message: "Invalid email format",
        });
    }

    try {
        // Check if email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                status: "error",
                code: 409,
                message: "Email is already registered",
            });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({
                status: "error",
                code: 400,
                message: "Password must be at least 8 characters long",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            fullName,
            email,
            password: hashedPassword,
            paymentPlan: paymentPlan || "basic",
        });

        await user.save();
        return res.status(201).json({
            status: "success",
            code: 201,
            message: "User registered successfully",
        });
    } catch (error) {
        console.error("Signup Error:", error);
        return res.status(500).json({
            status: "error",
            code: 500,
            message: "Error registering user",
        });
    }
};

  

export const login = async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({
            status: "error",
            code: 400,
            message: "Email and password are required",
        });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            status: "error",
            code: 400,
            message: "Invalid email format",
        });
    }

    try {
        // Find user and check credentials
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                status: "error",
                code: 404,
                message: "User not found",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: "error",
                code: 401,
                message: "Invalid password",
            });
        }

        // Generate tokens
        const accessToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ id: user._id }, JWT_REFRESH_SECRET, { expiresIn: "7d" });

        user.refreshToken = refreshToken;
        await user.save();

        // Exclude password in the response
        const { password: _, ...userWithoutPassword } = user.toObject();

        return res.status(200).json({
            status: "success",
            code: 200,
            message: "Login successful",
            user: userWithoutPassword,
            accessToken,
            refreshToken,
        });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({
            status: "error",
            code: 500,
            message: "Error logging in",
        });
    }
};



export const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ error: "Refresh token is required" });
    }

    try {
        const user = await User.findOne({ refreshToken });
        if (!user) {
            return res.status(403).json({ error: "Invalid refresh token" });
        }

        jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: "Invalid refresh token" });
            }

            const newAccessToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "15m" });
            res.status(200).json({ accessToken: newAccessToken });
        });
    } catch (error) {
        res.status(500).json({ error: "Error refreshing token" });
    }
};


// Forgot Password (Simplified)
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  // Logic to generate and send reset password token to email
  res.status(200).json({ message: "Password reset email sent (mocked)" });
};

// Update User
export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { fullName } = req.body;

    if (!id) {
        return res.status(400).json({ error: "User ID is required" });
    }

    if (!fullName) {
        return res.status(400).json({ error: "Name ais required" });
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(id, { fullName}, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: "Error updating user" });
    }
};


export const updatePaymentPlan = async (req, res) => {
    const { id } = req.params;
    const { paymentPlan } = req.body;
  
    try {
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { paymentPlan },
        { new: true }
      );
      if (!updatedUser) return res.status(404).json({ error: "User not found" });
  
      res.status(200).json({ message: "Payment plan updated successfully", user: updatedUser });
    } catch (error) {
      res.status(500).json({ error: "Error updating payment plan" });
    }
  };
  