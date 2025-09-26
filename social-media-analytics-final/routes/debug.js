// Add this route to check what's actually in the database
const express = require('express');
const router = express.Router();
const InstagramAccount = require('../models/InstagramAccount');
const InstagramPost = require('../models/InstagramPost');

// Debug endpoint to see all accounts
router.get('/accounts', async (req, res) => {
  try {
    console.log('Debug: Checking all accounts in database');
    
    // Get all Instagram accounts
    const accounts = await InstagramAccount.find({}).select('username displayName isActive lastScrapedAt createdAt');
    console.log('Found accounts:', accounts);
    
    // Get posts count for each account
    const accountsWithCounts = await Promise.all(
      accounts.map(async (account) => {
        const postsCount = await InstagramPost.countDocuments({ accountUsername: account.username });
        return {
          ...account.toObject(),
          postsCount
        };
      })
    );
    
    res.json({
      success: true,
      accounts: accountsWithCounts,
      total: accountsWithCounts.length
    });
    
  } catch (error) {
    console.error('Debug accounts error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug failed',
      error: error.message
    });
  }
});

module.exports = router;
