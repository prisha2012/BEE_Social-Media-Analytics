import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Current selected account
  selectedAccount: null,
  
  // Analytics data
  summary: null,
  engagement: null,
  hashtags: null,
  timing: null,
  contentPerformance: null,
  topPosts: null,
  
  // Data collection status
  dataStats: null,
  credits: null,
  accounts: [],
  
  // Loading states
  loading: {
    summary: false,
    engagement: false,
    hashtags: false,
    timing: false,
    contentPerformance: false,
    topPosts: false,
    dataStats: false,
    credits: false,
    accounts: false,
    scraping: false
  },
  
  // Error states
  error: {
    summary: null,
    engagement: null,
    hashtags: null,
    timing: null,
    contentPerformance: null,
    topPosts: null,
    dataStats: null,
    credits: null,
    accounts: null,
    scraping: null
  }
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    // Account selection
    setSelectedAccount: (state, action) => {
      state.selectedAccount = action.payload;
    },
    
    // Loading states
    setLoading: (state, action) => {
      const { key, value } = action.payload;
      state.loading[key] = value;
    },
    
    // Error states
    setError: (state, action) => {
      const { key, value } = action.payload;
      state.error[key] = value;
    },
    
    // Data setters
    setSummary: (state, action) => {
      state.summary = action.payload;
      state.loading.summary = false;
      state.error.summary = null;
    },
    
    setEngagement: (state, action) => {
      state.engagement = action.payload;
      state.loading.engagement = false;
      state.error.engagement = null;
    },
    
    setHashtags: (state, action) => {
      state.hashtags = action.payload;
      state.loading.hashtags = false;
      state.error.hashtags = null;
    },
    
    setTiming: (state, action) => {
      state.timing = action.payload;
      state.loading.timing = false;
      state.error.timing = null;
    },
    
    setContentPerformance: (state, action) => {
      state.contentPerformance = action.payload;
      state.loading.contentPerformance = false;
      state.error.contentPerformance = null;
    },
    
    setTopPosts: (state, action) => {
      state.topPosts = action.payload;
      state.loading.topPosts = false;
      state.error.topPosts = null;
    },
    
    setDataStats: (state, action) => {
      state.dataStats = action.payload;
      state.loading.dataStats = false;
      state.error.dataStats = null;
    },
    
    setCredits: (state, action) => {
      state.credits = action.payload;
      state.loading.credits = false;
      state.error.credits = null;
    },
    
    setAccounts: (state, action) => {
      state.accounts = action.payload;
      state.loading.accounts = false;
      state.error.accounts = null;
    },
    
    // Clear all data
    clearAnalyticsData: (state) => {
      Object.keys(initialState).forEach(key => {
        if (key !== 'selectedAccount') {
          state[key] = initialState[key];
        }
      });
    }
  }
});

export const {
  setSelectedAccount,
  setLoading,
  setError,
  setSummary,
  setEngagement,
  setHashtags,
  setTiming,
  setContentPerformance,
  setTopPosts,
  setDataStats,
  setCredits,
  setAccounts,
  clearAnalyticsData
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
