// models/adoption.model.js

/**
 * @swagger
 * components:
 *   schemas:
 *     Adoption:
 *       type: object
 *       required:
 *         - user
 *         - pet
 *         - date
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: string
 *           description: ID del usuario que adopta
 *         pet:
 *           type: string
 *           description: ID de la mascota adoptada
 *         date:
 *           type: string
 *           description: Fecha en que se realizó la adopción
 */

const mongoose = require('mongoose');


const AdoptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  date: { type: String, required: true } 
});

module.exports = mongoose.model('Adoption', AdoptionSchema);