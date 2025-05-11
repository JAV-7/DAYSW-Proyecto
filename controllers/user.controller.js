const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

// Create User
exports.createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ 
                error: "Validation failed",
                details: {
                    name: !name ? "Name is required" : undefined,
                    email: !email ? "Email is required" : undefined,
                    password: !password ? "Password is required" : undefined
                }
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                error: "Validation failed",
                details: {
                    email: "Email already in use"
                }
            });
        }

        // Create new user
        const user = await User.create({ name, email, password });
        
        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Don't send password back
        user.password = undefined;

        res.status(201).json({
            status: 'success',
            token,
            data: {
                user
            }
        });

    } catch (err) {
        // Handle Mongoose validation errors
        if (err.name === 'ValidationError') {
            const errors = {};
            Object.keys(err.errors).forEach(key => {
                errors[key] = err.errors[key].message;
            });
            return res.status(400).json({ 
                error: "Validation failed",
                details: errors
            });
        }
        res.status(500).json({ 
            error: "Server error",
            message: err.message 
        });
    }
};

// USERS INDEX
exports.getUsers = async (req, res) => {
    const users = await User.find();
    res.json(users);
};

// Get User by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User no found.' });
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        if (req.body.role && req.user.role !== 'admin') delete req.body.role;
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) return res.status(404).json({ message: 'User no found.' });
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User no found.' });
        res.json({ message: 'User was deleted' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// loginUser function in user.controller.js
exports.loginUser = async (req, res) => {
    console.log('Login attempt for:', req.body.email);
    
    if (!req.body || !req.body.email || !req.body.password) {
        console.log('Missing login fields:', req.body);
        return res.status(400).json({ error: 'Email and password required' });
    }
    
    const { email, password } = req.body;
    
    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found:', email);
            return res.status(404).json({ error: 'User not found' });
        }
        
        console.log('Found user, checking password');
        const isMatch = await user.comparePassword(password);
        
        if (!isMatch) {
            console.log('Password mismatch for:', email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Use JWT_SECRET with fallback for development
        const jwtSecret = process.env.JWT_SECRET || '123xyz';
        
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            jwtSecret,
            { expiresIn: '1h' }
        );
        
        console.log('Login successful for:', email);
        res.json({ token });
        
    } catch (error) {
        console.error('Login error details:', error);
        res.status(500).json({ 
            error: 'Server Error', 
            message: error.message,
            stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack 
        });
    }
};



// Obtener usuario autenticado (cliente)
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Actualizar datos del usuario autenticado (cliente)
exports.updateCurrentUser = async (req, res) => {
    try {
        // Impedir que se actualice el rol
        if (req.body.role) delete req.body.role;

        const user = await User.findByIdAndUpdate(req.user.userId, req.body, { new: true });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};