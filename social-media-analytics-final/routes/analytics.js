const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// ===== BASIC ANALYTICS ROUTES =====

// Individual account analytics
router.get('/engagement/:username', analyticsController.getEngagementRate);
router.get('/summary/:username', analyticsController.getAccountSummary);
router.get('/performance/:username', analyticsController.getContentPerformance);

// ===== ADVANCED ANALYTICS ROUTES =====

// Growth and trend analysis
router.get('/growth/:username', analyticsController.getGrowthTrend);

// Hashtag analysis
router.get('/hashtags/:username', analyticsController.getHashtagPerformance);

// Timing analysis
router.get('/timing/:username', analyticsController.getOptimalPostingTimes);

// Complete content strategy
router.get('/strategy/:username', analyticsController.getContentStrategy);

// ===== COMPARISON & BATCH ROUTES =====

// Compare multiple accounts
router.get('/compare', analyticsController.compareAccounts);

// Batch analytics for multiple accounts
router.get('/batch', analyticsController.getBatchAnalytics);

// ===== DASHBOARD ROUTES =====

// Complete dashboard summary
router.get('/dashboard/:username', analyticsController.getDashboardSummary);

// ===== UTILITY ROUTES =====

// Service health check
router.get('/health', analyticsController.getAnalyticsHealth);

// Get available accounts
router.get('/accounts', analyticsController.getAvailableAccounts);

// Add this route to list all accounts
router.get('/accounts/list', async (req, res) => {
  try {
    const InstagramAccount = require('../models/InstagramAccount');
    
    const accounts = await InstagramAccount.find({}, 'username displayName isActive lastScrapedAt')
      .sort({ lastScrapedAt: -1 });
    
    res.json({
      success: true,
      accounts: accounts,
      count: accounts.length
    });
    
  } catch (error) {
    console.error('Error listing accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list accounts',
      error: error.message
    });
  }
});



module.exports = router;
