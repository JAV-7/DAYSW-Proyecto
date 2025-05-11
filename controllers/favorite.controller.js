const Favorite = require('../models/favorite.model');
const Pet = require('../models/pet.model');

exports.addFavorite = async (req, res) => {
  try {
    const { petId } = req.body;
    
    if (!petId) {
      return res.status(400).json({ error: 'Pet ID is required' });
    }

    // Check if pet exists
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      user: req.user.id,  // Using the authenticated user's ID from the token
      pet: petId
    });

    if (existingFavorite) {
      return res.status(400).json({ error: 'Pet already in favorites' });
    }

    const favorite = await Favorite.create({ 
      user: req.user.id,  // Ensure we're using the user ID from the token
      pet: petId 
    });
    
    res.status(201).json(favorite);
  } catch (err) {
    console.error('Error adding favorite:', err);
    res.status(400).json({ 
      error: err.message,
      details: err.errors // Include validation error details
    });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const { petId } = req.params;
    
    const favorite = await Favorite.findOneAndDelete({ 
      user: req.user.id, 
      pet: petId 
    });

    if (!favorite) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.status(200).json({ message: 'Favorite removed' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getUserFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id })
      .populate({
        path: 'pet',
        select: 'name age breed species place image'
      });
    
    // Transform to include isFavorited flag
    const favoritePets = favorites.map(fav => ({
      ...fav.pet.toObject(),
      isFavorited: true,
      _id: fav.pet._id
    }));
    
    res.status(200).json(favoritePets);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.checkFavoriteStatus = async (req, res) => {
  try {
      const { petId } = req.params;
      
      const favorite = await Favorite.findOne({
          user: req.user.id,
          pet: petId
      });

      res.status(200).json({ isFavorited: !!favorite });
  } catch (err) {
      res.status(400).json({ error: err.message });
  }
};