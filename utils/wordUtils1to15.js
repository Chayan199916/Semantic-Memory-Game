import pipeline from 'transformers';
import fs from 'fs';
import * as tf from '@tensorflow/tfjs-node';

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
 * Tokenize and obtain BERT embeddings for a given word.
 * @param {string} word - The word to tokenize and obtain embeddings for.
 * @returns {number[]} - BERT embeddings for the word.
 */
async function getBertEmbeddings(word) {
    const nerPipeline = await pipeline('feature-extraction', { model: 'bert-base-uncased' });
    const embeddings = await nerPipeline(word);
    return embeddings[0]; // Assuming the first element of embeddings contains the features
}

/**
 * Calculate the semantic similarity between two words using BERT embeddings.
 * @param {string} word1 - The first word.
 * @param {string} word2 - The second word.
 * @returns {number} - Semantic similarity score.
 */
function calculateSemanticSimilarity(word1, word2) {
    const embeddings1 = getBertEmbeddings(word1);
    const embeddings2 = getBertEmbeddings(word2);

    // Calculate cosine similarity between the embeddings
    const dotProduct = tf.tensor(embeddings1).mul(tf.tensor(embeddings2)).sum();
    const norm1 = tf.norm(tf.tensor(embeddings1));
    const norm2 = tf.norm(tf.tensor(embeddings2));
    const cosineSimilarity = dotProduct.div(tf.mul(norm1, norm2));

    // Convert the TensorFlow tensor to a JavaScript number
    const similarityScore = cosineSimilarity.arraySync();

    return similarityScore;
}

/**
 * Define difficulty level based on semantic similarity.
 * @param {number} similarityScore - The semantic similarity score between two words.
 * @param {number} scale - Scaling factor for difficulty thresholds.
 * @returns {number} - Difficulty level.
 */
function defineDifficultyLevel(similarityScore, scale = 3) {
    // Define difficulty thresholds based on your specific requirements
    const difficultyThresholds = [0.5, 0.7, 0.9];

    // Scale the similarity score to provide a larger range
    const scaledSimilarity = similarityScore * scale;

    // Map the scaled similarity score to the range [1, 2, 3]
    for (let i = 0; i < difficultyThresholds.length; i++) {
        if (scaledSimilarity >= difficultyThresholds[i]) {
            return i + 1;
        }
    }

    return difficultyThresholds.length + 1;
}

export { readWordPool, calculateSemanticSimilarity, defineDifficultyLevel };
