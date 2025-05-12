const Pet = require('../models/pet.model');

//Create pet 
exports.createPet = async (req, res) => {
    try {
        const { name, age, gender, breed, species, place } = req.body;

        const image = req.file ? req.file.filename : null;
        if (!image) return res.status(400).json({ message: "Image is required." });

        const pet = await Pet.create({
            name,
            age,
            gender,
            breed,
            species,
            place,
            image
        });

        res.status(201).json(pet);
    } catch(error) {
        res.status(400).json({ message: error.message });
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

//Update pet (admin)
exports.updatePet = async (req, res) => {
    try {
        const pet = await Pet.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { 
                new: true,
                runValidators: true 
            }
        );
        if (!pet) return res.status(404).json({ message: "Pet not found!" });
        res.status(200).json({
            status: 'success',
            data: {
                pet
            }
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                details: messages
            });
        }
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

//Delete pet (admin)
exports.deletePet = async (req, res) => {
    try {
        const pet = await Pet.findByIdAndDelete(req.params.id);
        if(!pet) return res.status(404).json({ 
            status: 'error',
            message: "Pet not found!" 
        });
        res.status(200).json({ 
            status: 'success',
            message: "Pet successfully deleted",
            data: null
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};