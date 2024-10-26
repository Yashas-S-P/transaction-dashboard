const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  id: Number,
  title: String,
  price: Number,
  description: String,
  category: String,
  sold: Boolean,
  dateOfSale: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);