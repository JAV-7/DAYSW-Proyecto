const express = require('express');
const router = express.Router();
const controllerFavorite = require('../controllers/favorite.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/', verifyToken, controllerFavorite.addFavorite);
router.get('/:userId', verifyToken, controllerFavorite.getFavoritesByUser);

module.exports = router;