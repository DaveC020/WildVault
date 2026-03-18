import React, { useState } from 'react';
import { Mail, Lock, User, ShieldCheck, Building2, GraduationCap, Eye, EyeOff } from 'lucide-react';
import PropTypes from 'prop-types';
import { Logo } from '../../components/Logo';
import { buildFullName, fetchUserProfile, fetchUserProfilePhoto, loginUser, setAuthToken } from '../../api/authApi';
import './register.css';

export function Register({ onRegister, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    studentId: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.email, // using email as username to align with login flow
          email: formData.email,
          password: formData.password,
          studentId: formData.studentId,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        let resolvedUser = {
          id: data?.id || null,
          firstName: formData.firstName,
          lastName: formData.lastName,
          fullName: buildFullName({ firstName: formData.firstName, lastName: formData.lastName }, formData.email),
          username: formData.email,
          studentId: formData.studentId || data?.studentId || null,
          department: formData.department || '',
          email: formData.email,
          photoUrl: null,
        };

        const auth = await loginUser({
          username: formData.email,
          password: formData.password,
        });

        setAuthToken(auth.token);

        try {
          const profile = await fetchUserProfile(auth.token);
          const profilePhoto = await fetchUserProfilePhoto(auth.token).catch(() => null);
          const resolvedFullName = buildFullName(profile, profile?.username || formData.email);

          resolvedUser = {
            id: profile?.id || data?.id || null,
            firstName: profile?.firstName || formData.firstName,
            lastName: profile?.lastName || formData.lastName,
            fullName: resolvedFullName,
            username: profile?.username || formData.email,
            studentId: profile?.studentId || formData.studentId || data?.studentId || null,
            department: profile?.department || formData.department || '',
            email: profile?.email || formData.email,
            photoUrl: profilePhoto || profile?.photoUrl || null,
          };
        } catch {
          // Keep registration values if profile endpoint is temporarily unavailable.
        }

        onRegister({
          token: auth.token,
          user: {
            ...resolvedUser,
          },
        });
      } else {
        const text = await response.text();
        setError(text || 'Registration failed');
      }
    } catch {
      setError('An error occurred. Please ensure the backend is running.');
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
    <div className="register-container">
      {/* Decorative Grid Pattern */}
      <div className="register-grid-pattern"></div>
      
      {/* Glow Elements */}
      <div className="register-glow-top"></div>
      <div className="register-glow-bottom"></div>

      <div className="register-content">
        {/* Logo */}
        <div className="register-logo-container">
          <Logo size="lg" className="mb-6" />
        </div>

        {/* Registration Card */}
        <div className="register-card">
          <form onSubmit={handleSubmit} className="register-form">
            <div className="register-header">
              <h2 className="register-title">Create An Account</h2>
              <p className="register-subtitle">Join the WildVault community</p>
            </div>

            {error && <div className="register-error-message">{error}</div>}

            <div className="register-form-fields">
              {/* First Name */}
              <div className="register-form-group">
                <label className="register-label" htmlFor="register-first-name">First Name</label>
                <div className="register-input-wrapper">
                  <div className="register-icon">
                    <User size={18} />
                  </div>
                  <input 
                    id="register-first-name"
                    type="text" 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name" 
                    required
                    className="register-input"
                  />
                </div>
              </div>

              {/* Last Name */}
              <div className="register-form-group">
                <label className="register-label" htmlFor="register-last-name">Last Name</label>
                <div className="register-input-wrapper">
                  <div className="register-icon">
                    <User size={18} />
                  </div>
                  <input
                    id="register-last-name"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    required
                    className="register-input"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="register-form-group">
                <label className="register-label" htmlFor="register-email">Institutional Email</label>
                <div className="register-input-wrapper">
                  <div className="register-icon">
                    <Mail size={18} />
                  </div>
                  <input 
                    id="register-email"
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@university.edu" 
                    required
                    className="register-input"
                  />
                </div>
              </div>

              {/* Department */}
              <div className="register-form-group">
                <label className="register-label" htmlFor="register-department">Department</label>
                <div className="register-input-wrapper">
                  <div className="register-icon">
                    <Building2 size={18} />
                  </div>
                  <input 
                    id="register-department"
                    type="text" 
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="e.g., CCS Department" 
                    required
                    className="register-input"
                  />
                </div>
              </div>

              {/* Student ID */}
              <div className="register-form-group">
                <label className="register-label" htmlFor="register-student-id">Student ID</label>
                <div className="register-input-wrapper">
                  <div className="register-icon">
                    <GraduationCap size={18} />
                  </div>
                  <input 
                    id="register-student-id"
                    type="text" 
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    placeholder="Enter student ID" 
                    required
                    className="register-input"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="register-form-group">
                <label className="register-label" htmlFor="register-password">Password</label>
                <div className="register-input-wrapper">
                  <div className="register-icon">
                    <Lock size={18} />
                  </div>
                  <input 
                    id="register-password"
                    type={showPassword ? "text" : "password"} 
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••" 
                    required
                    minLength={8}
                    className="register-input"
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: 0 }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="register-form-group">
                <label className="register-label" htmlFor="register-confirm-password">Confirm Password</label>
                <div className="register-input-wrapper">
                  <div className="register-icon">
                    <Lock size={18} />
                  </div>
                  <input 
                    id="register-confirm-password"
                    type={showConfirmPassword ? "text" : "password"} 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••" 
                    required
                    minLength={8}
                    className="register-input"
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: 0 }}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="register-submit-btn" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Create Account'}
                {!isLoading && <ShieldCheck size={22} />}
              </button>
            </div>

            <div className="register-switch-container">
              <button 
                type="button"
                onClick={onSwitchToLogin}
                className="register-switch-btn"
              >
                Already Have an Account? Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

Register.propTypes = {
  onRegister: PropTypes.func,
  onSwitchToLogin: PropTypes.func,
};
