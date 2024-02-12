const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file

const DB_URI = process.env.DB_URI; // Replace with your MongoDB connection string

mongoose.connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
})
    .then(() => console.log('MongoDB connected successfully.'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

module.exports = mongoose;
