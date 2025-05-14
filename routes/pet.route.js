//Pet route
const express = require('express');
const router = express.Router();
const petController = require('../controllers/pet.controller');
const { authorizeRole } = require('../middleware/roles.middleware');
const { verifyToken } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');

/**
 * @swagger
 * tags:
 *   name: Pets
 *   description: Pet management
 */

/**
 * @swagger
 * /pets:
 *   get:
 *     summary: Get all pets
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of pets
 */

/**
 * @swagger
 * /pets/{id}:
 *   get:
 *     summary: Get pet by ID
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pet retrieved
 */

/**
 * @swagger
 * /pets/species/{species}:
 *   get:
 *     summary: Get pets by species
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: species
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pets by species
 */

/**
 * @swagger
 * /pets/breed/{breed}:
 *   get:
 *     summary: Get pets by breed
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: breed
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pets by breed
 */

// PUBLIC ROUTES
router.get('/', verifyToken, petController.getPets);
router.get('/:id', verifyToken, petController.getPetById);
router.get('/species/:species', verifyToken, petController.getPetBySpecies);
router.get('/breed/:breed', verifyToken, petController.getPetByBreed);
router.post('/', verifyToken, authorizeRole(['client']), upload.single('image'), petController.createPet);


// ADMIN ROUTES
router.post('/', verifyToken, authorizeRole(['admin']), upload.single('image'), petController.createPet);
router.put('/:id', verifyToken, authorizeRole(['admin']), petController.updatePet);
router.delete('/:id', verifyToken, authorizeRole(['admin']), petController.deletePet);


module.exports = router;