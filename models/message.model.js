/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       required:
 *         - chatId
 *         - sender
 *         - senderName
 *         - content
 *       properties:
 *         _id:
 *           type: string
 *         chatId:
 *           type: string
 *         sender:
 *           type: string
 *           description: ID del usuario que envió el mensaje
 *         senderName:
 *           type: string
 *         content:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *         read:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    chatId: {
        type: String,
        required: true,
        index: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderName: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Índices para búsquedas eficientes
messageSchema.index({ chatId: 1, timestamp: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message; 