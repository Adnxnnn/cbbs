const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// DELETE /api/bookings/reset - Reset all data (Moved to top to avoid route conflicts)
router.delete('/reset', async (req, res) => {
  try {
    console.log("Resetting all data...");
    await Booking.deleteMany({});
    res.json({ message: 'All data has been reset successfully.' });
  } catch (err) {
    console.error("Reset Error:", err);
    res.status(500).json({ error: 'Failed to reset data' });
  }
});

// GET /api/bookings/stats - Dashboard statistics for admin
router.get('/stats', async (req, res) => {
  try {
    const stats = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalPassengers: { $sum: "$passengers" },
          confirmedCount: { 
            $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] } 
          },
          pendingCount: { 
            $sum: { $cond: [{ $ne: ["$status", "confirmed"] }, 1, 0] } 
          }
        }
      }
    ]);
    res.json(stats[0] || { totalBookings: 0, totalPassengers: 0, confirmedCount: 0, pendingCount: 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /api/bookings/today - Fetch bookings for the current date
router.get('/today', async (req, res) => {
  try {
    const todayStr = new Date().toLocaleDateString('en-CA');
    const bookings = await Booking.find({ date: todayStr }).sort({ date: 1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch today\'s bookings' });
  }
});

// GET /api/bookings/daily-summary - Showcase daily totals and bookings
router.get('/daily-summary', async (req, res) => {
  try {
    const summary = await Booking.aggregate([
      {
        $group: {
          _id: "$date",
          totalPassengers: { $sum: "$passengers" },
          bookingsCount: { $sum: 1 },
          details: { $push: { search: "$search", passengers: "$passengers", status: "$status" } }
        }
      },
      {
        $sort: { _id: 1 } // Sort by date ascending
      }
    ]);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch daily summary' });
  }
});

// GET /api/bookings/debug/:id - Debug endpoint to check a specific booking
router.get('/debug/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    
    res.json({
      _id: booking._id,
      search: booking.search,
      date: booking.date,
      passengers: booking.passengers,
      status: booking.status,
      hasScreenshot: !!booking.paymentScreenshot,
      screenshotSize: booking.paymentScreenshot ? `${(booking.paymentScreenshot.length / 1024 / 1024).toFixed(2)}MB` : 'No screenshot',
      screenshotPreview: booking.paymentScreenshot ? booking.paymentScreenshot.substring(0, 100) + '...' : null,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    });
  } catch (err) {
    console.error('Debug error:', err);
    res.status(500).json({ error: 'Failed to fetch debug info' });
  }
});

// POST /api/bookings/:id/test-screenshot - Test endpoint to add screenshot
router.post('/:id/test-screenshot', async (req, res) => {
  try {
    const { testScreenshot } = req.body;
    
    if (!testScreenshot) {
      return res.status(400).json({ error: 'No test screenshot provided' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    console.log(`Testing screenshot upload for booking ${req.params.id}`);
    console.log(`Test screenshot size: ${(testScreenshot.length / 1024 / 1024).toFixed(2)}MB`);
    
    booking.paymentScreenshot = testScreenshot;
    const saved = await booking.save();
    
    console.log(`Test screenshot saved successfully`);
    
    const verified = await Booking.findById(req.params.id);
    console.log(`Verified: Has screenshot = ${!!verified.paymentScreenshot}`);
    
    res.json({
      success: true,
      message: 'Test screenshot saved',
      hasScreenshot: !!saved.paymentScreenshot,
      screenshotSize: saved.paymentScreenshot ? `${(saved.paymentScreenshot.length / 1024 / 1024).toFixed(2)}MB` : 'N/A'
    });
  } catch (err) {
    console.error('Test screenshot error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings - Fetch all bookings
router.get('/', async (req, res) => {
  try {
    const { status, date, search, userId } = req.query;
    let query = {};

    if (status) query.status = status;
    if (date) query.date = date;
    if (userId) query.userId = userId;
    if (search) {
      query.$or = [
        { search: { $regex: search, $options: 'i' } },
        { status: { $regex: search, $options: 'i' } }
      ];
    }

    const bookings = await Booking.find(query).sort({ date: 1 });
    
    // Log bookings with screenshot info
    console.log(`Retrieved ${bookings.length} bookings`);
    bookings.forEach(b => {
      console.log(`  - Booking ${b._id.toString().substring(0, 8)}: UserID: ${b.userId || 'NULL'}, Status: ${b.status}`);
    });
    
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// GET /api/bookings/:id - Fetch a specific booking by ID (for polling status)
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    console.log(`=== POLLING CHECK ===`);
    console.log(`Booking ID: ${req.params.id}`);
    console.log(`Current status: ${booking.status}`);
    
    res.json({
      _id: booking._id,
      search: booking.search,
      date: booking.date,
      passengers: booking.passengers,
      status: booking.status,
      hasScreenshot: !!booking.paymentScreenshot,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    });
  } catch (err) {
    console.error('Error fetching booking:', err);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// POST /api/bookings - Create a new booking
router.post('/', async (req, res) => {
  try {
    const { search, date, passengers, userId, className, fullName } = req.body;
    if (!search || !date || !passengers || !userId || !className || !fullName) {
      return res.status(400).json({ error: 'All fields (search, date, passengers, userId, className, fullName) are required.' });
    }

    // Prevent booking for past dates
    const todayStr = new Date().toLocaleDateString('en-CA');
    if (date < todayStr) {
      return res.status(400).json({ error: 'Cannot book for a past date.' });
    }

    // Restrict Mosque slots to Fridays only
    const dayOfWeek = new Date(date).getUTCDay();
    if (search.toLowerCase().includes("mosque") && dayOfWeek !== 5) {
      return res.status(400).json({ error: 'Mosque slots are only available on Fridays.' });
    }

    // Check total persons for this slot and date (Only count confirmed seats)
    const existingBookings = await Booking.find({ search, date, status: 'confirmed' });
    const totalPersons = existingBookings.reduce((acc, b) => acc + b.passengers, 0);
    if (totalPersons + passengers > 45) {
      return res.status(400).json({ error: `Bus is full. Only ${45 - totalPersons} seats remaining.` });
    }

    const newBooking = new Booking({ search, date, passengers, userId, className, fullName, status: 'pending' });
    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save booking' });
  }
});

// PATCH /api/bookings/:id/screenshot - Upload payment screenshot
router.patch('/:id/screenshot', async (req, res) => {
  try {
    console.log('=== SCREENSHOT ENDPOINT ===');
    console.log('Booking ID:', req.params.id);
    console.log('Request body exists:', !!req.body);
    
    if (!req.body || !req.body.paymentScreenshot) {
      console.log('No screenshot in request');
      return res.status(400).json({ error: 'No screenshot provided' });
    }

    const screenshotSize = req.body.paymentScreenshot.length;
    console.log('Screenshot received! Size:', screenshotSize, 'bytes');
    console.log('Screenshot size in MB:', (screenshotSize / 1024 / 1024).toFixed(2) + 'MB');

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      console.log('Booking not found:', req.params.id);
      return res.status(404).json({ error: 'Booking not found' });
    }

    console.log('Attaching screenshot to booking...');
    booking.paymentScreenshot = req.body.paymentScreenshot;
    
    console.log('Saving booking with screenshot...');
    const updatedBooking = await booking.save();
    
    console.log('Booking saved. Verifying...');
    const savedBooking = await Booking.findById(req.params.id);
    
    if (savedBooking.paymentScreenshot) {
      console.log('✓ Screenshot successfully saved!');
      console.log('Saved screenshot size:', (savedBooking.paymentScreenshot.length / 1024 / 1024).toFixed(2) + 'MB');
    } else {
      console.log('⚠ ERROR: Screenshot not found after saving!');
    }
    
    res.json(updatedBooking);
  } catch (err) {
    console.error('=== SCREENSHOT ERROR ===');
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({ error: err.message || 'Failed to upload screenshot' });
  }
});

// PATCH /api/bookings/:id/confirm - Confirm a booking (MUST come before generic /:id route)
router.patch('/:id/confirm', async (req, res) => {
  try {
    console.log('=== CONFIRM ENDPOINT ===');
    console.log('Booking ID:', req.params.id);
    
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      console.log('Booking not found:', req.params.id);
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    console.log('Current booking status:', booking.status);
    console.log('Has screenshot:', !!booking.paymentScreenshot);
    
    if (booking.status === 'confirmed') {
      console.log('Booking already confirmed:', req.params.id);
      return res.json(booking);
    }

    // Check capacity again at confirmation time (Reserved seats only count when confirmed)
    const confirmedBookings = await Booking.find({ 
      search: booking.search, 
      date: booking.date, 
      status: 'confirmed' 
    });
    
    const totalConfirmedSeats = confirmedBookings.reduce((acc, b) => acc + b.passengers, 0);
    
    if (totalConfirmedSeats + booking.passengers > 45) {
      return res.status(400).json({ error: 'Bus is full. Cannot confirm this booking.' });
    }

    console.log('All checks passed, confirming booking...');
    booking.status = 'confirmed';
    
    const updatedBooking = await booking.save();
    console.log('✓ Booking confirmed successfully');
    
    res.json(updatedBooking);
  } catch (err) {
    console.error('=== ERROR IN CONFIRM ENDPOINT ===');
    console.error('Error message:', err.message);
    res.status(500).json({ error: err.message || 'Failed to confirm booking' });
  }
});

// PATCH /api/bookings/:id - Update booking details (generic update)
router.patch('/:id', async (req, res) => {
  try {
    // Don't handle /:id/confirm or /:id/screenshot here - they should be handled by their specific routes
    const updates = req.body || {};
    
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }
    
    const booking = await Booking.findByIdAndUpdate(req.params.id, updates, { new: true });
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (err) {
    console.error('Error updating booking:', err);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});
// DELETE /api/bookings/:id - Delete a booking
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

module.exports = router;