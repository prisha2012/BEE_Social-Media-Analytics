import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from './store/authSlice';

// Import pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AccountManagement from './pages/AccountManagement';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

function App() {
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Check for existing token on app load
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken && !isAuthenticated) {
      dispatch(loginSuccess({
        user: { email: 'Existing User' },
        token: savedToken
      }));
    }
  }, [dispatch, isAuthenticated]);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              !isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />
            }
          />
          <Route
            path="/register"
            element={
              !isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/accounts"
            element={
              isAuthenticated ? <AccountManagement /> : <Navigate to="/login" replace />
            }
          />

          <Route
            path="/analytics"
            element={
              isAuthenticated ? <AnalyticsDashboard /> : <Navigate to="/login" replace />
            }
          />

          <Route
            path="/data-collection"
            element={
              isAuthenticated ? (
                <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                  <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <h1 className="text-2xl font-bold mb-4">🔄 Data Collection</h1>
                    <p className="text-gray-600">Coming next! We'll build data collection features here.</p>
                  </div>
                </div>
              ) : <Navigate to="/login" replace />
            }
          />

          {/* Default Route */}
          <Route
            path="/"
            element={
              <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
            }
          />

          {/* Catch all route */}
          <Route
            path="*"
            element={
              <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
//Authentication System
