const mongoose = require('mongoose');

const instagramPostSchema = new mongoose.Schema({
    post_id: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    account_username: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    account_ref: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InstagramAccount',
        required: true
    },
    caption: {
        type: String,
        trim: true,
        default: ''
    },
    hashtags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    like_count: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    comment_count: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    media_type: {
        type: String,
        enum: ['photo', 'video', 'carousel', 'reel'],
        required: true
    },
    media_url: {
        type: String,
        trim: true
    },
    post_timestamp: {
        type: Date,
        required: true
    },
    post_url: {
        type: String,
        required: true,
        trim: true
    },
    collection_date: {
        type: Date,
        default: Date.now
    },
    engagement_rate: {
        type: Number,
        min: 0,
        max: 100
    }
}, {
    timestamps: true
});

instagramPostSchema.index({ post_id: 1 });
instagramPostSchema.index({ account_username: 1 });
instagramPostSchema.index({ post_timestamp: -1 });

module.exports = mongoose.model('InstagramPost', instagramPostSchema);
