// models/favorite.model.js
/**
 * @swagger
 * components:
 *   schemas:
 *     Favorite:
 *       type: object
 *       required:
 *         - user
 *         - pet
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: string
 *           description: ID del usuario
 *         pet:
 *           type: string
 *           description: ID de la mascota
 *         addedAt:
 *           type: string
 *           format: date-time
 */
const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  addedAt: { type: Date, default: Date.now }
});

// Add compound index to ensure unique user-pet pairs
FavoriteSchema.index({ user: 1, pet: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', FavoriteSchema);