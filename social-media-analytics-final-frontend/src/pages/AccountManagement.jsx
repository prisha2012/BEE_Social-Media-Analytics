import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';

const AccountManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [newAccountUsername, setNewAccountUsername] = useState('');
  const [collectingData, setCollectingData] = useState({});

  // Auto-load accounts when component mounts
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      const response = await api.get('/data/accounts');
      const accountsData = response.data.accounts || [];
      setAccounts(accountsData);
      
      if (accountsData.length > 0) {
        setMessage(`✅ Successfully loaded ${accountsData.length} Instagram accounts`);
      } else {
        setMessage('ℹ️ No accounts found. Add your first Instagram account below!');
      }
      
    } catch (error) {
      console.error('Error loading accounts:', error);
      setMessage('❌ Error loading accounts: ' + (error.response?.data?.message || error.message));
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!newAccountUsername.trim()) {
      setMessage('❌ Please enter a valid username');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      
      const cleanUsername = newAccountUsername.replace('@', '').trim().toLowerCase();
      
      // Trigger data collection for new account
      const response = await api.post(`/data/scrape/${cleanUsername}`);
      
      setMessage(`🎉 Success! Started collecting data for @${cleanUsername}. This may take 2-5 minutes.`);
      setNewAccountUsername('');
      
      // Refresh accounts list after a short delay
      setTimeout(() => {
        loadAccounts();
      }, 2000);
      
    } catch (error) {
      console.error('Error adding account:', error);
      setMessage('❌ Error adding account: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCollectData = async (username) => {
    try {
      setCollectingData(prev => ({ ...prev, [username]: true }));
      setMessage('');
      
      const response = await api.post(`/data/scrape/${username}`);
      
      setMessage(`🔄 Data collection started for @${username}! Found ${response.data.count || 0} posts.`);
      
      // Refresh accounts after collection
      setTimeout(() => {
        loadAccounts();
        setCollectingData(prev => ({ ...prev, [username]: false }));
      }, 3000);
      
    } catch (error) {
      console.error('Error collecting data:', error);
      setMessage('❌ Error collecting data: ' + (error.response?.data?.message || error.message));
      setCollectingData(prev => ({ ...prev, [username]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">👤 Account Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.username || user?.email}</span>
              <button
                onClick={loadAccounts}
                disabled={loading}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Loading...' : '🔄 Refresh'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Status Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.includes('❌') ? 'bg-red-50 border border-red-200 text-red-800' :
            message.includes('✅') || message.includes('🎉') ? 'bg-green-50 border border-green-200 text-green-800' :
            'bg-blue-50 border border-blue-200 text-blue-800'
          }`}>
            {message}
          </div>
        )}

        {/* Add New Account */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">➕ Add New Instagram Account</h2>
          
          <form onSubmit={handleAddAccount} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram Username
              </label>
              <input
                type="text"
                placeholder="cristiano, therock, selenagomez..."
                value={newAccountUsername}
                onChange={(e) => setNewAccountUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add & Collect Data'}
            </button>
          </form>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">💡 How it works:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Enter any public Instagram username (without @)</li>
              <li>• We'll collect their posts, followers, and engagement data</li>
              <li>• Data collection takes 2-5 minutes using Apify service</li>
              <li>• View detailed analytics once collection is complete</li>
            </ul>
          </div>
        </div>

        {/* Accounts List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              📊 Your Instagram Accounts ({accounts.length})
            </h2>
          </div>
          
          {loading && accounts.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading accounts...</p>
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🌟</div>
              <h3 className="text-lg font-medium mb-2">No Instagram accounts yet</h3>
              <p className="text-sm mb-6">Add your first account above to start analyzing Instagram data!</p>
              <div className="text-sm text-gray-400">
                <p>Try popular accounts like: cristiano, therock, selenagomez</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map((account, index) => (
                <div key={account.username || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow duration-200">
                  {/* Account Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {account.username ? account.username[0].toUpperCase() : '?'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">@{account.username}</h3>
                        {account.displayName && (
                          <p className="text-sm text-gray-600">{account.displayName}</p>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      account.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {account.isActive !== false ? '✅ Active' : '⏸️ Inactive'}
                    </span>
                  </div>
                  
                  {/* Account Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-2xl font-bold text-blue-600">
                        {account.followersCount ? account.followersCount.toLocaleString() : 'N/A'}
                      </p>
                      <p className="text-xs text-blue-600">Followers</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-2xl font-bold text-green-600">
                        {account.postsCount || 'N/A'}
                      </p>
                      <p className="text-xs text-green-600">Posts</p>
                    </div>
                  </div>
                  
                  {/* Last Updated */}
                  <div className="text-xs text-gray-500 mb-4 text-center">
                    Last updated: {account.lastScrapedAt ? 
                      new Date(account.lastScrapedAt).toLocaleDateString() : 'Never'}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => window.location.href = '/analytics'}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-2 rounded text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                    >
                      📊 Analytics
                    </button>
                    <button 
                      onClick={() => handleCollectData(account.username)}
                      disabled={collectingData[account.username]}
                      className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all duration-200 ${
                        collectingData[account.username]
                          ? 'bg-yellow-100 text-yellow-800 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {collectingData[account.username] ? '⏳ Updating...' : '🔄 Update Data'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {accounts.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Quick Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{accounts.length}</p>
                <p className="text-sm text-gray-600">Total Accounts</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {accounts.reduce((sum, acc) => sum + (acc.followersCount || 0), 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total Followers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {accounts.filter(acc => acc.isActive !== false).length}
                </p>
                <p className="text-sm text-gray-600">Active Accounts</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {accounts.filter(acc => acc.lastScrapedAt).length}
                </p>
                <p className="text-sm text-gray-600">With Data</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountManagement;
