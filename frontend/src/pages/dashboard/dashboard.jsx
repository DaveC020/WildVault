/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { 
  Search, Filter, User, Package, ChevronLeft, Calendar,
  MessageSquare, Trash2, FileText,
  Grid, List as ListIcon, ShieldAlert
} from 'lucide-react';
import { ImageWithFallback } from '../../components/ImageWithFallback';
import { Logo } from '../../components/Logo';
import { fetchUserProfilePhoto, getAuthToken, getInitials } from '../../api/authApi';
import './dashboard.css';

import { ProfilePage } from './profile.jsx';

// --- Initial Mock Data ---
const INITIAL_ITEMS = [
  {
    id: '7',
    name: 'Official Varsity PE Uniform',
    category: 'Athletics',
    owner: 'Athletics Dept.',
    image: 'https://images.unsplash.com/photo-1720514496152-0a3aa33901ec?auto=format&fit=crop&q=80&w=800',
    status: 'borrowed',
    borrowedByMe: true,
    returnDate: '2026-02-12',
    description: 'Freshly laundered official university physical education uniform. Includes top and shorts. Perfect for intramural games.',
    sizeTag: 'MEDIUM',
    specs: ['Material: Breathable Mesh', 'Size: Medium', 'Laundered: Yes']
  },
  {
    id: '1',
    name: 'Graphing Calculator TI-84 Plus',
    category: 'Calculators',
    owner: 'Dr. Sarah Mitchell',
    image: 'https://images.unsplash.com/photo-1598690042638-1b9844b7ef83?auto=format&fit=crop&q=80&w=800',
    status: 'available',
    description: 'High-performance graphing calculator for advanced mathematics and science. Includes USB cable and protective case.',
    specs: ['Battery: 4 AAA', 'Display: 320 x 240 pixels', 'Weight: 230g']
  },
  {
    id: '2',
    name: 'Professional 24" T-Square',
    category: 'Architecture',
    owner: 'Marcus Chen',
    image: 'https://images.unsplash.com/photo-1685976045770-0562879cff98?auto=format&fit=crop&q=80&w=800',
    status: 'borrowed',
    returnDate: '2026-02-15',
    description: 'Precision drafting tool for architectural and engineering drawings. High-transparency blade.'
  },
  {
    id: '3',
    name: 'Eco-Premium Yoga Mat',
    category: 'Wellness',
    owner: 'Chloe Bennett',
    image: 'https://images.unsplash.com/photo-1767605523281-8b54b3692078?auto=format&fit=crop&q=80&w=800',
    status: 'available',
    description: 'High-grip, sustainable material mat perfect for campus recreation classes. Antibacterial surface.'
  },
];

const INITIAL_REQUESTS = [
  { id: 'R1', itemName: 'TI-84 Calculator', requester: 'John Doe', date: '2026-02-04', status: 'pending' },
];

export function Dashboard({ onLogout, currentUser, onProfileUpdated }) {
  const [view, setView] = useState('home');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionUser, setSessionUser] = useState(currentUser || null);

  const [items, setItems] = useState(INITIAL_ITEMS);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);

  useEffect(() => {
    setSessionUser(currentUser || null);
  }, [currentUser]);

  useEffect(() => {
    let isActive = true;

    if (sessionUser?.photoUrl) {
      return () => {
        isActive = false;
      };
    }

    const token = getAuthToken();
    if (!token) {
      return () => {
        isActive = false;
      };
    }

    fetchUserProfilePhoto(token, { forceRefresh: true })
      .then((photoUrl) => {
        if (!isActive || !photoUrl) {
          return;
        }
        setSessionUser((prev) => (prev ? { ...prev, photoUrl } : prev));
      })
      .catch(() => {
        // Keep initials fallback when no profile photo is available.
      });

    return () => {
      isActive = false;
    };
  }, [sessionUser?.photoUrl]);

  const fullName = sessionUser?.fullName || sessionUser?.name || sessionUser?.username || sessionUser?.email || 'User';
  const displayEmail = sessionUser?.email || '';
  const initials = getInitials(fullName);

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBorrowRequest = (itemId, returnDate, purpose) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    const newRequest = {
      id: 'R' + Math.random().toString(36).substring(2, 11),
      itemName: item.name,
      requester: fullName,
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    
    setRequests([...requests, newRequest]);
    alert('Borrow request submitted successfully! Awaiting owner approval.');
    setView('home');
  };

  const handleReturnItem = (itemId) => {
    setItems(items.map(i => i.id === itemId ? {...i, status: 'available', borrowedByMe: false, borrowedBy: undefined, returnDate: undefined} : i));
    alert('Item returned successfully!');
    setView('user-dashboard');
  };

  const renderHomeView = () => (
    <HomeView
      items={filteredItems}
      onSelectItem={(item) => { setSelectedItem(item); setView('detail'); }}
      isAdmin={isAdmin}
      onDeleteItem={(id) => setItems(items.filter(i => i.id !== id))}
    />
  );

  const renderContent = () => {
    switch (view) {
      case 'home':
        return renderHomeView();
      case 'detail': return selectedItem ? (
        <ItemDetailView 
          item={selectedItem} 
          onBack={() => setView('home')} 
          onBorrowRequest={handleBorrowRequest}
          onReturn={handleReturnItem}
        />
      ) : null;
      case 'profile': return (
        <ProfilePage 
           user={{
             id: sessionUser?.id || null,
             studentId: sessionUser?.studentId || null,
             department: sessionUser?.department || '',
             username: sessionUser?.username || displayEmail,
             firstName: sessionUser?.firstName || '',
             lastName: sessionUser?.lastName || '',
             fullName,
             email: displayEmail,
             avatarUrl: sessionUser?.photoUrl || null,
           }}
           onLogout={onLogout} 
           onProfileUpdated={(updatedUser) => {
             setSessionUser((prev) => ({ ...prev, ...updatedUser }));
             onProfileUpdated?.(updatedUser);
           }}
        />
      );
      default:
        return renderHomeView();
    }
  };

  return (
    <div className="dash-bg">
      {view !== 'admin' && (
        <header className="dash-header">
          <div className="dash-header-left">
            <button type="button" className="dash-logo-link" onClick={() => setView('home')}>
              <Logo size="sm" />
            </button>
            <div className="dash-search-wrapper">
              <Search className="dash-search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Search the vault (e.g. 'Calculators')..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="dash-search-input"
              />
            </div>
          </div>

          <nav className="dash-nav">
            <button className="dash-btn-filter">
              <Filter size={16} /> Filter
            </button>
            <button 
              onClick={() => setView('user-dashboard')}
              className={`dash-btn-nav ${view === 'user-dashboard' ? 'active' : ''}`}
            >
              <Package size={18} /> My Items
            </button>
            <div className="dash-divider"></div>
            <button onClick={() => setView('profile')} className="dash-profile-btn">
                <div className="dash-avatar" aria-label="User avatar">
                  {sessionUser?.photoUrl ? (
                    <img
                      src={sessionUser.photoUrl}
                      alt={`${fullName || 'User'} avatar`}
                      className="dash-avatar-image"
                    />
                  ) : (
                    initials
                  )}
                </div>
              <div>
                <p className="dash-profile-name">{fullName}</p>
                {sessionUser?.studentId && (
                  <p className="dash-profile-role">{sessionUser.studentId}</p>
                )}
              </div>
            </button>
          </nav>
        </header>
      )}

      <main className="dash-main">
        {renderContent()}
      </main>

      {view !== 'admin' && (
        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-logo">
              <Logo size="sm" />
            </div>
            <div className="footer-links">
              <button type="button">Safety Code</button>
              <button type="button">Protocols</button>
              <button type="button">Support</button>
            </div>
            <p className="footer-copy">© 2026 Vault Authority</p>
          </div>
        </footer>
      )}
    </div>
  );
}

function HomeView({ items, onSelectItem, isAdmin, onDeleteItem }) {
  const getActionLabel = (item) => {
    if (item.borrowedByMe) {
      return 'View Details';
    }

    if (item.status === 'borrowed') {
      return 'Reserved';
    }

    return 'Request Access';
  };

  return (
    <div className="dash-view-container">
      <div className="dash-view-header">
        <div>
          <p className="dash-title-sub">Central Inventory</p>
          <h2 className="dash-title-main">Available Gear</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
           {isAdmin && (
             <div className="dash-admin-badge">
               <ShieldAlert size={16} /> Admin Management Active
             </div>
           )}
           <button className="dash-icon-btn"><Grid size={20} /></button>
           <button className="dash-icon-btn-inactive"><ListIcon size={20} /></button>
        </div>
      </div>
      
      <div className="dash-grid">
        {items.map(item => (
          <div key={item.id} className="item-card">
            {isAdmin && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteItem(item.id); }}
                className="item-delete-btn" title="Delete Asset"
              >
                <Trash2 size={20} strokeWidth={3} />
              </button>
            )}
            <div className="item-img-box">
              <ImageWithFallback src={item.image} alt={item.name} className="item-img" />
              <div className="item-tags-top">
                <span className={`item-tag ${item.status === 'available' ? 'available' : 'borrowed'}`}>
                  {item.status}
                </span>
                {item.borrowedByMe && (
                  <span className="item-tag me">BORROWED BY YOU</span>
                )}
              </div>
              {item.sizeTag && (
                <div className="item-tag-size">SIZE: {item.sizeTag}</div>
              )}
            </div>
            <div className="item-content">
              <div className="item-meta">
                <span className="item-cat">{item.category}</span>
                <span className="item-id">#VT-{item.id}</span>
              </div>
              <h3 className="item-title">{item.name}</h3>
              <p className="item-desc">{item.description}</p>
              
              <div className="item-footer">
                <div className="item-owner">
                  <div className="item-owner-icon"><User size={18} /></div>
                  <div className="item-owner-details">
                    <h6>Owner</h6>
                    <p>{item.owner}</p>
                  </div>
                </div>
                <button 
                  onClick={() => onSelectItem(item)}
                  className={`btn ${item.status === 'available' || item.borrowedByMe ? 'primary' : 'disabled'}`}
                >
                  {getActionLabel(item)}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ItemDetailView({ item, onBack, onBorrowRequest, onReturn }) {
  const [returnDate, setReturnDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const returnDateId = `return-date-${item.id}`;
  const purposeId = `purpose-${item.id}`;

  const handleSubmit = () => {
    if (!returnDate || !purpose) {
      alert('Please fill in all fields');
      return;
    }
    onBorrowRequest(item.id, returnDate, purpose);
  };

  return (
    <div className="detail-container">
      <button onClick={onBack} className="detail-back">
        <ChevronLeft size={20} strokeWidth={3} /> Back to Registry
      </button>

      <div className="detail-layout">
        <div className="detail-left">
          <div className="detail-img-box">
            <ImageWithFallback src={item.image} alt={item.name} />
          </div>
          <div className="detail-specs">
            <div className="detail-specs-header">
              <FileText size={20} color="#4f46e5" />
              <span>Technical Specs</span>
            </div>
            <div>
              {item.specs ? item.specs.map((spec) => (
                <div key={spec} className="detail-spec-row">
                  <span className="detail-spec-key">{spec.split(':')[0]}</span>
                  <span className="detail-spec-val">{spec.split(':')[1] || spec}</span>
                </div>
              )) : <p style={{ fontSize: '0.875rem', color: '#94a3b8', fontStyle: 'italic' }}>No additional specifications available.</p>}
            </div>
          </div>
        </div>

        <div className="detail-right">
          <div className="detail-badges">
            <span className="badge cat">{item.category}</span>
            <span className={`badge ${item.status === 'available' ? 'available' : 'borrowed'}`}>{item.status}</span>
            {item.borrowedByMe && <span className="badge me">Borrowed by You</span>}
          </div>

          <h1 className="detail-title">{item.name}</h1>
          
          <div className="detail-owner-card">
            <div className="detail-owner-icon"><User size={24} /></div>
            <div className="detail-owner-info">
              <h6>Authenticated Owner</h6>
              <p>{item.owner}</p>
            </div>
          </div>

          <p className="detail-desc">{item.description}</p>

          {item.status === 'available' && (
            <div className="detail-action-card">
              <div className="form-grp">
                <label htmlFor={returnDateId}>Loan Termination Date</label>
                <div className="input-wrap">
                  <Calendar className="input-icon" size={20} />
                  <input id={returnDateId} type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} className="form-input" />
                </div>
              </div>
              <div className="form-grp">
                <label htmlFor={purposeId}>Mission Statement (Purpose)</label>
                <div className="input-wrap">
                  <MessageSquare className="input-icon" size={20} style={{ top: '1.5rem', transform: 'none' }} />
                  <textarea id={purposeId} value={purpose} onChange={e => setPurpose(e.target.value)} className="form-textarea form-input" placeholder="Describe intended use..."></textarea>
                </div>
              </div>
              <button onClick={handleSubmit} className="btn-large">
                Initiate Borrow Protocol
              </button>
            </div>
          )}

          {item.borrowedByMe && (
            <div style={{ display: 'flex', gap: '1rem' }}>
               <button className="btn-large" style={{ flex: 1 }}>Extend Registry</button>
               <button onClick={() => onReturn(item.id)} className="btn-large sec" style={{ flex: 1 }}>Process Return</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
