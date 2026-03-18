import React, { useState, useEffect } from 'react';
import { LandingPage } from './pages/landing/landing.jsx';
import { Login } from './pages/login/login.jsx';
import { Register } from './pages/register/register.jsx';
import { Dashboard } from './pages/dashboard/dashboard.jsx';
import { clearAuthToken, getAuthToken, fetchUserProfile, fetchUserProfilePhoto, buildDisplayName } from './api/authApi';
import './App.css';

export default function App() {
  // Navigation State: 'landing' | 'login' | 'register' | 'dashboard'
  const [currentView, setCurrentView] = useState('landing');
  const [currentUser, setCurrentUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Handle browser back/forward button
  useEffect(() => {
    const handlePopState = (event) => {
      const state = event.state;
      if (state) {
        setCurrentView(state.view);
        setCurrentUser(state.user || null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Push state to browser history when view changes
  const updateViewWithHistory = (view, user = null) => {
    window.history.pushState(
      { view, user },
      '',
      window.location.pathname
    );
    setCurrentView(view);
    setCurrentUser(user);
  };

  // Restore user session on app load if token exists
  useEffect(() => {
    const restoreSession = async () => {
      const token = getAuthToken();
      if (!token) {
        setIsInitializing(false);
        return;
      }

      try {
        const profile = await fetchUserProfile(token);
        const profilePhoto = await fetchUserProfilePhoto(token).catch(() => null);
        const resolvedDisplayName = buildDisplayName(profile, profile?.username || profile?.email);
        const resolvedFullName = profile?.fullName?.trim()
          ? profile.fullName.trim()
          : buildDisplayName(null, profile?.username || profile?.email);

        const userData = {
          id: profile?.id || null,
          studentId: profile?.studentId || null,
          username: profile?.username || profile?.email || 'User',
          fullName: resolvedFullName,
          displayName: resolvedDisplayName,
          email: profile?.email || 'User',
          photoUrl: profilePhoto || null,
        };

        setCurrentUser(userData);
        setCurrentView('dashboard');
        // Initialize history state
        window.history.replaceState(
          { view: 'dashboard', user: userData },
          ''
        );
      } catch (error) {
        // Token invalid or expired
        clearAuthToken();
        setIsInitializing(false);
      }
    };

    restoreSession().finally(() => setIsInitializing(false));
  }, []);

  const handleGetStarted = () => {
    updateViewWithHistory('login');
  };

  const handleLogin = ({ user }) => {
    updateViewWithHistory('dashboard', user);
  };

  const handleRegister = ({ user }) => {
    updateViewWithHistory('dashboard', user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    clearAuthToken();
    updateViewWithHistory('landing');
  };

  const handleSwitchToRegister = () => {
    updateViewWithHistory('register', currentUser);
  };

  const handleSwitchToLogin = () => {
    updateViewWithHistory('login', currentUser);
  };

  const handleProfileUpdated = (updatedFields) => {
    setCurrentUser((prev) => prev ? { ...prev, ...updatedFields } : prev);
  };

  if (isInitializing) {
    return (
      <div className="app-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#fbfbfa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1rem', color: '#64748b' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {currentView === 'landing' && (
        <LandingPage onGetStarted={handleGetStarted} />
      )}
      
      {currentView === 'login' && (
        <Login 
          onLogin={handleLogin} 
          onSwitchToRegister={handleSwitchToRegister} 
        />
      )}
      
      {currentView === 'register' && (
        <Register 
          onRegister={handleRegister} 
          onSwitchToLogin={handleSwitchToLogin} 
        />
      )}
      
      {currentView === 'dashboard' && (
        <Dashboard onLogout={handleLogout} currentUser={currentUser} onProfileUpdated={handleProfileUpdated} />
      )}
    </div>
  );
}