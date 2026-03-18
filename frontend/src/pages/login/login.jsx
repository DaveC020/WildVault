import React, { useState } from 'react';
import { Mail, Lock, ShieldCheck } from 'lucide-react';
import PropTypes from 'prop-types';
import { Logo } from '../../components/Logo';
import {
  buildDisplayName,
  fetchUserProfilePhoto,
  fetchUserProfile,
  loginUser,
  setAuthToken,
} from '../../api/authApi';
import './login.css';

export function Login({ onLogin, onSwitchToRegister }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const auth = await loginUser({
        username: formData.email,
        password: formData.password,
      });

      setAuthToken(auth.token);

      let resolvedUser = {
        id: null,
        studentId: null,
        username: formData.email,
        displayName: buildDisplayName(null, formData.email),
        fullName: buildDisplayName(null, formData.email),
        email: formData.email,
        photoUrl: null,
      };

      try {
        const profile = await fetchUserProfile(auth.token);
        const profilePhoto = await fetchUserProfilePhoto(auth.token).catch(() => null);
        const resolvedDisplayName = buildDisplayName(profile, formData.email);
        const resolvedFullName = profile?.fullName?.trim()
          ? profile.fullName.trim()
          : buildDisplayName(null, profile?.username || formData.email);
        resolvedUser = {
          id: profile?.id || null,
          studentId: profile?.studentId || null,
          username: profile?.username || formData.email,
          displayName: resolvedDisplayName,
          fullName: resolvedFullName,
          email: profile?.email || formData.email,
          photoUrl: profilePhoto || profile?.photoUrl || null,
        };
      } catch {
        // Keep fallback identity from login identifier if profile endpoint is unavailable.
      }

      onLogin({
        token: auth.token,
        user: resolvedUser,
      });
    } catch (err) {
      setError(err?.message || 'An error occurred. Please ensure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-container">
      {/* Decorative Grid Pattern */}
      <div className="login-grid-pattern"></div>

      {/* Glow Elements */}
      <div className="login-glow-top"></div>
      <div className="login-glow-bottom"></div>

      <div className="login-content">
        {/* Logo */}
        <div className="login-logo-container">
          <Logo size="lg" className="mb-6" />
        </div>

        {/* Login Card */}
        <div className="login-card">
          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-header">
              <h2 className="login-title">Welcome Back</h2>
              <p className="login-subtitle">Enter your university credentials</p>
            </div>

            {error && <div className="login-error-message">{error}</div>}

            <div className="login-form-fields">
              {/* Email */}
              <div className="login-form-group">
                <label className="login-label" htmlFor="login-email">Institutional Email</label>
                <div className="login-input-wrapper">
                  <div className="login-icon">
                    <Mail size={18} />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@university.edu"
                    required
                    className="login-input"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="login-form-group">
                <div className="login-label-row">
                  <label className="login-label" htmlFor="login-password">Secure Passphrase</label>
                  <button type="button" className="login-reset-btn">Reset</button>
                </div>
                <div className="login-input-wrapper">
                  <div className="login-icon">
                    <Lock size={18} />
                  </div>
                  <input
                    id="login-password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    required
                    className="login-input"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button type="submit" className="login-submit-btn" disabled={isLoading}>
                {isLoading ? 'Authenticating...' : 'Unlock Vault'}
                {!isLoading && <ShieldCheck size={22} />}
              </button>
            </div>

            {onSwitchToRegister && (
              <div className="login-switch-container">
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="login-switch-btn"
                >
                  No account? Register Now
                </button>
              </div>
            )}
          </form>
        </div>

        <p className="login-footer-text">
          This is a protected university environment. All transactions are logged for community safety and institutional compliance.
        </p>
      </div>
    </div>
  );
}

Login.propTypes = {
  onLogin: PropTypes.func,
  onSwitchToRegister: PropTypes.func,
};