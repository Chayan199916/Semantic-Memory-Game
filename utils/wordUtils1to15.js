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

async function loadModelWithRetry(modelUrl, options, maxRetries = 3) {
    let retries = 0;

    while (retries < maxRetries) {
        try {
            return await tf.loadGraphModel(modelUrl, options);
        } catch (error) {
            console.error(`Error loading model (retry ${retries + 1}):`, error);
            retries++;
        }
    }

    throw new Error(`Failed to load model after ${maxRetries} retries`);
}

/**
 * function to obtain BERT embeddings for a given word.
 * @param {string} word - The word to tokenize and obtain embeddings for.
 * @returns {number[]} - BERT embeddings for the word.
 */
async function getBertEmbeddings(word) {
    try {
        // Load the pre-trained BERT model with timeout handling
        const modelPromise = loadModelWithRetry('https://tfhub.dev/google/bert_uncased_L-12_H-768_A-12/3', {
            timeout: 10000
        });

        // Load the BERT tokenizer with timeout handling
        const tokenizerPromise = loadModelWithRetry('https://tfhub.dev/tensorflow/bert_en_uncased_preprocess/3', {
            timeout: 10000
        });

        // Wait for both models to load concurrently
        const [model, tokenizer] = await Promise.all([modelPromise, tokenizerPromise]);

        // Tokenize the input word
        const [inputIds, inputMask] = tokenizer.tokenize([word]);

        // Prepare the input for the model
        const inputTensor = {
            input_ids: tf.tensor(inputIds),
            input_mask: tf.tensor(inputMask),
            segment_ids: tf.zeros([1, inputIds.length]) // Assuming single sentence input
        };

        // Run the model and extract the embeddings
        const embeddings = model.execute(inputTensor, 'pooled_output').arraySync();

        return embeddings[0];
    } catch (error) {
        console.error('Error obtaining BERT embeddings:', error);
        // Handle the error appropriately, e.g., retry, provide feedback to the user
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
 * Calculate the semantic similarity between two words using BERT embeddings.
 * @param {string} word1 - The first word.
 * @param {string} word2 - The second word.
 * @returns {number} - Semantic similarity score.
 */
async function calculateSemanticSimilarity(word1, word2) {
    const embeddings1 = await getBertEmbeddings(word1);
    const embeddings2 = await getBertEmbeddings(word2);

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
