const express = require('express');
const router = express.Router();

// Example data - you can later fetch this from MongoDB
const slotsData = {
  MOSQUE: ["Mosque Slot 1", "Mosque Slot 2", "Mosque Slot 3", "Mosque Slot 4"],
  EVENING: ["Evening Slot 1", "Evening Slot 2", "Evening Slot 3", "Evening Slot 4"],
};

// GET /api/home/data
router.get('/data', (req, res) => {
  res.json({ slotsData });
});

module.exports = router;
