import React, { useState, useEffect } from 'react';
import { LandingPage } from './pages/landing/landing.jsx';
import { Login } from './pages/login/login.jsx';
import { Register } from './pages/register/register.jsx';
import { Dashboard } from './pages/dashboard/dashboard.jsx';
import { clearAuthToken, getAuthToken, fetchUserProfile, fetchUserProfilePhoto, buildFullName, decodeJwtSubject } from './api/authApi';
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

    globalThis.addEventListener('popstate', handlePopState);
    return () => globalThis.removeEventListener('popstate', handlePopState);
  }, []);

  // Push state to browser history when view changes
  const updateViewWithHistory = (view, user = null) => {
    globalThis.history.pushState(
      { view, user },
      '',
      globalThis.location.pathname
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
        let profile = null;
        try {
          profile = await fetchUserProfile(token);
        } catch (error) {
          if (error?.status === 401 || error?.status === 403) {
            clearAuthToken();
            return;
          }
        }

        const profilePhoto = await fetchUserProfilePhoto(token, { forceRefresh: true }).catch(() => null);
        const tokenSubject = decodeJwtSubject(token);
        const identity = profile?.username || profile?.email || tokenSubject || 'User';
        const resolvedFullName = buildFullName(profile, identity);

        const userData = {
          id: profile?.id || null,
          studentId: profile?.studentId || null,
          department: profile?.department || '',
          username: identity,
          firstName: profile?.firstName || '',
          lastName: profile?.lastName || '',
          fullName: resolvedFullName,
          email: profile?.email || identity,
          photoUrl: profilePhoto || profile?.photoUrl || null,
        };

        setCurrentUser(userData);
        setCurrentView('dashboard');
        // Initialize history state
        globalThis.history.replaceState(
          { view: 'dashboard', user: userData },
          ''
        );
      } catch (error) {
        if (error?.status === 401 || error?.status === 403) {
          clearAuthToken();
        }
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

  useEffect(() => {
    if (currentView === 'dashboard' && !currentUser) {
      setCurrentView('login');
      globalThis.history.replaceState({ view: 'login', user: null }, '', globalThis.location.pathname);
    }
  }, [currentView, currentUser]);

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