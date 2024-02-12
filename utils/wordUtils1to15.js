// utils/wordUtils.js
import natural from "natural";
import fs from "fs";

const DIFFICULTY_THRESHOLDS = [1, 2, 3];

/**
 * Read a word pool from a file, convert to lowercase, and remove special characters.
 * @param {string} filePath - Path to the word pool file.
 * @returns {string[]} - Processed word pool.
 */
function readWordPool(filePath) {
    const wordPool = fs.readFileSync(filePath, 'utf-8').split('\n');
    return wordPool.map(word => word.toLowerCase().replace(/[^a-z]/g, ''));
}

/**
 * Calculate the phonetic similarity between two words using Levenshtein distance.
 * @param {string} word1 - The first word.
 * @param {string} word2 - The second word.
 * @returns {number} - Phonetic similarity score.
 */
function calculatePhoneticSimilarity(word1, word2) {
    const levenshteinDist = natural.LevenshteinDistance(word1, word2);
    return 1 / (1 + levenshteinDist);
}

/**
 * Define difficulty level based on Levenshtein distance.
 * @param {number} levenshteinDistance - The Levenshtein distance between two words.
 * @returns {number} - Difficulty level.
 */
function defineDifficultyLevel(levenshteinDistance, scale = 3) {
    const difficultyThresholds = [1, 2, 3];

    // Scale the distances to provide a larger range
    const scaledDistance = Math.round((levenshteinDistance * scale) * 100) - 23;

    // Map the max distance to the range [1, 2, 3]
    for (let i = 0; i < difficultyThresholds.length; i++) {
        if (scaledDistance <= difficultyThresholds[i]) {
            return i + 1;
        }
    }

    return difficultyThresholds.length + 1;
}



export { readWordPool, calculatePhoneticSimilarity, defineDifficultyLevel };
