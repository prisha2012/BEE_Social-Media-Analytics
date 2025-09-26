const moment = require('moment');

class DataValidation {
    // Post data validate karo
    validatePostData(postData) {
        const errors = [];
        
        if (!postData.id) errors.push('Post ID is required');
        if (!postData.ownerUsername) errors.push('Owner username is required');
        if (typeof postData.likesCount !== 'number') errors.push('Likes count must be a number');
        if (typeof postData.commentsCount !== 'number') errors.push('Comments count must be a number');
        if (!postData.timestamp) errors.push('Post timestamp is required');
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Account data validate karo
    validateAccountData(accountData) {
        const errors = [];
        
        if (!accountData.username) errors.push('Username is required');
        if (typeof accountData.follower_count !== 'number') errors.push('Follower count must be a number');
        if (typeof accountData.following_count !== 'number') errors.push('Following count must be a number');
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Date format standardize karo
    standardizeDate(dateString) {
        return moment(dateString).toDate();
    }

    // Text clean karo
    cleanText(text) {
        if (!text) return '';
        return text.trim().replace(/\s+/g, ' ');
    }

    // Hashtags clean aur format karo
    cleanHashtags(hashtags) {
        if (!Array.isArray(hashtags)) return [];
        return hashtags
            .filter(tag => tag && typeof tag === 'string')
            .map(tag => tag.toLowerCase().replace('#', '').trim())
            .filter(tag => tag.length > 0);
    }

    // Engagement rate calculate karo
    calculateEngagementRate(likes, comments, followers) {
        if (!followers || followers === 0) return 0;
        return ((likes + comments) / followers * 100).toFixed(2);
    }
}

module.exports = new DataValidation();
