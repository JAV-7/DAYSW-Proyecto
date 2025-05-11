const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Name is required'] },
    email: { 
        type: String, 
        required: [true, 'Email is required'], 
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
     },
    password: { type: String, required: [true, 'Password is required'] },
    role: { 
        type: String, 
        required: true,
        enum: [ 'admin', 'client' ], // enum used to restrict role
        default: 'client'
        }
}, { timestamps: true });

// hash password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
      } catch (error) {
        throw new Error(error);
      }
    };
  
const User = mongoose.model('User', userSchema);
  
module.exports = User;