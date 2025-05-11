// STARTING FILE FOR SERVER. TO RUN, TYPE 'node server.js' 
require('dotenv').config(); // Load environment variables first

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');


app.use(cors({ // Enables CORS for security purposes
  origin: `http://localhost:5500`, // or your frontend origin
  credentials: true
}));
app.use(express.json()); // to parse JSON from frontend
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // ensures images can be accessed


mongoose.connect(process.env.MONGODB_URI, { // Basic MongoDB connection 
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

app.use(express.static(path.join(__dirname, 'interfaces')));

// ROUTES
const userRoutes = require('./routes/user.route');
const petRoutes = require('./routes/pet.route');
const adoptionRoutes = require('./routes/adoption.route');
const favoriteRoutes = require('./routes/favorite.route');

app.use('/api/users', userRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/adoptions', adoptionRoutes);
app.use('/api/favorites', favoriteRoutes);

app.use((err, req, res, next) => { // Basic error handling
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// START SERVER ON PORT 
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


// debug test
app.get('/api/ping', (req, res) => {
  res.json({ message: 'Backend activated' });
  console.log('Ping received from frontend!');
});