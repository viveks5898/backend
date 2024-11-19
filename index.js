// index.js
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

// Create Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json()); 

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB", err);
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
