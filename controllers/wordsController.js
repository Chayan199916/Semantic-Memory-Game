import * as wordUtils from '../utils/wordUtils1to15.js'; // Update the import to use the modified wordUtils.js file

/**
 * Generate a dictionary for a specific age group based on semantic similarity.
 * @param {string} wordPoolPath - Path to the word pool file.
 * @returns {Object} - Generated dictionary.
 */
function generateDictionary(wordPoolPath, difficulty) {
    const processedWordPool = wordUtils.readWordPool(wordPoolPath);
    const finalDictionary = {};

    processedWordPool.forEach((word, index) => {
        const semanticSimilarities = processedWordPool.map((otherWord, otherIndex) => {
            if (index !== otherIndex) {
                return wordUtils.calculateSemanticSimilarity(word, otherWord);
            }
            return 0; // Ignore comparison with itself
        });

        const kNearestNeighbors = semanticSimilarities
            .map((similarity, i) => ({ word: processedWordPool[i], similarity }))
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 5); // Adjust k based on desired level size

        const averageSimilarity = kNearestNeighbors.reduce((sum, neighbor) => sum + neighbor.similarity, 0) / kNearestNeighbors.length;
        const currentDifficultyLevel = wordUtils.defineDifficultyLevel(averageSimilarity);

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
