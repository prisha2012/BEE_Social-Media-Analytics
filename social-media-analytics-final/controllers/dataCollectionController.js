const apifyService = require('../services/apifyService');
const { InstagramAccount, InstagramPost } = require('../models');

const dataCollectionController = {
    // POST routes (existing)
    async triggerCollection(req, res) {
        try {
            console.log('🚀 Manual data collection triggered');
            const results = await apifyService.collectAllData();
            
            res.json({
                success: true,
                message: 'Data collection completed',
                results,
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Collection error:', error);
            res.status(500).json({
                success: false,
                message: 'Data collection failed',
                error: error.message
            });
        }
    },

    async scrapeAccount(req, res) {
        try {
            const { username } = req.params;
            
            if (!username) {
                return res.status(400).json({
                    success: false,
                    message: 'Username is required'
                });
            }

            console.log(`🔄 Scraping account: ${username}`);
            const result = await apifyService.scrapeInstagramAccount(username);
            
            if (result && result.success === false) {
                return res.status(400).json({
                    success: false,
                    message: result.message || 'Scraping failed',
                    error: result.error
                });
            }
            
            if (result && result.success === true) {
                return res.json({
                    success: true,
                    message: `Successfully scraped ${username}`,
                    count: result.count || 0,
                    data: result.data ? result.data.slice(0, 5) : []
                });
            }
            
            if (Array.isArray(result)) {
                return res.json({
                    success: true,
                    message: `Successfully scraped ${username}`,
                    count: result.length,
                    data: result.slice(0, 5)
                });
            }
            
            res.json({
                success: false,
                message: 'No data returned',
                count: 0,
                data: []
            });

        } catch (error) {
            console.error('Scrape error:', error);
            res.status(500).json({
                success: false,
                message: 'Scraping failed',
                error: error.message
            });
        }
    },

    // NEW GET ROUTES FOR TESTING
    async getCollectionStats(req, res) {
        try {
            const accountCount = await InstagramAccount.countDocuments();
            const postCount = await InstagramPost.countDocuments();
            const recentPosts = await InstagramPost.countDocuments({
                collection_date: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            });

            // Top accounts by follower count
            const topAccounts = await InstagramAccount.find()
                .sort({ follower_count: -1 })
                .limit(5)
                .select('username display_name follower_count verification_status');

            res.json({
                success: true,
                stats: {
                    total_accounts: accountCount,
                    total_posts: postCount,
                    posts_last_24h: recentPosts,
                    top_accounts: topAccounts,
                    last_updated: new Date()
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    async getCreditsStatus(req, res) {
        try {
            const credits = await apifyService.checkCredits();
            res.json({
                success: true,
                credits
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    async getAllAccounts(req, res) {
        try {
            const { limit = 10, page = 1 } = req.query;
            const skip = (page - 1) * limit;

            const accounts = await InstagramAccount.find()
                .sort({ follower_count: -1 })
                .limit(parseInt(limit))
                .skip(skip)
                .select('username display_name follower_count following_count verification_status collection_date');

            const total = await InstagramAccount.countDocuments();

            res.json({
                success: true,
                accounts,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(total / limit),
                    total_accounts: total,
                    per_page: parseInt(limit)
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    async getAccountDetails(req, res) {
        try {
            const { username } = req.params;

            const account = await InstagramAccount.findOne({ 
                username: username.toLowerCase() 
            });

            if (!account) {
                return res.status(404).json({
                    success: false,
                    message: 'Account not found'
                });
            }

            // Get account's posts
            const posts = await InstagramPost.find({ 
                account_username: username.toLowerCase() 
            })
            .sort({ post_timestamp: -1 })
            .limit(10);

            // Calculate engagement metrics
            const totalLikes = posts.reduce((sum, post) => sum + post.like_count, 0);
            const totalComments = posts.reduce((sum, post) => sum + post.comment_count, 0);
            const avgLikes = posts.length > 0 ? Math.floor(totalLikes / posts.length) : 0;
            const avgComments = posts.length > 0 ? Math.floor(totalComments / posts.length) : 0;
            const engagementRate = account.follower_count > 0 ? 
                (((avgLikes + avgComments) / account.follower_count) * 100).toFixed(2) : 0;

            res.json({
                success: true,
                account: {
                    ...account.toObject(),
                    metrics: {
                        total_posts: posts.length,
                        avg_likes: avgLikes,
                        avg_comments: avgComments,
                        engagement_rate: engagementRate + '%'
                    }
                },
                recent_posts: posts
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    async getAllPosts(req, res) {
        try {
            const { limit = 20, page = 1, sortBy = 'post_timestamp' } = req.query;
            const skip = (page - 1) * limit;

            const posts = await InstagramPost.find()
                .sort({ [sortBy]: -1 })
                .limit(parseInt(limit))
                .skip(skip)
                .populate('account_ref', 'username display_name verification_status');

            const total = await InstagramPost.countDocuments();

            res.json({
                success: true,
                posts,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(total / limit),
                    total_posts: total,
                    per_page: parseInt(limit)
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    async getRecentPosts(req, res) {
        try {
            const { hours = 24, limit = 50 } = req.query;
            const timeAgo = new Date(Date.now() - hours * 60 * 60 * 1000);

            const posts = await InstagramPost.find({
                collection_date: { $gte: timeAgo }
            })
            .sort({ like_count: -1 })
            .limit(parseInt(limit))
            .populate('account_ref', 'username display_name');

            res.json({
                success: true,
                message: `Posts collected in last ${hours} hours`,
                count: posts.length,
                posts
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    async getPostsByAccount(req, res) {
        try {
            const { username } = req.params;
            const { limit = 20, sortBy = 'like_count' } = req.query;

            const posts = await InstagramPost.find({ 
                account_username: username.toLowerCase() 
            })
            .sort({ [sortBy]: -1 })
            .limit(parseInt(limit));

            if (posts.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: `No posts found for ${username}`
                });
            }

            res.json({
                success: true,
                username,
                count: posts.length,
                posts
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    async getTrendingHashtags(req, res) {
        try {
            const { limit = 20 } = req.query;

            // Aggregate hashtags from posts
            const hashtagStats = await InstagramPost.aggregate([
                { $unwind: '$hashtags' },
                { 
                    $group: { 
                        _id: '$hashtags', 
                        count: { $sum: 1 },
                        total_likes: { $sum: '$like_count' },
                        total_comments: { $sum: '$comment_count' },
                        avg_engagement: { 
                            $avg: { $add: ['$like_count', '$comment_count'] } 
                        }
                    } 
                },
                { $sort: { count: -1 } },
                { $limit: parseInt(limit) }
            ]);

            res.json({
                success: true,
                message: 'Top trending hashtags',
                count: hashtagStats.length,
                hashtags: hashtagStats.map(tag => ({
                    hashtag: tag._id,
                    post_count: tag.count,
                    total_likes: tag.total_likes,
                    total_comments: tag.total_comments,
                    avg_engagement: Math.floor(tag.avg_engagement)
                }))
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    async healthCheck(req, res) {
        try {
            const dbStatus = await InstagramAccount.countDocuments();
            
            res.json({
                success: true,
                status: 'Instagram Analytics API is running',
                database: 'Connected',
                accounts_in_db: dbStatus,
                timestamp: new Date(),
                version: '1.0.0'
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                status: 'Database connection failed',
                error: error.message
            });
        }
    }
};

module.exports = dataCollectionController;
