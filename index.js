const express = require('express');
const cors = require('cors'); // Import the cors middleware
require('dotenv').config();
const authenticateToken = require('./middleware/authMiddleware');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

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
