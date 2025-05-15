/**
 * @swagger
 * components:
 *   schemas:
 *     Pet:
 *       type: object
 *       required:
 *         - name
 *         - age
 *         - gender
 *         - breed
 *         - species
 *         - place
 *         - image
 *       properties:
 *         _id:
 *           type: string
 *           description: ID autogenerado de la mascota
 *         name:
 *           type: string
 *         age:
 *           type: integer
 *         gender:
 *           type: string
 *           enum: [female, male, other]
 *         breed:
 *           type: string
 *         species:
 *           type: string
 *           enum: [dog, cat, other]
 *         place:
 *           type: string
 *           description: Ubicación donde se encuentra la mascota
 *         date:
 *           type: string
 *           format: date-time
 *           description: Fecha de registro
 *         image:
 *           type: string
 *           description: URL de la imagen de la mascota
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */


const mongoose = require('mongoose');

const PetSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, 
            required: true,
            enum: [ 'female', 'male', 'other' ]  },
    breed: { type: String, required: true},
    species: {
             type: String,
             required: true,
             enum: [ 'dog', 'cat', 'other' ]
    },
    place: { type: String, required: true},
    date: { type: Date, default: Date.now},
    image: { type: String, required: true}
}, { timestamps: true });

module.exports = mongoose.model('Pet', PetSchema);