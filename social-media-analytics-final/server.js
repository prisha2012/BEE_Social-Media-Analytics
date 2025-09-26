const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const compression = require('compression');

// Load environment variables
dotenv.config();

const connectDB = require('./config/database');

// Connect to MongoDB
connectDB();

// Initialize express app
const app = express();

// Middleware setup

// Use compression middleware to gzip responses for better performance
app.use(compression());

// Setup CORS - adjust allowed origins as needed
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*' // allows all if not set
}));

// Parse JSON bodies
app.use(express.json());

// Example: Import and use authentication routes (ensure authRoutes exports a router)
// const authRoutes = require('./routes/authRoutes');
// app.use('/api/auth', authRoutes); // Mounting router middleware correctly
// server.js mein add karna hai
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/data', require('./routes/dataCollection'));
app.use('/api/analytics', require('./routes/analytics'));


// Health check route for server status
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running and database connected' });
});

// 404 handler - middleware must be function with (req, res, next)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler - must have four parameters (err, req, res, next)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

app.use('/api/debug', require('./routes/debug'));


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
