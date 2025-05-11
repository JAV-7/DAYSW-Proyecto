const Adoption = require('../models/adoption.model');

exports.registerAdoption = async (req, res) => {
  try {
    const { userId, petId, date } = req.body;
    const adoption = await Adoption.create({ user: userId, pet: petId, date });
    res.status(201).json(adoption);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAdoptionsByUser = async (req, res) => {
  try {
    const adoptions = await Adoption.find({ user: req.params.userId }).populate('pet');
    res.status(200).json(adoptions);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};