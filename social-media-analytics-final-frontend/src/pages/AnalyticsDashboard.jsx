import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../services/api';

const AnalyticsDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [selectedAccount, setSelectedAccount] = useState('cristiano'); // Default to cristiano
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showRawData, setShowRawData] = useState(false); // Toggle for raw data
  const [availableAccounts, setAvailableAccounts] = useState(['cristiano']); // New state

  // Load analytics when account is selected
  useEffect(() => {
    if (selectedAccount) {
      loadAnalytics();
    }
  }, [selectedAccount]);

  useEffect(() => {
    loadAvailableAccounts();
  }, []);

   const loadAvailableAccounts = async () => {
    try {
      // Try the new endpoint first
      const response = await api.get('/analytics/accounts/list');
      if (response.data.success && response.data.accounts.length > 0) {
        const accounts = response.data.accounts.map(acc => acc.username);
        setAvailableAccounts(accounts);
        
        // Set first account as default if current selection isn't available
        if (!accounts.includes(selectedAccount)) {
          setSelectedAccount(accounts[0]);
        }
      }
    } catch (error) {
      console.log('Could not load accounts list, using defaults');
      // Fallback to checking individual accounts
      const testAccounts = ['cristiano', 'therock', 'selenagomez'];
      const workingAccounts = [];
      
      for (const account of testAccounts) {
        try {
          await api.get(`/analytics/summary/${account}`);
          workingAccounts.push(account);
        } catch (err) {
          console.log(`${account} not available`);
        }
      }
      
      if (workingAccounts.length > 0) {
        setAvailableAccounts(workingAccounts);
        setSelectedAccount(workingAccounts[0]);
      }
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading analytics for:', selectedAccount);
      
      // Use the working analytics endpoint
      const response = await api.get(`/analytics/summary/${selectedAccount}`);
      console.log('Analytics response:', response.data);
      
      if (response.data.success) {
        setAnalyticsData(response.data.data);
      } else {
        setError('No analytics data available');
      }
      
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError(error.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const calculateEngagementRate = () => {
    if (!analyticsData?.performance || !analyticsData?.account_info) return 'N/A';
    
    const avgLikes = analyticsData.performance.average_likes || 0;
    const avgComments = analyticsData.performance.average_comments || 0;
    const followers = analyticsData.account_info.follower_count || 1;
    
    const engagementRate = ((avgLikes + avgComments) / followers * 100).toFixed(2);
    return `${engagementRate}%`;
  };

  // Add this debug function
const debugAllAccounts = async () => {
  try {
    console.log('=== DEBUGGING ALL ACCOUNTS ===');
    
    // Check what accounts are in database
    const accountsResponse = await api.get('/data/accounts');
    console.log('Available accounts:', accountsResponse.data);
    
    // Try to get stats
    const statsResponse = await api.get('/data/stats');
    console.log('Database stats:', statsResponse.data);
    
    // Test each account individually
    const testAccounts = ['cristiano', 'therock', 'selenagomez'];
    
    for (const account of testAccounts) {
      console.log(`\n--- Testing ${account} ---`);
      try {
        const response = await api.get(`/analytics/summary/${account}`);
        console.log(`${account} analytics:`, response.data);
      } catch (error) {
        console.log(`${account} error:`, error.response?.data);
      }
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  }
  };
  
  // Add this to your AnalyticsDashboard.jsx
const checkDatabaseAccounts = async () => {
  try {
    console.log('=== CHECKING DATABASE ===');
    
    // Method 1: Check via data/accounts
    try {
      const response = await api.get('/data/accounts');
      console.log('Accounts endpoint response:', response.data);
      
      if (response.data.accounts) {
        console.log('Found accounts:', response.data.accounts.map(acc => acc.username || acc));
      }
    } catch (error) {
      console.log('Data accounts error:', error.response?.data);
    }

    // Method 2: Check via direct MongoDB query (if available)
    try {
      const response = await api.get('/debug/accounts'); // We'll create this endpoint
      console.log('Direct DB query:', response.data);
    } catch (error) {
      console.log('Direct DB endpoint not available');
    }
    
  } catch (error) {
    console.error('Database check error:', error);
  }
};

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
{/* 
      <div className="flex items-center space-x-4">
  <button
    onClick={checkDatabaseAccounts}
    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
  >
    🔍 Check DB Accounts
  </button>
  <button
    onClick={() => setShowRawData(!showRawData)}
    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
  >
    {showRawData ? '🎨 Pretty View' : '🔍 Raw Data'}
  </button>
  <button
    onClick={loadAnalytics}
    disabled={loading}
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
  >
    {loading ? 'Loading...' : '🔄 Refresh'}
  </button>
</div> */}


      {/* <div className="flex items-center space-x-4">
  <button
    onClick={debugAllAccounts}
    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
  >
    🐛 Debug All Accounts
  </button>
  <button
    onClick={() => setShowRawData(!showRawData)}
    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
  >
    {showRawData ? '🎨 Pretty View' : '🔍 Raw Data'}
  </button>
  <button
    onClick={loadAnalytics}
    disabled={loading}
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
  >
    {loading ? 'Loading...' : '🔄 Refresh'}
  </button>
</div> */}


      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">📊 Instagram Analytics</h1>
              
              {/* Account Selector */}
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="ml-4 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableAccounts.map(account => (
                  <option key={account} value={account}>@{account}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowRawData(!showRawData)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {showRawData ? '🎨 Pretty View' : '🔍 Raw Data'}
              </button>
              <button
                onClick={loadAnalytics}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Loading...' : '🔄 Refresh'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        
        {/* Account Analytics */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Analytics for @{selectedAccount}
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Status: {analyticsData ? '✅ Data Available' : '❌ No Data'}
              </span>
              {analyticsData?.last_updated && (
                <span className="text-sm text-gray-500">
                  Updated: {new Date(analyticsData.last_updated).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading analytics...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">Error: {error}</p>
              <button
                onClick={loadAnalytics}
                className="mt-2 text-red-600 hover:text-red-800 font-medium"
              >
                🔄 Try Again
              </button>
            </div>
          ) : analyticsData ? (
            <div>
              {/* Raw Data Display - Toggle */}
              {showRawData && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">🔍 Raw Analytics Data:</h3>
                  <pre className="text-xs text-gray-600 overflow-x-auto max-h-60 overflow-y-auto">
                    {JSON.stringify(analyticsData, null, 2)}
                  </pre>
                </div>
              )}

              {/* Main Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Account Info */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">👤 Account Info</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Display Name</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {analyticsData.account_info?.display_name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Followers</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {analyticsData.account_info?.follower_count?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Following</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {analyticsData.account_info?.following_count?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Verified</p>
                      <p className="text-sm font-medium">
                        {analyticsData.account_info?.verification_status ? '✅ Verified' : '❌ Not Verified'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Posts Data */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">📱 Content</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Total Posts</p>
                      <p className="text-2xl font-bold text-green-600">
                        {analyticsData.content_stats?.total_posts || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Recent Posts (7 days)</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {analyticsData.content_stats?.recent_posts_7days || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Photos</p>
                      <p className="text-sm text-gray-700">
                        📸 {analyticsData.content_stats?.media_type_breakdown?.photo || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Videos</p>
                      <p className="text-sm text-gray-700">
                        🎥 {analyticsData.content_stats?.media_type_breakdown?.video || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Performance */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">🏆 Performance</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Average Likes</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {analyticsData.performance?.average_likes?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Average Comments</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {analyticsData.performance?.average_comments?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Engagement Rate</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {calculateEngagementRate()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Posting Frequency</p>
                      <p className="text-sm text-gray-700">
                        {analyticsData.content_stats?.posting_frequency || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hashtags */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">🏷️ Hashtags</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Unique Hashtags</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {analyticsData.hashtag_analysis?.unique_hashtags_used || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Avg per Post</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {analyticsData.hashtag_analysis?.avg_hashtags_per_post || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Top Hashtag</p>
                      <p className="text-sm text-gray-700">
                        #{analyticsData.hashtag_analysis?.top_hashtags?.[0]?.hashtag || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Most Used Count</p>
                      <p className="text-sm text-gray-700">
                        {analyticsData.hashtag_analysis?.top_hashtags?.[0]?.usage_count || 'N/A'} times
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Best Post Highlight */}
              {analyticsData.performance?.best_performing_post && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 mb-8 border-l-4 border-yellow-400">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🌟 Best Performing Post</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Caption Preview:</p>
                      <p className="text-gray-800 italic text-sm">
                        "{analyticsData.performance.best_performing_post.caption?.substring(0, 100)}..."
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Post ID: {analyticsData.performance.best_performing_post.post_id}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-red-500">
                          {analyticsData.performance.best_performing_post.like_count?.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">❤️ Likes</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-500">
                          {analyticsData.performance.best_performing_post.comment_count?.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">💬 Comments</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-500">
                          {analyticsData.performance.best_performing_post.total_engagement?.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">📊 Total</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Top Hashtags */}
              {analyticsData.hashtag_analysis?.top_hashtags && (
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🏷️ Most Used Hashtags</h3>
                  <div className="flex flex-wrap gap-3">
                    {analyticsData.hashtag_analysis.top_hashtags.slice(0, 10).map((hashtag, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          index < 3 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        #{hashtag.hashtag}
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                          index < 3 
                            ? 'bg-blue-200 text-blue-800' 
                            : 'bg-gray-200 text-gray-800'
                        }`}>
                          {hashtag.usage_count}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Content Type Breakdown Chart */}
              {analyticsData.content_stats?.media_type_breakdown && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Content Type Breakdown</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(analyticsData.content_stats.media_type_breakdown).map(([type, count]) => (
                      <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-indigo-600">{count}</p>
                        <p className="text-sm text-gray-600 capitalize">
                          {type === 'photo' ? '📸' : '🎥'} {type}s
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No analytics data available for @{selectedAccount}.</p>
              <p className="text-sm text-gray-500 mb-4">Make sure data has been collected for this account.</p>
              <button
                onClick={loadAnalytics}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
              >
                🔄 Load Analytics
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
