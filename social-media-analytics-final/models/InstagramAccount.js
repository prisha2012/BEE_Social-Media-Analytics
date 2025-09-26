const mongoose = require('mongoose');

const instagramAccountSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    display_name: {
        type: String,
        required: true,
        trim: true
    },
    follower_count: {
        type: Number,
        required: true,
        min: 0
    },
    following_count: {
        type: Number,
        required: true,
        min: 0
    },
    biography: {
        type: String,
        trim: true,
        default: ''
    },
    profile_pic_url: {
        type: String,
        trim: true
    },
    account_type: {
        type: String,
        enum: ['business', 'personal', 'creator'],
        default: 'personal'
    },
    verification_status: {
        type: Boolean,
        default: false
    },
    posts_count: {
        type: Number,
        default: 0,
        min: 0
    },
    collection_date: {
        type: Date,
        default: Date.now
    },
    last_updated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

instagramAccountSchema.index({ username: 1 });
instagramAccountSchema.index({ follower_count: -1 });

module.exports = mongoose.model('InstagramAccount', instagramAccountSchema);
