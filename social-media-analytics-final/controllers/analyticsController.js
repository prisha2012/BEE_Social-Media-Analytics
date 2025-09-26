const analyticsService = require('../services/analyticsService');

const analyticsController = {
    // Basic engagement rate analysis
    async getEngagementRate(req, res) {
        try {
            const { username } = req.params;
            
            console.log(`🧮 Calculating engagement rate for: ${username}`);
            const result = await analyticsService.calculateEngagementRate(username);
            
            res.json({
                success: true,
                message: `Engagement analysis for ${username}`,
                data: result
            });

        } catch (error) {
            console.error('Engagement rate calculation failed:', error);
            res.status(500).json({
                success: false,
                message: 'Engagement rate calculation failed',
                error: error.message
            });
        }
    },

    // Complete account summary with analytics
    async getAccountSummary(req, res) {
        try {
            const { username } = req.params;
            
            console.log(`📊 Generating account summary for: ${username}`);
            const result = await analyticsService.getAccountSummary(username);
            
            res.json({
                success: true,
                message: `Complete account summary for ${username}`,
                data: result
            });

        } catch (error) {
            console.error('Account summary generation failed:', error);
            res.status(500).json({
                success: false,
                message: 'Account summary generation failed',
                error: error.message
            });
        }
    },

    // Content performance analysis
    async getContentPerformance(req, res) {
        try {
            const { username } = req.params;
            
            console.log(`🎯 Analyzing content performance for: ${username}`);
            const result = await analyticsService.analyzeContentPerformance(username);
            
            res.json({
                success: true,
                message: `Content performance analysis for ${username}`,
                data: result
            });

        } catch (error) {
            console.error('Content performance analysis failed:', error);
            res.status(500).json({
                success: false,
                message: 'Content performance analysis failed',
                error: error.message
            });
        }
    },

    // Growth trend analysis
    async getGrowthTrend(req, res) {
        try {
            const { username } = req.params;
            const { days = 30 } = req.query;
            
            console.log(`📈 Analyzing growth trend for: ${username} (${days} days)`);
            const result = await analyticsService.analyzeGrowthTrend(username, parseInt(days));
            
            res.json({
                success: true,
                message: `Growth trend analysis for ${username}`,
                data: result
            });

        } catch (error) {
            console.error('Growth trend analysis failed:', error);
            res.status(500).json({
                success: false,
                message: 'Growth trend analysis failed',
                error: error.message
            });
        }
    },

    // Hashtag performance analysis
    async getHashtagPerformance(req, res) {
        try {
            const { username } = req.params;
            
            console.log(`#️⃣ Analyzing hashtag performance for: ${username}`);
            const result = await analyticsService.analyzeHashtagPerformance(username);
            
            res.json({
                success: true,
                message: `Hashtag performance analysis for ${username}`,
                data: result
            });

        } catch (error) {
            console.error('Hashtag performance analysis failed:', error);
            res.status(500).json({
                success: false,
                message: 'Hashtag performance analysis failed',
                error: error.message
            });
        }
    },

    // Optimal posting times analysis
    async getOptimalPostingTimes(req, res) {
        try {
            const { username } = req.params;
            
            console.log(`⏰ Finding optimal posting times for: ${username}`);
            const result = await analyticsService.findOptimalPostingTimes(username);
            
            res.json({
                success: true,
                message: `Optimal posting times analysis for ${username}`,
                data: result
            });

        } catch (error) {
            console.error('Optimal posting times analysis failed:', error);
            res.status(500).json({
                success: false,
                message: 'Optimal posting times analysis failed',
                error: error.message
            });
        }
    },

    // Complete content strategy generation
    async getContentStrategy(req, res) {
        try {
            const { username } = req.params;
            
            console.log(`🎬 Generating content strategy for: ${username}`);
            const result = await analyticsService.generateContentStrategy(username);
            
            res.json({
                success: true,
                message: `Complete content strategy for ${username}`,
                data: result
            });

        } catch (error) {
            console.error('Content strategy generation failed:', error);
            res.status(500).json({
                success: false,
                message: 'Content strategy generation failed',
                error: error.message
            });
        }
    },

    // Compare multiple accounts
    async compareAccounts(req, res) {
        try {
            let { accounts } = req.query;
            
            // If no accounts provided, use default comparison
            if (!accounts) {
                accounts = ['cristiano', 'therock', 'selenagomez'];
            } else {
                // Parse accounts from query string
                accounts = accounts.split(',').map(acc => acc.trim());
            }
            
            console.log(`⚖️ Comparing accounts: ${accounts.join(', ')}`);
            const result = await analyticsService.compareAccounts(accounts);
            
            res.json({
                success: true,
                message: `Account comparison analysis`,
                accounts_compared: accounts,
                data: result
            });

        } catch (error) {
            console.error('Account comparison failed:', error);
            res.status(500).json({
                success: false,
                message: 'Account comparison failed',
                error: error.message
            });
        }
    },

    // Dashboard summary - All key metrics at once
    async getDashboardSummary(req, res) {
        try {
            const { username } = req.params;
            
            console.log(`📋 Generating dashboard summary for: ${username}`);
            
            // Get all key analytics in parallel
            const [
                engagement,
                summary,
                contentPerf,
                hashtags,
                timing
            ] = await Promise.all([
                analyticsService.calculateEngagementRate(username),
                analyticsService.getAccountSummary(username),
                analyticsService.analyzeContentPerformance(username),
                analyticsService.analyzeHashtagPerformance(username),
                analyticsService.findOptimalPostingTimes(username)
            ]);

            // Compile dashboard data
            const dashboard = {
                username,
                account_overview: {
                    follower_count: summary.account_info.follower_count,
                    engagement_rate: engagement.engagement_rate + '%',
                    total_posts: summary.content_stats.total_posts,
                    verification_status: summary.account_info.verification_status
                },
                quick_stats: {
                    avg_likes_per_post: engagement.avg_likes_per_post,
                    avg_comments_per_post: engagement.avg_comments_per_post,
                    best_performing_post: summary.performance.best_performing_post,
                    recent_activity: summary.content_stats.recent_posts_7days
                },
                insights: {
                    best_media_type: contentPerf.analysis_summary?.best_media_type || 'photo',
                    optimal_posting_hour: timing.optimal_times?.best_hour?.time_display || 'N/A',
                    optimal_posting_day: timing.optimal_times?.best_day?.day_name || 'N/A',
                    top_hashtag: hashtags.top_performing_hashtags?.[0]?.hashtag || 'N/A'
                },
                performance_indicators: {
                    engagement_trend: engagement.engagement_rate > 2 ? 'excellent' : 
                                    engagement.engagement_rate > 1 ? 'good' : 'needs_improvement',
                    content_consistency: summary.content_stats.recent_posts_7days > 3 ? 'high' : 
                                       summary.content_stats.recent_posts_7days > 1 ? 'medium' : 'low',
                    hashtag_effectiveness: hashtags.top_performing_hashtags?.length > 5 ? 'high' : 'medium'
                },
                recommendations: contentPerf.recommendations || [],
                last_updated: new Date()
            };
            
            res.json({
                success: true,
                message: `Complete dashboard summary for ${username}`,
                data: dashboard
            });

        } catch (error) {
            console.error('Dashboard summary generation failed:', error);
            res.status(500).json({
                success: false,
                message: 'Dashboard summary generation failed',
                error: error.message
            });
        }
    },

    // Analytics health check
    async getAnalyticsHealth(req, res) {
        try {
            // Check if we have data to analyze
            const { InstagramAccount, InstagramPost } = require('../models');
            
            const accountCount = await InstagramAccount.countDocuments();
            const postCount = await InstagramPost.countDocuments();
            const recentPosts = await InstagramPost.countDocuments({
                collection_date: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            });

            // Get sample account for testing
            const sampleAccount = await InstagramAccount.findOne().sort({ follower_count: -1 });

            res.json({
                success: true,
                status: 'Analytics service is operational',
                data_availability: {
                    total_accounts: accountCount,
                    total_posts: postCount,
                    recent_posts_24h: recentPosts,
                    sample_account: sampleAccount?.username || 'No accounts available'
                },
                available_analytics: [
                    'Engagement Rate Calculation',
                    'Account Performance Summary',
                    'Content Performance Analysis',
                    'Growth Trend Analysis',
                    'Hashtag Performance Analysis',
                    'Optimal Posting Times',
                    'Content Strategy Generation',
                    'Account Comparison',
                    'Dashboard Summary'
                ],
                service_status: accountCount > 0 && postCount > 0 ? 'Ready' : 'Waiting for data',
                timestamp: new Date()
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                status: 'Analytics service health check failed',
                error: error.message
            });
        }
    },

    // Get all available accounts for analytics
    async getAvailableAccounts(req, res) {
        try {
            const { InstagramAccount } = require('../models');
            
            const accounts = await InstagramAccount.find()
                .sort({ follower_count: -1 })
                .select('username display_name follower_count verification_status collection_date')
                .limit(20);

            res.json({
                success: true,
                message: 'Available accounts for analytics',
                count: accounts.length,
                accounts: accounts.map(acc => ({
                    username: acc.username,
                    display_name: acc.display_name,
                    follower_count: acc.follower_count,
                    verification_status: acc.verification_status,
                    has_data: true,
                    last_updated: acc.collection_date
                }))
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get available accounts',
                error: error.message
            });
        }
    },

    // Batch analytics - Multiple accounts at once
    async getBatchAnalytics(req, res) {
        try {
            let { accounts, metrics } = req.query;
            
            if (!accounts) {
                accounts = ['cristiano', 'therock', 'selenagomez'];
            } else {
                accounts = accounts.split(',').map(acc => acc.trim());
            }

            const requestedMetrics = metrics ? metrics.split(',') : ['engagement', 'summary'];
            
            console.log(`📊 Batch analytics for: ${accounts.join(', ')}`);
            console.log(`📈 Metrics: ${requestedMetrics.join(', ')}`);

            const results = {};

            for (const username of accounts) {
                try {
                    results[username] = {
                        username,
                        status: 'success',
                        analytics: {}
                    };

                    // Get requested metrics
                    if (requestedMetrics.includes('engagement')) {
                        results[username].analytics.engagement = await analyticsService.calculateEngagementRate(username);
                    }

                    if (requestedMetrics.includes('summary')) {
                        results[username].analytics.summary = await analyticsService.getAccountSummary(username);
                    }

                    if (requestedMetrics.includes('content')) {
                        results[username].analytics.content_performance = await analyticsService.analyzeContentPerformance(username);
                    }

                    if (requestedMetrics.includes('hashtags')) {
                        results[username].analytics.hashtag_performance = await analyticsService.analyzeHashtagPerformance(username);
                    }

                    if (requestedMetrics.includes('timing')) {
                        results[username].analytics.posting_times = await analyticsService.findOptimalPostingTimes(username);
                    }

                } catch (error) {
                    results[username] = {
                        username,
                        status: 'failed',
                        error: error.message
                    };
                }
            }

            const successCount = Object.values(results).filter(r => r.status === 'success').length;
            const failedCount = accounts.length - successCount;

            res.json({
                success: true,
                message: `Batch analytics completed`,
                summary: {
                    total_accounts: accounts.length,
                    successful: successCount,
                    failed: failedCount,
                    metrics_requested: requestedMetrics
                },
                results,
                processed_at: new Date()
            });

        } catch (error) {
            console.error('Batch analytics failed:', error);
            res.status(500).json({
                success: false,
                message: 'Batch analytics processing failed',
                error: error.message
            });
        }
    }
};

module.exports = analyticsController;
