import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import ContentPlanner from './components/ContentPlanner';
import LoginForm from './components/LoginForm';
import AwaitingApproval from './components/AwaitingApproval';
import AdminPortal from './components/AdminPortal';
import { Toaster } from './components/ui/sonner';
import './App.css';

// Get backend URL from environment
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAwaitingApproval, setShowAwaitingApproval] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${BACKEND_URL}/api/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.user) {
        const userData = response.data.user;
        
        // Check approval status
        if (userData.approval_status === 'pending') {
          setShowAwaitingApproval(true);
        } else if (userData.approval_status === 'approved' && userData.is_active) {
          setUser(userData);
        } else {
          // Handle denied or inactive users
          handleLogout();
        }
      }
    } catch (error) {
      console.error('Auth verification failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email,
        password
      });

      if (response.data.show_awaiting_approval) {
        setShowAwaitingApproval(true);
        return { success: true, awaiting: true };
      }

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return { success: true };
      }

      return { success: false, message: response.data.message || 'Login failed' };
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed. Please try again.';
      return { success: false, message };
    }
  };

  const handleRegister = async (userData) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/register`, userData);
      
      if (response.data.approval_status === 'pending') {
        setShowAwaitingApproval(true);
        return { 
          success: true, 
          message: response.data.message,
          awaiting: true 
        };
      }

      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.detail || 'Registration failed. Please try again.';
      return { success: false, message };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setShowAwaitingApproval(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fffaf1] to-[#bb9477]/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#472816] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#472816] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (showAwaitingApproval) {
    return <AwaitingApproval onLogout={handleLogout} />;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={
              user ? (
                <ContentPlanner user={user} onLogout={handleLogout} />
              ) : (
                <LoginForm onLogin={handleLogin} onRegister={handleRegister} />
              )
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;