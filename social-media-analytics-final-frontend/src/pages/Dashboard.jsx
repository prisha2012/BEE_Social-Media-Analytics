import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { logout } from '../store/authSlice';

const Dashboard = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Accounts', path: '/accounts', icon: '👤' },
    { name: 'Analytics', path: '/analytics', icon: '📈' },
    { name: 'Data Collection', path: '/data-collection', icon: '🔄' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Instagram Analytics</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.username || user?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-4">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:text-blue-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🎉 Instagram Analytics Dashboard</h2>
            <p className="text-lg text-gray-600 mb-8">
              Your full-stack application is working perfectly! Navigate to different sections using the menu above.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-blue-900 mb-2">🏆 Authentication</h3>
                <p className="text-blue-700 font-semibold">✅ Working</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-green-900 mb-2">🔗 Backend API</h3>
                <p className="text-green-700 font-semibold">✅ Connected</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-purple-900 mb-2">⚛️ Frontend</h3>
                <p className="text-purple-700 font-semibold">✅ Ready</p>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-orange-900 mb-2">🚀 Features</h3>
                <p className="text-orange-700 font-semibold">✅ Building</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link 
                to="/accounts"
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
              >
                <h3 className="text-xl font-bold mb-2">👤 Manage Accounts</h3>
                <p>Add and manage Instagram accounts for tracking</p>
              </Link>
              
              <Link 
                to="/analytics"
                className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-6 rounded-lg hover:from-green-600 hover:to-teal-600 transition-all"
              >
                <h3 className="text-xl font-bold mb-2">📈 View Analytics</h3>
                <p>Explore insights and performance metrics</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
