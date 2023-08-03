const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  type: String,
  name: String,
  description: String,
  battlePoints: Number,
});

const card = mongoose.model('Card', cardSchema);

module.exports = card;
