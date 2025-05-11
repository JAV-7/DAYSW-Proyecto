const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middleware/auth.middleware.js');
const { authorizeRole, isOwnerOrAdmin } = require('../middleware/roles.middleware.js');
const User = require('../models/user.model'); 
const jwt = require('jsonwebtoken'); 

//Publico
router.post('/', userController.createUser);

//Admin
router.get('/', verifyToken, authorizeRole(['admin']), userController.getUsers);
router.delete('/:id', verifyToken, authorizeRole(['admin']), userController.deleteUser);

//Admin o dueño
router.get('/:id', verifyToken, isOwnerOrAdmin, userController.getUserById);
router.put('/:id', verifyToken, isOwnerOrAdmin, userController.updateUser);

// Login route (using bcrypt password )
router.post('/login', userController.loginUser);

module.exports = router;