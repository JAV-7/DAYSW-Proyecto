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
        
        // Generate JWT token - Use consistent approach with loginUser function
        const jwtSecret = process.env.JWT_SECRET || '123xyz';
        
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            jwtSecret,
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
        // Only admins can update roles
        if (req.body.role && req.user.role !== 'admin') delete req.body.role;

        // Check if email is being updated and if it's already in use
        if (req.body.email) {
            const existingUser = await User.findOne({ 
                email: req.body.email, 
                _id: { $ne: req.params.id } // Exclude current user
            });
            
            if (existingUser) {
                return res.status(400).json({ 
                    error: "Validation failed",
                    details: {
                        email: "Email already in use"
                    }
                });
            }
        }
        
        // Find the user first to trigger pre-save middleware for password
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        // Update user fields
        if (req.body.name) user.name = req.body.name;
        if (req.body.email) user.email = req.body.email;
        if (req.body.password) user.password = req.body.password; // This will trigger password hash
        if (req.body.role && req.user.role === 'admin') user.role = req.body.role;
        
        // Save the user - this will trigger the pre-save hook for password hashing
        await user.save();
        
        // Don't send password back
        user.password = undefined;
        
        res.json(user);
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
        console.log('User in request:', req.user);
        console.log('User ID being used for lookup:', req.user.id);
        
        const user = await User.findById(req.user.id);
        if (!user) {
            console.log('User not found with ID:', req.user.id);
            return res.status(404).json({ message: 'User not found' });
        }
        
        console.log('User found:', user._id);
        
        // Don't send password back
        user.password = undefined;
        
        res.json(user);
    } catch (err) {
        console.error('Error in getCurrentUser:', err);
        res.status(400).json({ error: err.message });
    }
};

// Actualizar datos del usuario autenticado (cliente)
exports.updateCurrentUser = async (req, res) => {
    try {
        // Impedir que se actualice el rol
        if (req.body.role) delete req.body.role;

        // Check if email is being updated and if it's already in use
        if (req.body.email) {
            const existingUser = await User.findOne({ 
                email: req.body.email, 
                _id: { $ne: req.user.id } // Exclude current user
            });
            
            if (existingUser) {
                return res.status(400).json({ 
                    error: "Validation failed",
                    details: {
                        email: "Email already in use"
                    }
                });
            }
        }
        
        // Find the user first, then update fields individually
        // This approach will trigger the pre-save middleware for password hashing
        const user = await User.findById(req.user.id);
        
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        // Update user fields
        if (req.body.name) user.name = req.body.name;
        if (req.body.email) user.email = req.body.email;
        if (req.body.password) user.password = req.body.password; // This will be hashed by the pre-save hook
        
        // Save the user - this will trigger the pre-save hook to hash the password
        await user.save();
        
        // Don't send password back
        user.password = undefined;
        
        res.json(user);
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
        res.status(400).json({ error: err.message });
    }
};

// Delete current user's account
exports.deleteCurrentUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'Your account has been deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};