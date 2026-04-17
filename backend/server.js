const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const Class = require('./models/Class');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
//home routes
const homeRoutes = require('./routes/home');
app.use('/api/home', homeRoutes);
//booking routes
const bookingRoutes = require('./routes/bookings');
app.use('/api/bookings', bookingRoutes);
// class routes
const classRoutes = require('./routes/classes');
app.use('/api/classes', classRoutes);


// Test route
app.get('/', (req, res) => {
  res.send('Backend is working!');
});

// Health check endpoint
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// 404 Handler for API routes
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cbbs')
  .then(() => {
    console.log('-------------------------------');
    console.log('✅ MongoDB Connected Successfully');

    // Auto-seed default classes if none exist
    Class.countDocuments().then(count => {
      if (count === 0) {
        const defaultClasses = ["BSC IT", "BCA A", "BCA B", "BCA C", "BSC CS"];
        Class.insertMany(defaultClasses.map(name => ({ name })))
          .then(() => console.log('✅ Default classes seeded: BSC IT, BCA A, BCA B, BCA C, BSC CS'))
          .catch(err => console.error('Failed to seed classes:', err));
      }
    });

    console.log('-------------------------------');
  })
  .catch(err => console.error(err));

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('-------------------------------');
  console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
  console.log(`🏥 Health Check: http://127.0.0.1:${PORT}/api/health`);
  console.log('-------------------------------');
});
