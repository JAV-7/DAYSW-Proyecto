// Adoption.route
const express = require('express');
const router = express.Router();
const controllerAdoption = require('../controllers/adoption.controller');
const { verifyToken } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Adoptions
 *   description: Register and retrieve pet adoptions
 */

/**
 * @swagger
 * /adoptions:
 *   post:
 *     summary: Register a new adoption
 *     tags: [Adoptions]
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
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Adoption recorded
 */

/**
   * @swagger
   * /adoptions/{userId}:
   *   get:
   *     summary: Get adoptions by user ID
   *     tags: [Adoptions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of adoptions
   */

router.post('/', verifyToken, controllerAdoption.registerAdoption);
router.get('/:userId', verifyToken, controllerAdoption.getAdoptionsByUser);

module.exports = router;