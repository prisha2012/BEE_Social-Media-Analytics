import api from './api';

export const analyticsService = {
  // Analytics endpoints
  getSummary: async (username) => {
    try {
      const response = await api.get(`/analytics/summary/${username}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getEngagement: async (username) => {
    try {
      const response = await api.get(`/analytics/engagement/${username}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getHashtags: async (username) => {
    try {
      const response = await api.get(`/analytics/hashtags/${username}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getTiming: async (username) => {
    try {
      const response = await api.get(`/analytics/timing/${username}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getContentPerformance: async (username) => {
    try {
      const response = await api.get(`/analytics/content-performance/${username}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getTopPosts: async (username) => {
    try {
      const response = await api.get(`/analytics/top-posts/${username}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export const dataCollectionService = {
  // Data collection endpoints
  scrapeAccount: async (username) => {
    try {
      const response = await api.post(`/data/scrape/${username}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getDataStats: async () => {
    try {
      const response = await api.get('/data/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getCredits: async () => {
    try {
      const response = await api.get('/data/credits');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getAccounts: async () => {
    try {
      const response = await api.get('/data/accounts');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export const accountService = {
  // Account management endpoints based on your InstagramAccount model
  getAccountDetails: async (username) => {
    try {
      const response = await api.get(`/analytics/account/${username}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateAccountSettings: async (username, settings) => {
    try {
      const response = await api.patch(`/analytics/account/${username}`, settings);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
