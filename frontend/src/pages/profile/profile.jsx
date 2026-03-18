import React from 'react';
import { Mail, LogOut, Edit, Activity, Package, Clock } from 'lucide-react';
import { getInitials } from '../../api/authApi';
import './profile.css';

export function ProfilePage({ user, onLogout, onEdit }) {
  // Mock activity summary
  const activitySummary = [
    { label: 'Asset Lifecycle', value: '12', icon: <Package size={16} /> },
    { label: 'Active Inquiries', value: '2', icon: <Clock size={16} /> },
    { label: 'Trust Rating', value: '98%', icon: <Activity size={16} /> },
  ];

  const initials = getInitials(user?.name);

  return (
    <div className="profile-container">
      <div className="profile-header-card">
        <div className="profile-banner">
          <div className="profile-banner-pattern" />
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user?.name || 'User'} className="profile-avatar-img" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
          </div>
        </div>
        <div className="profile-info-section">
          <div className="profile-details">
            <h1 className="profile-name">{user?.name || 'User'}</h1>
            <div className="profile-meta">
              <div className="profile-meta-item">
                <Mail size={16} className="profile-meta-icon" />
                <span>{user?.email || 'N/A'}</span>
              </div>
            </div>
          </div>
          <div className="profile-actions">
            <button onClick={onEdit} className="profile-btn profile-btn-outline">
              <Edit size={16} style={{ marginRight: '8px' }} />
              Modify Profile
            </button>
            <button onClick={onLogout} className="profile-btn profile-btn-ghost">
              <LogOut size={16} style={{ marginRight: '8px' }} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="profile-stats-grid">
        {activitySummary.map((item, idx) => (
          <div key={idx} className="profile-stat-card">
            <div className="profile-stat-content">
              <div className="profile-stat-icon-wrapper">
                {item.icon}
              </div>
              <div className="profile-stat-info">
                <p className="profile-stat-label">{item.label}</p>
                <p className="profile-stat-value">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="profile-history-card">
        <div className="profile-history-header">
          <h2 className="profile-history-title">
            <Activity size={20} className="profile-history-icon" />
            Asset Transaction History
          </h2>
        </div>
        <div className="profile-history-list">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="profile-history-item">
              <div className="profile-history-item-left">
                <div className="profile-history-item-icon-wrapper">
                  <Package size={24} />
                </div>
                <div className="profile-history-item-details">
                  <p className="profile-history-item-name">Returned High-Performance Laptop</p>
                  <p className="profile-history-item-date">Settled: Feb {5 - i}, 2026</p>
                </div>
              </div>
              <div className="profile-history-badge">
                Verified
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
