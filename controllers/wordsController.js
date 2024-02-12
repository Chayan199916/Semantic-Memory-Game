// controllers/wordsController.js
import * as wordUtils from '../utils/wordUtils1to15.js';

/**
 * Generate a dictionary for a specific age group based on phonetic similarity.
 * @param {string} wordPoolPath - Path to the word pool file.
 * @returns {Object} - Generated dictionary.
 */
function generateDictionary(wordPoolPath, difficulty) {
    const processedWordPool = wordUtils.readWordPool(wordPoolPath);
    const finalDictionary = {};

    processedWordPool.forEach((word, index) => {
        const levenshteinDistances = processedWordPool.map((otherWord, otherIndex) => {
            if (index !== otherIndex) {
                return wordUtils.calculatePhoneticSimilarity(word, otherWord);
            }
            return Infinity; // Ignore comparison with itself
        });

        const kNearestNeighbors = levenshteinDistances
            .map((distance, i) => ({ word: processedWordPool[i], distance }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 5); // Adjust k based on desired level size

        const averageDistance = kNearestNeighbors.reduce((sum, neighbor) => sum + neighbor.distance, 0) / kNearestNeighbors.length;
        const currentDifficultyLevel = wordUtils.defineDifficultyLevel(averageDistance);

        if (!finalDictionary[currentDifficultyLevel]) {
            finalDictionary[currentDifficultyLevel] = [];
        }

        finalDictionary[currentDifficultyLevel].push(word);
    });

    const selectedWords = finalDictionary[difficulty] || [];
    const randomWords = getNRandomElements(selectedWords, 5);

    return randomWords;
}

function getNRandomElements(array, n) {
    const shuffledArray = array.sort(() => Math.random() - 0.5);
    return shuffledArray.slice(0, n);
}


export { generateDictionary };
