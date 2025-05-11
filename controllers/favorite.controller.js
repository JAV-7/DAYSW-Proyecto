const Favorite = require('../models/favorite.model');

exports.addFavorite = async (req, res) => {
  try {
    const { userId, petId } = req.body;
    const favorite = await Favorite.create({ user: userId, pet: petId });
    res.status(201).json(favorite);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getFavoritesByUser = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.params.userId }).populate('pet');
    res.status(200).json(favorites);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};