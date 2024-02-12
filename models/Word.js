const mongoose = require('mongoose');

const wordSchema = new mongoose.Schema({
    word: {
        type: String,
        required: true,
    },
    difficultyLevel: {
        type: Number,
        enum: [1, 2, 3, 4, 5], // Replace with your desired difficulty levels
        required: true,
    },
    parentWord: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Word',
        default: null,
    },
});

module.exports = mongoose.model('Word', wordSchema);
