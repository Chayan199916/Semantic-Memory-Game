import fs from 'fs';
import * as tf from '@tensorflow/tfjs-node';
import * as use from '@tensorflow-models/universal-sentence-encoder';

/**
 * Read a word pool from a file, convert to lowercase, and remove special characters.
 * @param {string} filePath - Path to the word pool file.
 * @returns {string[]} - Processed word pool.
 */
function readWordPool(filePath) {
    const wordPool = fs.readFileSync(filePath, 'utf-8').split('\n');
    return wordPool.map(word => word.toLowerCase().replace(/[^a-z]/g, ''));
}

async function loadModelWithRetry(modelLoadFunction, maxRetries = 3) {
    let retries = 0;

    while (retries < maxRetries) {
        try {
            return await modelLoadFunction();
        } catch (error) {
            console.error(`Error loading model (retry ${retries + 1}):`, error);
            retries++;
        }
    }

    throw new Error(`Failed to load model after ${maxRetries} retries`);
}

/**
 * Function to obtain USE embeddings for a given word.
 * @param {string} word - The word to obtain embeddings for.
 * @returns {number[]} - USE embeddings for the word.
 */
async function getUseEmbeddings(word) {
    try {
        console.log('Loading USE model...');
        const model = await loadModelWithRetry(() => use.load());
        console.log('USE model loaded successfully.');

        const embeddings = await model.embed([word]);
        return embeddings.arraySync();
    } catch (error) {
        console.error('Error obtaining USE embeddings:', error);
        // Handle the error appropriately
    }
}


/**
 * Calculate the cosine similarity between two vectors.
 * @param {number[]} vector1 - The first vector.
 * @param {number[]} vector2 - The second vector.
 * @returns {number} - Cosine similarity score.
 */
function calculateCosineSimilarity(vector1, vector2) {
    const dotProduct = tf.tensor(vector1).dot(tf.tensor(vector2));
    const norm1 = tf.tensor(vector1).norm();
    const norm2 = tf.tensor(vector2).norm();

    const similarity = dotProduct.div(norm1.mul(norm2)).dataSync()[0];
    return similarity;
}

/**
 * Calculate the semantic similarity between two words using USE embeddings.
 * @param {string} word1 - The first word.
 * @param {string} word2 - The second word.
 * @returns {number} - Semantic similarity score.
 */
async function calculateSemanticSimilarity(word1, word2) {
    const embeddings1 = await getUseEmbeddings(word1);
    const embeddings2 = await getUseEmbeddings(word2);

    return calculateCosineSimilarity(embeddings1, embeddings2);
}

/**
 * Define difficulty level based on semantic similarity.
 * @param {number} similarityScore - The semantic similarity score between two words.
 * @param {number} scale - Scaling factor for difficulty thresholds.
 * @returns {number} - Difficulty level.
 */
function defineDifficultyLevel(similarityScore, scale = 3) {
    const scaledScore = similarityScore * scale;

    // Define your difficulty thresholds based on your specific requirements
    const hardThreshold = 0.7;
    const mediumThreshold = 0.5;

    if (scaledScore >= hardThreshold) {
        return 3; // High difficulty
    } else if (scaledScore >= mediumThreshold) {
        return 2; // Medium difficulty
    } else {
        return 1; // Low difficulty
    }
}

export { readWordPool, calculateSemanticSimilarity, defineDifficultyLevel };
