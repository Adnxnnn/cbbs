const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  search: { type: String, required: true },
  date: { type: String, required: true },
  passengers: { type: Number, required: true },
  className: { type: String, default: null },
  fullName: { type: String, default: null },
  userId: { type: String, default: null },
  status: { type: String, default: 'pending' },
  paymentScreenshot: { 
    type: String, 
    default: null,
    get: function(value) {
      // Only return first 100 chars in logs to avoid cluttering console
      return value ? (value.substring(0, 100) + '...') : null;
    }
  },
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);