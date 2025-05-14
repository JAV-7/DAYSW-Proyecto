// favorite.route
const express = require('express');
const router = express.Router();
const controllerFavorite = require('../controllers/favorite.controller');
const { verifyToken } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: Favorite pets
 */

/**
 * @swagger
 * /favorites:
 *   get:
 *     summary: Get all favorite pets for the current user
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of favorites
 */

/**
 * @swagger
 * /favorites:
 *   post:
 *     summary: Add a pet to favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pet:
 *                 type: string
 *     responses:
 *       201:
 *         description: Favorite added
 */

/**
 * @swagger
 * /favorites/{petId}:
 *   delete:
 *     summary: Remove a pet from favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Favorite removed
 */



// Add a pet to favorites
router.post('/', verifyToken, controllerFavorite.addFavorite);

// Remove a pet from favorites
router.delete('/:petId', verifyToken, controllerFavorite.removeFavorite);

// Get all favorites for the authenticated user
router.get('/', verifyToken, controllerFavorite.getUserFavorites);

module.exports = router;