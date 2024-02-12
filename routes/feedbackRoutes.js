const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

router.post('/submit', feedbackController.submitFeedback);
router.get('/all', feedbackController.getAllFeedback); // Implement authentication as needed

module.exports = router;
