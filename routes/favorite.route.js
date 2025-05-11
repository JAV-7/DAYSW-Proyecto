const express = require('express');
const router = express.Router();
const controllerFavorite = require('../controllers/favorite.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Add a pet to favorites
router.post('/', verifyToken, controllerFavorite.addFavorite);

// Remove a pet from favorites
router.delete('/:petId', verifyToken, controllerFavorite.removeFavorite);

// Get all favorites for the authenticated user
router.get('/', verifyToken, controllerFavorite.getUserFavorites);

module.exports = router;