// routes/wordsRoutes.js
import express from 'express';
import * as wordsController from '../controllers/wordsController.js';

const router = express.Router();

router.get('/generate-dictionary/:ageGroup/:difficultyLevel', (req, res) => {
    const { ageGroup, difficultyLevel } = req.params;
    const wordPoolPath = `./assets/wordpool_${ageGroup}.txt`; // Adjust the file name based on your naming convention
    const wordList = wordsController.generateDictionary(wordPoolPath, difficultyLevel);

    res.json(wordList);
});

export default router;
