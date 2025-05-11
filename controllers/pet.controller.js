const Pet = require('../models/pet.model');

// Create pet
exports.createPet = async (req, res) => {
    try {

        const { name, age, gender, breed, species, place } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'Image file is required.' });
        }

        const petData = {
            name,
            age,
            gender,
            breed,
            species,
            place,
            image: file.filename,
        };

        const pet = await Pet.create(petData);
        res.status(201).json(pet);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all pets
exports.getPets = async (req, res) => {
    try {
        const pets = await Pet.find().sort({ createdAt: -1 });
        res.status(200).json(pets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get pet by species
exports.getPetBySpecies = async (req, res) => {
    try {
        const pets = await Pet.find({ species: req.params.species });
        if (!pets.length) {
            return res.status(404).json({ message: 'No pets found with this species' });
        }
        res.status(200).json(pets);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get pet by breed
exports.getPetByBreed = async (req, res) => {
    try {
        const pets = await Pet.find({ breed: req.params.breed });
        if (!pets.length) {
            return res.status(404).json({ message: 'No pets found with this breed' });
        }
        res.status(200).json(pets);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get pet by id
exports.getPetById = async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id);
        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }
        res.status(200).json(pet);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update pet
exports.updatePet = async (req, res) => {
    try {
        const pet = await Pet.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }
        res.status(200).json(pet);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete pet
exports.deletePet = async (req, res) => {
    try {
        const pet = await Pet.findByIdAndDelete(req.params.id);
        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }
        res.status(200).json({ message: 'Pet has been removed from database' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//Create pet
exports.createPet = async (req, res) => {
    try {
        const { name, age, gender, breed, species, place } = req.body;
        const file = req.file;

        if (!file) {
        return res.status(400).json({ message: 'Image file is required.' });
        }

        const petData = {
        name,
        age,
        gender,
        breed,
        species,
        place,
        image: file.filename, 
        };

        const pet = await Pet.create(petData);
        res.status(201).json(pet);
    } catch(error) {
        res.status(400).json( { message: error.message } );
    }
};

//Get all pets
exports.getPets = async (req, res) => {
    try {
        const pets = await Pet.find();
        res.status(200).json(pets);
    } catch (error) {
        res.status(500).json({ message : error.message });
    }
};

//Get pet by species
exports.getPetBySpecies = async(req, res) =>{
    try {
        const pets = await Pet.find({ species: req.params.species });
        res.status(200).json(pets);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//Get pet by breed
exports.getPetByBreed = async(req, res) => {
    try {
        const pets = await Pet.find({ breed: req.params.breed });
        res.status(200).json(pets);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//Get pet by id
exports.getPetById = async (req, res) => {
    try{
        const pet = await Pet.findById(req.params.id);
        if(!pet) res.status(400).json({ message: "Pet not found !" });
        res.status(200).json(pet);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//Update pet
exports.updatePet = async (req, res) =>{
    try {
        const pet = await Pet.findByIdAndUpdate(req.params.id, req.body, { 
            new: true,
            runValidators: true 
        });
        if (!pet) return res.status(404).json({ message: "Pet not found!" });
        res.status(200).json(pet);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//Delete pet
exports.deletePet = async (req, res) =>{
    try {
        const pet = await Pet.findByIdAndDelete(req.params.id);
        if(!pet) return res.status(400).json( { message: "Pet not found! " });
        res.status(200).json( { message: "Pet has been removed from database!" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};