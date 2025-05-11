const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const pet = require('../controllers/pet.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { authorizeRole } = require('../middleware/roles.middleware');

router.get('/', verifyToken, pet.getPets);
router.get('/:id', verifyToken, pet.getPetById);
router.get('/species/:species', verifyToken, pet.getPetBySpecies);
router.get('/breed/:breed', verifyToken, pet.getPetByBreed);
router.post(
    '/',
    verifyToken,
    upload.single('image'),
    pet.createPet
  );

//Only admin
router.put('/:id', verifyToken, authorizeRole(['admin']), pet.updatePet);
router.delete('/:id', verifyToken, authorizeRole(['admin']), pet.deletePet);

module.exports = router;