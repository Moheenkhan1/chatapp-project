const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');  // Import the auth routes

dotenv.config();  // Load environment variables from .env file

const app = express();

// Middleware to parse JSON body
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Use the authentication routes
app.use('/auth', authRoutes);

// Example protected route (optional)
app.get('/protected', (req, res) => {
  res.status(200).json({ message: 'This is a protected route' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
