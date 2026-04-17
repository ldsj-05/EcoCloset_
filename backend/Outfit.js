const mongoose = require('mongoose');

const outfitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  items: [{
    _id: String,
    name: String,
    category: String,
    color: String,
    imageUri: String,
  }],
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Add this to see the collection name
module.exports = mongoose.model('Outfit', outfitSchema);