const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middleware/auth.middleware.js');
const { authorizeRole, isOwnerOrAdmin } = require('../middleware/roles.middleware.js');
const User = require('../models/user.model'); 
const jwt = require('jsonwebtoken'); 

//Publico
router.post('/', userController.createUser);
router.post('/login', userController.loginUser);

// User profile routes - Must come before /:id routes
router.get('/profile', verifyToken, userController.getCurrentUser);
router.put('/profile', verifyToken, userController.updateCurrentUser);
router.delete('/profile', verifyToken, userController.deleteCurrentUser);

//Admin
router.get('/', verifyToken, authorizeRole(['admin']), userController.getUsers);
router.delete('/:id', verifyToken, authorizeRole(['admin']), userController.deleteUser);

//Admin o dueño
router.get('/:id', verifyToken, isOwnerOrAdmin, userController.getUserById);
router.put('/:id', verifyToken, isOwnerOrAdmin, userController.updateUser);

module.exports = router;