const express = require('express');
const router = express.Router();
const controllerAdoption = require('../controllers/adoption.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/', verifyToken, controllerAdoption.registerAdoption);
router.get('/:userId', verifyToken, controllerAdoption.getAdoptionsByUser);

module.exports = router;