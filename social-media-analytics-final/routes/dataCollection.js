const express = require('express');
const router = express.Router();
const dataCollectionController = require('../controllers/dataCollectionController');

// Existing POST routes
router.post('/trigger', dataCollectionController.triggerCollection);
router.post('/scrape/:username', dataCollectionController.scrapeAccount);

// NEW GET ROUTES FOR TESTING
router.get('/stats', dataCollectionController.getCollectionStats);
router.get('/credits', dataCollectionController.getCreditsStatus);
router.get('/accounts', dataCollectionController.getAllAccounts);
router.get('/accounts/:username', dataCollectionController.getAccountDetails);
router.get('/posts', dataCollectionController.getAllPosts);
router.get('/posts/recent', dataCollectionController.getRecentPosts);
router.get('/posts/:username', dataCollectionController.getPostsByAccount);
router.get('/hashtags/trending', dataCollectionController.getTrendingHashtags);
router.get('/health', dataCollectionController.healthCheck);

module.exports = router;
