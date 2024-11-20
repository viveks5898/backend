import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authenticateToken from './middleware/authMiddleware.js';
import connectDB from './config/db.js';  // Use import to get the connectDB function
import authRoutes from './routes/authRoutes.js';
import dataRoutes from './routes/dataRoute.js';

dotenv.config();  // To load .env variables

// Connect to the database
connectDB();

// Create Express app
const app = express();

// Enable CORS
app.use(cors()); // Allow all origins by default

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
app.use('/api/', authRoutes);
app.use('/api/data', dataRoutes);

// Protected route example
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Basic route
app.get('/', (req, res) => {
  res.send('Hello, MongoDB!');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
