const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// POST book service
router.post('/', async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET my bookings
router.get('/my', async (req, res) => {
  try {
    const bookings = await Booking.find({ userEmail: req.query.email });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE booking
router.delete('/:id', async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;