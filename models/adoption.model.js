// models/adoption.model.js
const mongoose = require('mongoose');

const AdoptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  date: { type: String, required: true } 
});

module.exports = mongoose.model('Adoption', AdoptionSchema);