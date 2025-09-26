const { InstagramAccount, InstagramPost } = require('../models');

class AnalyticsService {
    // Basic engagement calculations
    async calculateEngagementRate(username) {
        try {
            const account = await InstagramAccount.findOne({ 
                username: username.toLowerCase() 
            });

            if (!account) {
                throw new Error('Account not found');
            }

            const posts = await InstagramPost.find({ 
                account_username: username.toLowerCase() 
            }).sort({ post_timestamp: -1 }).limit(20); // Last 20 posts

            if (posts.length === 0) {
                return {
                    username,
                    engagement_rate: 0,
                    message: 'No posts found'
                };
            }

            // Calculate total engagement
            const totalLikes = posts.reduce((sum, post) => sum + post.like_count, 0);
            const totalComments = posts.reduce((sum, post) => sum + post.comment_count, 0);
            const totalEngagement = totalLikes + totalComments;

            // Calculate average engagement per post
            const avgEngagement = totalEngagement / posts.length;

            // Calculate engagement rate as percentage
            const engagementRate = account.follower_count > 0 ? 
                (avgEngagement / account.follower_count) * 100 : 0;

            return {
                username,
                follower_count: account.follower_count,
                posts_analyzed: posts.length,
                total_likes: totalLikes,
                total_comments: totalComments,
                avg_likes_per_post: Math.round(totalLikes / posts.length),
                avg_comments_per_post: Math.round(totalComments / posts.length),
                avg_engagement_per_post: Math.round(avgEngagement),
                engagement_rate: parseFloat(engagementRate.toFixed(3)),
                engagement_rate_percentage: parseFloat(engagementRate.toFixed(3)) + '%'
            };

        } catch (error) {
            throw new Error(`Analytics calculation failed: ${error.message}`);
        }
    }

    // Account performance summary
    async getAccountSummary(username) {
        try {
            const account = await InstagramAccount.findOne({ 
                username: username.toLowerCase() 
            });

            if (!account) {
                throw new Error('Account not found');
            }

            const posts = await InstagramPost.find({ 
                account_username: username.toLowerCase() 
            }).sort({ post_timestamp: -1 });

            // Best performing post
            const bestPost = await InstagramPost.findOne({ 
                account_username: username.toLowerCase() 
            }).sort({ like_count: -1 });

            // Recent posts (last 7 days)
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const recentPosts = posts.filter(post => 
                new Date(post.post_timestamp) >= sevenDaysAgo
            );

            // Media type analysis
            const mediaTypes = posts.reduce((acc, post) => {
                acc[post.media_type] = (acc[post.media_type] || 0) + 1;
                return acc;
            }, {});

            // Top hashtags
            const allHashtags = posts.flatMap(post => post.hashtags || []);
            const hashtagFreq = allHashtags.reduce((acc, tag) => {
                acc[tag] = (acc[tag] || 0) + 1;
                return acc;
            }, {});

            const topHashtags = Object.entries(hashtagFreq)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .map(([tag, count]) => ({ hashtag: tag, usage_count: count }));

            return {
                account_info: {
                    username: account.username,
                    display_name: account.display_name,
                    follower_count: account.follower_count,
                    following_count: account.following_count,
                    verification_status: account.verification_status
                },
                content_stats: {
                    total_posts: posts.length,
                    recent_posts_7days: recentPosts.length,
                    media_type_breakdown: mediaTypes,
                    posting_frequency: posts.length > 0 ? 
                        `${(posts.length / 30).toFixed(1)} posts per month` : 'No posts'
                },
                performance: {
                    best_performing_post: bestPost ? {
                        post_id: bestPost.post_id,
                        caption: bestPost.caption.substring(0, 100) + '...',
                        like_count: bestPost.like_count,
                        comment_count: bestPost.comment_count,
                        total_engagement: bestPost.like_count + bestPost.comment_count
                    } : null,
                    average_likes: posts.length > 0 ? 
                        Math.round(posts.reduce((sum, p) => sum + p.like_count, 0) / posts.length) : 0,
                    average_comments: posts.length > 0 ? 
                        Math.round(posts.reduce((sum, p) => sum + p.comment_count, 0) / posts.length) : 0
                },
                hashtag_analysis: {
                    unique_hashtags_used: Object.keys(hashtagFreq).length,
                    top_hashtags: topHashtags,
                    avg_hashtags_per_post: posts.length > 0 ? 
                        (allHashtags.length / posts.length).toFixed(1) : 0
                },
                last_updated: new Date()
            };

        } catch (error) {
            throw new Error(`Account summary failed: ${error.message}`);
        }
    }

    // Content performance analysis
    async analyzeContentPerformance(username) {
        try {
            const posts = await InstagramPost.find({ 
                account_username: username.toLowerCase() 
            }).sort({ post_timestamp: -1 });

            if (posts.length === 0) {
                return { message: 'No posts found for analysis' };
            }

            // Media type performance
            const mediaPerformance = {};
            posts.forEach(post => {
                if (!mediaPerformance[post.media_type]) {
                    mediaPerformance[post.media_type] = {
                        count: 0,
                        total_likes: 0,
                        total_comments: 0,
                        total_engagement: 0
                    };
                }
                
                mediaPerformance[post.media_type].count++;
                mediaPerformance[post.media_type].total_likes += post.like_count;
                mediaPerformance[post.media_type].total_comments += post.comment_count;
                mediaPerformance[post.media_type].total_engagement += 
                    post.like_count + post.comment_count;
            });

            // Calculate averages for each media type
            Object.keys(mediaPerformance).forEach(type => {
                const data = mediaPerformance[type];
                data.avg_likes = Math.round(data.total_likes / data.count);
                data.avg_comments = Math.round(data.total_comments / data.count);
                data.avg_engagement = Math.round(data.total_engagement / data.count);
                data.performance_score = data.avg_engagement; // Simple scoring
            });

            // Top 5 performing posts
            const topPosts = posts
                .sort((a, b) => (b.like_count + b.comment_count) - (a.like_count + a.comment_count))
                .slice(0, 5)
                .map(post => ({
                    post_id: post.post_id,
                    caption_preview: post.caption.substring(0, 80) + '...',
                    like_count: post.like_count,
                    comment_count: post.comment_count,
                    total_engagement: post.like_count + post.comment_count,
                    media_type: post.media_type,
                    hashtags_count: post.hashtags.length,
                    post_date: post.post_timestamp
                }));

            // Posting time analysis (simplified)
            const postingTimes = posts.map(post => {
                const date = new Date(post.post_timestamp);
                return {
                    hour: date.getHours(),
                    day_of_week: date.getDay(), // 0 = Sunday
                    engagement: post.like_count + post.comment_count
                };
            });

            // Group by hour
            const hourlyPerformance = {};
            postingTimes.forEach(({ hour, engagement }) => {
                if (!hourlyPerformance[hour]) {
                    hourlyPerformance[hour] = { count: 0, total_engagement: 0 };
                }
                hourlyPerformance[hour].count++;
                hourlyPerformance[hour].total_engagement += engagement;
            });

            // Calculate average engagement per hour
            Object.keys(hourlyPerformance).forEach(hour => {
                const data = hourlyPerformance[hour];
                data.avg_engagement = Math.round(data.total_engagement / data.count);
            });

            // Find best posting hour
            const bestHour = Object.entries(hourlyPerformance)
                .sort(([,a], [,b]) => b.avg_engagement - a.avg_engagement)[0];

            return {
                username,
                analysis_summary: {
                    total_posts_analyzed: posts.length,
                    analysis_period: 'All time',
                    best_media_type: Object.entries(mediaPerformance)
                        .sort(([,a], [,b]) => b.performance_score - a.performance_score)[0]?.[0] || 'N/A'
                },
                media_type_performance: mediaPerformance,
                top_performing_posts: topPosts,
                posting_insights: {
                    best_posting_hour: bestHour ? {
                        hour: parseInt(bestHour[0]),
                        time_display: `${bestHour[0]}:00`,
                        avg_engagement: bestHour[1].avg_engagement,
                        posts_count: bestHour[1].count
                    } : null,
                    hourly_breakdown: hourlyPerformance
                },
                recommendations: this.generateRecommendations(mediaPerformance, bestHour),
                generated_at: new Date()
            };

        } catch (error) {
            throw new Error(`Content performance analysis failed: ${error.message}`);
        }
    }

    // MISSING METHODS - ADD THESE

    // Growth trend analysis
    async analyzeGrowthTrend(username, days = 30) {
        try {
            const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
            
            const posts = await InstagramPost.find({ 
                account_username: username.toLowerCase(),
                post_timestamp: { $gte: cutoffDate }
            }).sort({ post_timestamp: 1 }); // Oldest first

            if (posts.length === 0) {
                return {
                    username,
                    message: `No posts found in last ${days} days`,
                    trend: 'no_data'
                };
            }

            // Group posts by week
            const weeklyData = {};
            posts.forEach(post => {
                const weekStart = new Date(post.post_timestamp);
                weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week
                const weekKey = weekStart.toISOString().split('T')[0];

                if (!weeklyData[weekKey]) {
                    weeklyData[weekKey] = {
                        posts_count: 0,
                        total_likes: 0,
                        total_comments: 0,
                        total_engagement: 0
                    };
                }

                weeklyData[weekKey].posts_count++;
                weeklyData[weekKey].total_likes += post.like_count;
                weeklyData[weekKey].total_comments += post.comment_count;
                weeklyData[weekKey].total_engagement += post.like_count + post.comment_count;
            });

            // Calculate weekly averages
            const weeklyTrend = Object.entries(weeklyData).map(([week, data]) => ({
                week,
                posts_count: data.posts_count,
                avg_likes: Math.round(data.total_likes / data.posts_count),
                avg_comments: Math.round(data.total_comments / data.posts_count),
                avg_engagement: Math.round(data.total_engagement / data.posts_count)
            })).sort((a, b) => new Date(a.week) - new Date(b.week));

            // Calculate trend direction
            let trendDirection = 'stable';
            if (weeklyTrend.length >= 2) {
                const firstWeek = weeklyTrend[0].avg_engagement;
                const lastWeek = weeklyTrend[weeklyTrend.length - 1].avg_engagement;
                const change = ((lastWeek - firstWeek) / firstWeek) * 100;

                if (change > 10) trendDirection = 'growing';
                else if (change < -10) trendDirection = 'declining';
            }

            return {
                username,
                analysis_period: `${days} days`,
                total_posts_in_period: posts.length,
                trend_direction: trendDirection,
                weekly_breakdown: weeklyTrend,
                summary: {
                    best_week: weeklyTrend.reduce((best, current) => 
                        current.avg_engagement > best.avg_engagement ? current : best, weeklyTrend[0]),
                    worst_week: weeklyTrend.reduce((worst, current) => 
                        current.avg_engagement < worst.avg_engagement ? current : worst, weeklyTrend[0]),
                    average_posts_per_week: (posts.length / Math.max(1, weeklyTrend.length)).toFixed(1)
                },
                generated_at: new Date()
            };

        } catch (error) {
            throw new Error(`Growth trend analysis failed: ${error.message}`);
        }
    }

    // Hashtag performance analysis
    async analyzeHashtagPerformance(username) {
        try {
            const posts = await InstagramPost.find({ 
                account_username: username.toLowerCase() 
            });

            if (posts.length === 0) {
                return { message: 'No posts found for hashtag analysis' };
            }

            // Collect hashtag performance data
            const hashtagPerformance = {};
            
            posts.forEach(post => {
                const engagement = post.like_count + post.comment_count;
                
                post.hashtags.forEach(hashtag => {
                    if (!hashtagPerformance[hashtag]) {
                        hashtagPerformance[hashtag] = {
                            usage_count: 0,
                            total_engagement: 0,
                            total_likes: 0,
                            total_comments: 0,
                            posts_used: []
                        };
                    }

                    hashtagPerformance[hashtag].usage_count++;
                    hashtagPerformance[hashtag].total_engagement += engagement;
                    hashtagPerformance[hashtag].total_likes += post.like_count;
                    hashtagPerformance[hashtag].total_comments += post.comment_count;
                    hashtagPerformance[hashtag].posts_used.push({
                        post_id: post.post_id,
                        engagement
                    });
                });
            });

            // Calculate averages and sort by performance
            const hashtagStats = Object.entries(hashtagPerformance).map(([hashtag, data]) => ({
                hashtag,
                usage_count: data.usage_count,
                avg_engagement: Math.round(data.total_engagement / data.usage_count),
                avg_likes: Math.round(data.total_likes / data.usage_count),
                avg_comments: Math.round(data.total_comments / data.usage_count),
                performance_score: Math.round(data.total_engagement / data.usage_count),
                usage_frequency: ((data.usage_count / posts.length) * 100).toFixed(1) + '%'
            })).sort((a, b) => b.performance_score - a.performance_score);

            // Get top and bottom performers
            const topPerformers = hashtagStats.slice(0, 10);
            const bottomPerformers = hashtagStats.slice(-5);

            return {
                username,
                analysis_summary: {
                    total_unique_hashtags: hashtagStats.length,
                    total_hashtag_instances: Object.values(hashtagPerformance)
                        .reduce((sum, data) => sum + data.usage_count, 0),
                    avg_hashtags_per_post: (Object.values(hashtagPerformance)
                        .reduce((sum, data) => sum + data.usage_count, 0) / posts.length).toFixed(1)
                },
                top_performing_hashtags: topPerformers,
                underperforming_hashtags: bottomPerformers,
                recommendations: {
                    keep_using: topPerformers.slice(0, 5).map(h => h.hashtag),
                    consider_dropping: bottomPerformers.slice(0, 3).map(h => h.hashtag),
                    suggested_frequency: "Use 8-12 hashtags per post for optimal reach"
                },
                generated_at: new Date()
            };

        } catch (error) {
            throw new Error(`Hashtag performance analysis failed: ${error.message}`);
        }
    }

    // Optimal posting time analysis
    async findOptimalPostingTimes(username) {
        try {
            const posts = await InstagramPost.find({ 
                account_username: username.toLowerCase() 
            });

            if (posts.length === 0) {
                return { message: 'No posts found for timing analysis' };
            }

            // Analyze posting times
            const timeAnalysis = {
                hourly: {},
                daily: {}
            };

            posts.forEach(post => {
                const date = new Date(post.post_timestamp);
                const hour = date.getHours();
                const day = date.getDay(); // 0 = Sunday
                const engagement = post.like_count + post.comment_count;

                // Hourly analysis
                if (!timeAnalysis.hourly[hour]) {
                    timeAnalysis.hourly[hour] = { posts: 0, total_engagement: 0 };
                }
                timeAnalysis.hourly[hour].posts++;
                timeAnalysis.hourly[hour].total_engagement += engagement;

                // Daily analysis
                if (!timeAnalysis.daily[day]) {
                    timeAnalysis.daily[day] = { posts: 0, total_engagement: 0 };
                }
                timeAnalysis.daily[day].posts++;
                timeAnalysis.daily[day].total_engagement += engagement;
            });

            // Calculate averages and find optimal times
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

            // Process hourly data
            const hourlyStats = Object.entries(timeAnalysis.hourly).map(([hour, data]) => ({
                hour: parseInt(hour),
                time_display: `${hour}:00`,
                posts_count: data.posts,
                avg_engagement: Math.round(data.total_engagement / data.posts),
                total_engagement: data.total_engagement
            })).sort((a, b) => b.avg_engagement - a.avg_engagement);

            // Process daily data
            const dailyStats = Object.entries(timeAnalysis.daily).map(([day, data]) => ({
                day: parseInt(day),
                day_name: dayNames[day],
                posts_count: data.posts,
                avg_engagement: Math.round(data.total_engagement / data.posts),
                total_engagement: data.total_engagement
            })).sort((a, b) => b.avg_engagement - a.avg_engagement);

            return {
                username,
                analysis_summary: {
                    total_posts_analyzed: posts.length,
                    date_range: {
                        earliest: new Date(Math.min(...posts.map(p => new Date(p.post_timestamp)))),
                        latest: new Date(Math.max(...posts.map(p => new Date(p.post_timestamp))))
                    }
                },
                optimal_times: {
                    best_hour: hourlyStats[0],
                    best_day: dailyStats[0]
                },
                detailed_breakdown: {
                    hourly: hourlyStats,
                    daily: dailyStats
                },
                recommendations: [
                    `Post around ${hourlyStats[0]?.time_display} for maximum engagement`,
                    `${dailyStats[0]?.day_name} is your best posting day`,
                    `Avoid posting during ${hourlyStats[hourlyStats.length - 1]?.time_display} (lowest engagement)`
                ],
                generated_at: new Date()
            };

        } catch (error) {
            throw new Error(`Optimal posting time analysis failed: ${error.message}`);
        }
    }

    // Content strategy insights
    async generateContentStrategy(username) {
        try {
            // Get basic analytics
            const engagement = await this.calculateEngagementRate(username);
            const contentPerf = await this.analyzeContentPerformance(username);

            const strategy = {
                username,
                current_performance: {
                    engagement_rate: engagement.engagement_rate,
                    benchmark: this.getEngagementBenchmark(engagement.engagement_rate),
                    follower_count: engagement.follower_count,
                    avg_engagement_per_post: engagement.avg_engagement_per_post
                },
                content_recommendations: {
                    best_media_type: contentPerf.analysis_summary?.best_media_type || 'photo',
                    posting_frequency: '1-2 posts per day',
                    optimal_posting_time: contentPerf.posting_insights?.best_posting_hour?.time_display || '12:00'
                },
                growth_opportunities: this.identifyGrowthOpportunities(engagement, contentPerf),
                action_plan: [
                    {
                        priority: 'High',
                        action: 'Post consistently at optimal times',
                        details: 'Maintain regular posting schedule'
                    },
                    {
                        priority: 'Medium',
                        action: 'Optimize content mix',
                        details: `Focus on ${contentPerf.analysis_summary?.best_media_type || 'photo'} content`
                    }
                ],
                generated_at: new Date()
            };

            return strategy;

        } catch (error) {
            throw new Error(`Content strategy generation failed: ${error.message}`);
        }
    }

    // Generate simple recommendations
    generateRecommendations(mediaPerformance, bestHour) {
        const recommendations = [];

        // Media type recommendation
        if (Object.keys(mediaPerformance).length > 1) {
            const bestMedia = Object.entries(mediaPerformance)
                .sort(([,a], [,b]) => b.performance_score - a.performance_score)[0];
            
            recommendations.push({
                type: 'content_type',
                recommendation: `Focus more on ${bestMedia[0]} content`,
                reason: `${bestMedia[0]} content gets ${bestMedia[1].avg_engagement} avg engagement`
            });
        }

        // Posting time recommendation
        if (bestHour) {
            recommendations.push({
                type: 'posting_time',
                recommendation: `Post around ${bestHour[0]}:00`,
                reason: `Posts at ${bestHour[0]}:00 get ${bestHour[1].avg_engagement} avg engagement`
            });
        }

        // Hashtag recommendation
        recommendations.push({
            type: 'hashtag_strategy',
            recommendation: 'Use 8-12 relevant hashtags per post',
            reason: 'Optimal hashtag count for maximum reach'
        });

        return recommendations;
    }

    // Compare multiple accounts
    async compareAccounts(usernames) {
        try {
            const comparisons = [];

            for (const username of usernames) {
                try {
                    const engagement = await this.calculateEngagementRate(username);
                    const summary = await this.getAccountSummary(username);
                    
                    comparisons.push({
                        username,
                        followers: summary.account_info.follower_count,
                        total_posts: summary.content_stats.total_posts,
                        engagement_rate: engagement.engagement_rate,
                        avg_likes: engagement.avg_likes_per_post,
                        avg_comments: engagement.avg_comments_per_post,
                        verification_status: summary.account_info.verification_status,
                        best_post_engagement: summary.performance.best_performing_post?.total_engagement || 0
                    });
                } catch (error) {
                    comparisons.push({
                        username,
                        error: error.message,
                        status: 'failed'
                    });
                }
            }

            // Sort by engagement rate
            const validComparisons = comparisons.filter(c => !c.error);
            validComparisons.sort((a, b) => b.engagement_rate - a.engagement_rate);

            return {
                comparison_summary: {
                    accounts_compared: usernames.length,
                    successful_analyses: validComparisons.length,
                    failed_analyses: comparisons.filter(c => c.error).length
                },
                rankings: {
                    by_engagement_rate: validComparisons,
                    by_followers: [...validComparisons].sort((a, b) => b.followers - a.followers),
                    by_total_posts: [...validComparisons].sort((a, b) => b.total_posts - a.total_posts)
                },
                detailed_comparison: comparisons,
                generated_at: new Date()
            };

        } catch (error) {
            throw new Error(`Account comparison failed: ${error.message}`);
        }
    }

    // Helper methods
    getEngagementBenchmark(rate) {
        if (rate > 3) return 'Excellent (3%+)';
        if (rate > 2) return 'Good (2-3%)';
        if (rate > 1) return 'Average (1-2%)';
        return 'Below Average (<1%)';
    }

    identifyGrowthOpportunities(engagement, contentPerf) {
        const opportunities = [];

        if (engagement.engagement_rate < 1) {
            opportunities.push('Focus on increasing engagement rate through better content');
        }

        opportunities.push('Use trending hashtags relevant to your content');
        opportunities.push('Engage more with your audience through comments');

        return opportunities;
    }
}

module.exports = new AnalyticsService();
