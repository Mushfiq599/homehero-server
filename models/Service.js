const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  providerName: { type: String, required: true },
  providerEmail: { type: String, required: true },
  reviews: [{ rating: Number, comment: String, userEmail: String }] // For challenge
});

module.exports = mongoose.model('Service', serviceSchema);