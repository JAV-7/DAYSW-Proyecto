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