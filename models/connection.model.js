/**
 * @swagger
 * components:
 *   schemas:
 *     Connection:
 *       type: object
 *       required:
 *         - userId
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         status:
 *           type: string
 *           enum: [online, offline]
 *         lastSeen:
 *           type: string
 *           format: date-time
 *         socketId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const mongoose = require('mongoose');


const connectionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    status: {
        type: String,
        enum: ['online', 'offline'],
        default: 'offline'
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    socketId: {
        type: String
    }
}, { timestamps: true });

const Connection = mongoose.model('Connection', connectionSchema);

module.exports = Connection; 