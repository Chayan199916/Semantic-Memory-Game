// app.js
import express from 'express';
import wordsRoutes from './routes/wordsRoutes.js';

const app = express();
const PORT = 3000; // Change the port as needed

// Middleware to parse JSON requests
app.use(express.json());

// Use the wordsRoutes for any routes starting with '/words'
app.use('/words', wordsRoutes);

// Default route
app.get('/', (req, res) => {
    res.send('Hello, this is your API homepage!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
