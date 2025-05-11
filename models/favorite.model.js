// models/favorite.model.js
const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  addedAt: { type: Date, default: Date.now }
});

// Add compound index to ensure unique user-pet pairs
FavoriteSchema.index({ user: 1, pet: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', FavoriteSchema);