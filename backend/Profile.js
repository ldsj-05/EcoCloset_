const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  name: String,
  email: String,
  location: {
    latitude: Number,
    longitude: Number
  },
  preferences: {
    style: String
  }
});

module.exports = mongoose.model('Profile', ProfileSchema);