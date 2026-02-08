const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  bookingDate: { type: Date, required: true },
  price: { type: Number, required: true }
});

module.exports = mongoose.model('Booking', bookingSchema);