import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search, Filter, User, Package, ChevronLeft, Calendar,
  MessageSquare, Trash2, FileText, Grid, List as ListIcon,
  ShieldAlert, Plus, ClipboardList, CheckCircle2, XCircle,
  RotateCcw, Clock, Save, Pencil
} from 'lucide-react';
import { ImageWithFallback } from '../../components/ImageWithFallback';
import { Logo } from '../../components/Logo';
import { fetchUserProfilePhoto, getAuthToken, getInitials } from '../../api/authApi';
import {
  createVaultItem,
  deleteVaultItem,
  fetchCalendarEvents,
  fetchDashboardData,
  fetchRequestHistory,
  manageBorrowRequest,
  submitBorrowRequest,
  updateVaultItem,
} from '../../api/vaultApi';
import './dashboard.css';

import { ProfilePage } from './profile.jsx';

const CATEGORY_DETAIL_SECTIONS = {
  'Academic & School Supplies': [
    { key: 'itemType', label: 'Item type', type: 'text', placeholder: 'e.g., Graphing calculator' },
    { key: 'subjectRelevance', label: 'Subject relevance', type: 'text', placeholder: 'e.g., Mathematics / Science' },
    { key: 'edition', label: 'Edition (if applicable)', type: 'text', placeholder: 'e.g., 3rd edition' },
    { key: 'conditionDetails', label: 'Condition details', type: 'textarea', placeholder: 'Describe wear, markings, or missing parts.' },
    { key: 'annotationAllowed', label: 'Annotation allowed', type: 'select', options: ['Yes', 'No'] },
  ],
  'Electronics & Gadgets': [
    { key: 'deviceType', label: 'Device type', type: 'text', placeholder: 'e.g., Tablet, laptop, projector' },
    { key: 'osCompatibility', label: 'OS / compatibility', type: 'text', placeholder: 'e.g., Windows 11 / Android / USB-C' },
    { key: 'functionalPurpose', label: 'Functional purpose', type: 'textarea', placeholder: 'What is it typically used for?' },
    { key: 'includedAccessories', label: 'Included accessories', type: 'text', placeholder: 'Chargers, cables, cases, etc.' },
    { key: 'workingCondition', label: 'Working condition', type: 'select', options: ['Fully working', 'Partially working', 'Needs repair'] },
  ],
  'Audio-Visual (AV) Equipment': [
    { key: 'equipmentType', label: 'Equipment type', type: 'text', placeholder: 'e.g., Microphone, projector, speaker' },
    { key: 'ioCompatibility', label: 'Input/output compatibility', type: 'text', placeholder: 'e.g., HDMI, XLR, Bluetooth' },
    { key: 'powerSource', label: 'Power source', type: 'text', placeholder: 'Battery, AC, USB, etc.' },
    { key: 'testedWorkingStatus', label: 'Tested working status', type: 'select', options: ['Tested working', 'Untested', 'Needs service'] },
  ],
  'Sports & Athletics': [
    { key: 'sportType', label: 'Sport type', type: 'text', placeholder: 'e.g., Basketball, badminton, running' },
    { key: 'equipmentType', label: 'Equipment type', type: 'text', placeholder: 'e.g., Ball, racket, pad' },
    { key: 'size', label: 'Size (if applicable)', type: 'text', placeholder: 'e.g., Size 9, medium, 12 oz' },
    { key: 'safetyCondition', label: 'Safety condition', type: 'textarea', placeholder: 'Any wear, damage, or safety concerns?' },
  ],
  'Board Games & Recreation': [
    { key: 'gameNameType', label: 'Game name/type', type: 'text', placeholder: 'e.g., Chess, Monopoly, card game' },
    { key: 'completenessStatus', label: 'Completeness status', type: 'text', placeholder: 'Complete, missing pieces, etc.' },
    { key: 'playerCountRange', label: 'Player count range', type: 'text', placeholder: 'e.g., 2-4 players' },
  ],
  'Events & Organization Material': [
    { key: 'itemType', label: 'Item type', type: 'text', placeholder: 'e.g., Folding table, banner stand' },
    { key: 'sizeCapacity', label: 'Size/capacity', type: 'text', placeholder: 'Dimensions or maximum capacity' },
    { key: 'setupRequirement', label: 'Setup requirement', type: 'textarea', placeholder: 'Describe assembly or setup needs.' },
    { key: 'indoorOutdoorSuitability', label: 'Indoor/outdoor suitability', type: 'select', options: ['Indoor', 'Outdoor', 'Both'] },
  ],
  'Tools & Maintenance': [
    { key: 'toolType', label: 'Tool type', type: 'text', placeholder: 'e.g., Drill, wrench, ladder' },
    { key: 'powerSource', label: 'Power source', type: 'text', placeholder: 'Manual, battery, electric, etc.' },
    { key: 'functionUseCase', label: 'Function/use case', type: 'textarea', placeholder: 'What task is it used for?' },
    { key: 'safetyLevel', label: 'Safety level', type: 'text', placeholder: 'Low, medium, high, or notes' },
  ],
  'Health & Wellness': [
    { key: 'itemType', label: 'Item type', type: 'text', placeholder: 'e.g., First aid kit, blood pressure monitor' },
    { key: 'safetyLevel', label: 'Safety level', type: 'text', placeholder: 'Low, medium, high, or notes' },
    { key: 'sterilizationStatus', label: 'Sterilization status (if applicable)', type: 'text', placeholder: 'Sterile, cleaned, needs sterilization' },
  ],
  'Miscellaneous / Others': [
    { key: 'justification', label: 'Clear justification', type: 'textarea', placeholder: 'Explain why this item does not fit the other categories.' },
  ],
};

const CATEGORY_KEYWORDS = [
  { category: 'Academic & School Supplies', keywords: ['book', 'notebook', 'calculator', 'pen', 'pencil', 'ruler', 'school', 'class', 'subject'] },
  { category: 'Electronics & Gadgets', keywords: ['laptop', 'phone', 'tablet', 'charger', 'headphone', 'keyboard', 'mouse', 'monitor', 'device'] },
  { category: 'Audio-Visual (AV) Equipment', keywords: ['projector', 'microphone', 'speaker', 'camera', 'av', 'audio', 'visual', 'hdmi', 'xlr'] },
  { category: 'Sports & Athletics', keywords: ['ball', 'racket', 'jersey', 'helmet', 'sports', 'athletic', 'basketball', 'football', 'badminton'] },
  { category: 'Board Games & Recreation', keywords: ['board game', 'card game', 'chess', 'monopoly', 'scrabble', 'game'] },
  { category: 'Events & Organization Material', keywords: ['banner', 'stand', 'table', 'chair', 'event', 'organizer', 'booth'] },
  { category: 'Tools & Maintenance', keywords: ['tool', 'drill', 'wrench', 'screwdriver', 'hammer', 'maintenance', 'ladder'] },
  { category: 'Health & Wellness', keywords: ['health', 'wellness', 'first aid', 'thermometer', 'blood pressure', 'medical', 'sterile'] },
];

const CATEGORY_SUPPORT_NOTE = 'Use Miscellaneous / Others only when no other category fits. If it is selected, explain why in the justification field.';

const EMPTY_STATS = {
  total_items: 0,
  available_items: 0,
  borrowed_items: 0,
  overdue_items: 0,
};

function normalizeItem(item = {}) {
  const category = item.category || (Array.isArray(item.categories) ? item.categories.join(', ') : 'Uncategorized');
  const isAvailable = item.is_available ?? item.available ?? item.status === 'available';
  const owner = item.owner?.fullName || item.owner_name || item.owner?.username || item.owner?.email || 'Unknown Owner';
  const ownerPhotoUrl = item.owner?.photoUrl || item.owner_photo_url || item.ownerPhotoUrl || '';

  return {
    id: String(item.id),
    rawId: item.id,
    name: item.name || 'Untitled Item',
    category: category || 'Uncategorized',
    categories: item.categories || [],
    owner,
    ownerData: item.owner || null,
    ownerPhotoUrl,
    image: item.image_url || item.imageUrl || item.image || '',
    status: isAvailable ? 'available' : 'borrowed',
    isOwner: Boolean(item.is_owner),
    quantity: item.quantity || 1,
    phoneNumber: item.phone_number || item.phoneNumber || 'Not provided',
    returnDate: item.returnDate || null,
    description: item.description || 'No description provided.',
    details: parseDetails(item.details || item.details_json || item.detailsJson),
    detailsJson: item.details_json || item.detailsJson || '',
    specs: [
      `Quantity: ${item.quantity || 1}`,
      `Contact: ${item.phone_number || item.phoneNumber || 'Not provided'}`,
      `Category: ${category || 'Uncategorized'}`,
    ],
  };
}

function requestStatusClass(status = '') {
  const lower = status.toLowerCase();
  if (lower === 'approved' || lower === 'returned') return 'available';
  if (lower === 'rejected') return 'borrowed';
  return 'me';
}

function getCategorySchema(category) {
  return CATEGORY_DETAIL_SECTIONS[category] || [];
}

function suggestBestFitCategory(name = '', description = '', details = {}) {
  const haystack = [name, description, ...Object.values(details || {})].join(' ').toLowerCase();
  const match = CATEGORY_KEYWORDS.find((entry) => entry.keywords.some((keyword) => haystack.includes(keyword)));
  return match?.category || '';
}

function formatFieldValue(value) {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  return value || 'Not provided';
}

function UserAvatar({ name, photoUrl, className = '' }) {
  const initials = (name || 'User')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'U';

  return (
    <div className={`owner-avatar ${className}`.trim()} aria-hidden="true">
      {photoUrl ? (
        <img src={photoUrl} alt="" className="owner-avatar-image" />
      ) : (
        <span className="owner-avatar-fallback">{initials}</span>
      )}
    </div>
  );
}

function parseDetails(detailsValue) {
  if (!detailsValue) return {};
  if (typeof detailsValue === 'object') return detailsValue;

  if (typeof detailsValue === 'string') {
    try {
      const parsed = JSON.parse(detailsValue);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  return {};
}

export function Dashboard({ onLogout, currentUser, onProfileUpdated }) {
  const [view, setView] = useState('home');
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [isAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sessionUser, setSessionUser] = useState(currentUser || null);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [requestHistory, setRequestHistory] = useState({ incoming: [], mine: [], records: [] });
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchDashboardData({ search: searchQuery, status: statusFilter });
      setItems((data.items || []).map(normalizeItem));
      setCategories(data.categories || []);
      setStats(data.stats || EMPTY_STATS);
      setIncomingRequests(data.incoming_requests || []);
    } catch (err) {
      setError(err.message || 'Unable to load vault data.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter]);

  const loadRequests = useCallback(async () => {
    try {
      const data = await fetchRequestHistory();
      setRequestHistory({
        incoming: data.incoming || [],
        mine: data.mine || [],
        records: data.records || [],
      });
    } catch (err) {
      setError(err.message || 'Unable to load requests.');
    }
  }, []);

  const loadCalendar = useCallback(async () => {
    try {
      const data = await fetchCalendarEvents();
      setCalendarEvents(data.events || []);
    } catch (err) {
      setError(err.message || 'Unable to load calendar.');
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await loadDashboard();
    await Promise.allSettled([loadRequests(), loadCalendar()]);
  }, [loadCalendar, loadDashboard, loadRequests]);

  useEffect(() => {
    setSessionUser(currentUser || null);
  }, [currentUser]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    if (view === 'requests') {
      loadRequests();
    }
    if (view === 'calendar') {
      loadCalendar();
    }
  }, [loadCalendar, loadRequests, view]);

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
        if (!isActive || !photoUrl) return;
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

  const filteredItems = useMemo(() => items, [items]);

  const myItems = useMemo(() => items.filter((item) => item.isOwner), [items]);

  const setTimedNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3500);
  };

  const handleBorrowRequest = async (itemId, returnDate, purpose) => {
    setError('');
    try {
      await submitBorrowRequest(itemId, { dueDate: returnDate, purpose });
      setTimedNotice('Borrow request submitted successfully. Awaiting owner approval.');
      setView('requests');
      await refreshAll();
    } catch (err) {
      setError(err.message || 'Borrow request failed.');
    }
  };

  const handleRequestAction = async (requestId, action, payload = {}) => {
    setError('');
    try {
      await manageBorrowRequest(requestId, action, payload);
      setTimedNotice(`Request ${action} action completed.`);
      await refreshAll();
      await loadRequests();
    } catch (err) {
      setError(err.message || 'Unable to update request.');
    }
  };

  const handleSaveItem = async (payload, itemId = null) => {
    setError('');
    try {
      if (itemId) {
        await updateVaultItem(itemId, payload);
        setTimedNotice('Item updated successfully.');
      } else {
        await createVaultItem(payload);
        setTimedNotice('Item added successfully.');
      }
      setEditingItem(null);
      setView('my-items');
      await refreshAll();
    } catch (err) {
      setError(err.message || 'Unable to save item.');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Delete this item from your Vault Ledger?')) return;
    setError('');
    try {
      await deleteVaultItem(id);
      setTimedNotice('Item deleted successfully.');
      await refreshAll();
    } catch (err) {
      setError(err.message || 'Unable to delete item.');
    }
  };

  const toggleStatusFilter = () => {
    setStatusFilter((current) => {
      if (current === 'all') return 'available';
      if (current === 'available') return 'borrowed';
      return 'all';
    });
  };

  const renderHomeView = () => (
    <HomeView
      items={filteredItems}
      isLoading={isLoading}
      error={error}
      stats={stats}
      onAddItem={() => { setEditingItem(null); setView('add-item'); }}
      onSelectItem={(item) => { setSelectedItem(item); setView('detail'); }}
      isAdmin={isAdmin}
      onDeleteItem={handleDeleteItem}
    />
  );

  const renderContent = () => {
    switch (view) {
      case 'home':
        return renderHomeView();
      case 'detail':
        return selectedItem ? (
          <ItemDetailView
            item={selectedItem}
            onBack={() => setView('home')}
            onBorrowRequest={handleBorrowRequest}
            onReturn={(requestId) => handleRequestAction(requestId, 'return')}
          />
        ) : renderHomeView();
      case 'add-item':
        return (
          <ItemFormView
            categories={categories}
            onBack={() => setView('my-items')}
            onSubmit={(payload) => handleSaveItem(payload)}
          />
        );
      case 'edit-item':
        return (
          <ItemFormView
            item={editingItem}
            categories={categories}
            onBack={() => setView('my-items')}
            onSubmit={(payload) => handleSaveItem(payload, editingItem?.rawId || editingItem?.id)}
          />
        );
      case 'my-items':
        return (
          <MyItemsView
            items={myItems}
            onAddItem={() => { setEditingItem(null); setView('add-item'); }}
            onSelectItem={(item) => { setSelectedItem(item); setView('detail'); }}
            onEditItem={(item) => { setEditingItem(item); setView('edit-item'); }}
            onDeleteItem={handleDeleteItem}
          />
        );
      case 'requests':
        return (
          <RequestsView
            incoming={requestHistory.incoming}
            mine={requestHistory.mine}
            records={requestHistory.records}
            pendingPreview={incomingRequests}
            onAction={handleRequestAction}
          />
        );
      case 'calendar':
        return <CalendarView events={calendarEvents} />;
      case 'profile':
        return (
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
      <header className="dash-header">
        <div className="dash-header-left">
          <button type="button" className="dash-logo-link" onClick={() => setView('home')}>
            <Logo size="sm" />
          </button>
          <div className="dash-search-wrapper">
            <Search className="dash-search-icon" size={18} />
            <input
              type="text"
              placeholder="Search the vault..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="dash-search-input"
            />
          </div>
        </div>

        <nav className="dash-nav">
          <button className="dash-btn-filter" onClick={toggleStatusFilter} title="Cycle status filter">
            <Filter size={16} /> {statusFilter === 'all' ? 'All' : statusFilter}
          </button>
          <button onClick={() => setView('add-item')} className={`dash-btn-nav ${view === 'add-item' ? 'active' : ''}`}>
            <Plus size={18} /> Add Item
          </button>
          <button onClick={() => setView('my-items')} className={`dash-btn-nav ${view === 'my-items' ? 'active' : ''}`}>
            <Package size={18} /> My Items
          </button>
          <button onClick={() => setView('requests')} className={`dash-btn-nav ${view === 'requests' ? 'active' : ''}`}>
            <ClipboardList size={18} /> Requests
          </button>
          <button onClick={() => setView('calendar')} className={`dash-btn-nav ${view === 'calendar' ? 'active' : ''}`}>
            <Calendar size={18} /> Calendar
          </button>
          <div className="dash-divider"></div>
          <button onClick={() => setView('profile')} className="dash-profile-btn">
            <div className="dash-avatar" aria-label="User avatar">
              {sessionUser?.photoUrl ? (
                <img src={sessionUser.photoUrl} alt={`${fullName || 'User'} avatar`} className="dash-avatar-image" />
              ) : (
                initials
              )}
            </div>
            <div>
              <p className="dash-profile-name">{fullName}</p>
              {sessionUser?.studentId && <p className="dash-profile-role">{sessionUser.studentId}</p>}
            </div>
          </button>
        </nav>
      </header>

      {(notice || error) && (
        <div className={`dash-notice ${error ? 'error' : ''}`}>{error || notice}</div>
      )}

      <main className="dash-main">{renderContent()}</main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo"><Logo size="sm" /></div>
          <div className="footer-links">
            <button type="button">Safety Code</button>
            <button type="button">Protocols</button>
            <button type="button">Support</button>
          </div>
          <p className="footer-copy">© 2026 Vault Authority</p>
        </div>
      </footer>
    </div>
  );
}

function HomeView({ items, isLoading, error, stats, onAddItem, onSelectItem, isAdmin, onDeleteItem }) {
  const [layoutMode, setLayoutMode] = useState('grid');

  return (
    <div className="dash-view-container">
      <div className="dash-view-header">
        <div>
          <p className="dash-title-sub">Central Inventory</p>
          <h2 className="dash-title-main">Available Gear</h2>
        </div>
        <div className="dash-header-actions">
          {isAdmin && <div className="dash-admin-badge"><ShieldAlert size={16} /> Admin Management Active</div>}
          <button className={layoutMode === 'grid' ? 'dash-icon-btn' : 'dash-icon-btn-inactive'} onClick={() => setLayoutMode('grid')}><Grid size={24} /></button>
          <button className={layoutMode === 'list' ? 'dash-icon-btn' : 'dash-icon-btn-inactive'} onClick={() => setLayoutMode('list')}><ListIcon size={24} /></button>
          <button className="btn primary" onClick={onAddItem}><Plus size={20} /> Add Item</button>
        </div>
      </div>

      <StatsRow stats={stats} />

      {isLoading && <EmptyState title="Loading Vault Ledger" description="Fetching items from the backend." />}
      {!isLoading && error && <EmptyState title="Unable to Load Items" description={error} />}
      {!isLoading && !error && items.length === 0 && <EmptyState title="No Items Found" description="Add an item or adjust your search/filter." />}

      <div className={layoutMode === 'grid' ? 'dash-grid' : 'dash-list'}>
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            isAdmin={isAdmin}
            onSelectItem={onSelectItem}
            onDeleteItem={onDeleteItem}
          />
        ))}
      </div>
    </div>
  );
}

function ItemCard({ item, isAdmin, onSelectItem, onDeleteItem }) {
  const getActionLabel = () => {
    if (item.isOwner) return 'Manage';
    if (item.status === 'borrowed') return 'Reserved';
    return 'Request Access';
  };

  return (
    <div className="item-card">
      {(isAdmin || item.isOwner) && (
        <button
          onClick={(event) => {
            event.stopPropagation();
            onDeleteItem(item.rawId || item.id);
          }}
          className="item-delete-btn"
          title="Delete item"
        >
          <Trash2 size={20} strokeWidth={3} />
        </button>
      )}
      <div className="item-img-box">
        <ImageWithFallback src={item.image} alt={item.name} className="item-img" />
        <div className="item-tags-top">
          <span className={`item-tag ${item.status}`}>{item.status}</span>
          {item.isOwner && <span className="item-tag me">YOUR ITEM</span>}
        </div>
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
            <UserAvatar name={item.owner} photoUrl={item.ownerPhotoUrl} />
            <div className="item-owner-details">
              <h6>Owner</h6>
              <p>{item.owner}</p>
            </div>
          </div>
          <button
            onClick={() => onSelectItem(item)}
            className={`btn ${item.status === 'available' || item.isOwner ? 'primary' : 'disabled'}`}
          >
            {getActionLabel()}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatsRow({ stats }) {
  const cards = [
    ['Total Items', stats.total_items, 'stat-total'],
    ['Available', stats.available_items, 'stat-available'],
    ['Borrowed', stats.borrowed_items, 'stat-borrowed'],
    ['Overdue', stats.overdue_items, 'stat-overdue'],
  ];

  return (
    <div className="stats-row">
      {cards.map(([label, value, className]) => (
        <div className={`stats-card ${className}`} key={label}>
          <span>{label}</span>
          <strong>{value ?? 0}</strong>
        </div>
      ))}
    </div>
  );
}

function ItemDetailView({ item, onBack, onBorrowRequest }) {
  const [returnDate, setReturnDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const returnDateId = `return-date-${item.id}`;
  const purposeId = `purpose-${item.id}`;
  const detailRows = Object.entries(item.details || {}).filter(([, value]) => String(value ?? '').trim() !== '');
  const categorySchema = getCategorySchema(item.category);

  const handleSubmit = () => {
    if (!returnDate || !purpose.trim()) {
      alert('Please fill in the due date and purpose.');
      return;
    }
    onBorrowRequest(item.rawId || item.id, returnDate, purpose);
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
              <span>Item Details</span>
            </div>
            <div>
              {item.specs.map((spec) => (
                <div key={spec} className="detail-spec-row">
                  <span className="detail-spec-key">{spec.split(':')[0]}</span>
                  <span className="detail-spec-val">{spec.split(':').slice(1).join(':').trim() || spec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="detail-right">
          <div className="detail-badges">
            <span className="badge cat">{item.category}</span>
            <span className={`badge ${item.status}`}>{item.status}</span>
            {item.isOwner && <span className="badge me">Your Listing</span>}
          </div>

          <h1 className="detail-title">{item.name}</h1>
          <div className="detail-owner-card">
            <UserAvatar name={item.owner} photoUrl={item.ownerPhotoUrl} className="detail-owner-avatar" />
            <div className="detail-owner-info">
              <h6>Authenticated Owner</h6>
              <p>{item.owner}</p>
            </div>
          </div>

          <p className="detail-desc">{item.description}</p>

          {detailRows.length > 0 && (
            <div className="detail-specs">
              <div className="detail-specs-header">
                <ClipboardList size={20} color="#4f46e5" />
                <span>Category-Specific Details</span>
              </div>
              <div>
                {detailRows.map(([key, value]) => {
                  const label = categorySchema.find((field) => field.key === key)?.label || key;
                  return (
                    <div key={key} className="detail-spec-row">
                      <span className="detail-spec-key">{label}</span>
                      <span className="detail-spec-val">{formatFieldValue(value)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {item.status === 'available' && !item.isOwner && (
            <div className="detail-action-card">
              <div className="borrow-owner-card">
                <UserAvatar name={item.owner} photoUrl={item.ownerPhotoUrl} className="borrow-owner-avatar" />
                <div className="borrow-owner-copy">
                  <span className="borrow-owner-label">Requesting from</span>
                  <strong>{item.owner}</strong>
                </div>
              </div>
              <div className="form-grp">
                <label htmlFor={returnDateId}>Expected Return Date</label>
                <div className="input-wrap">
                  <Calendar className="input-icon" size={20} />
                  <input id={returnDateId} type="date" value={returnDate} onChange={(event) => setReturnDate(event.target.value)} className="form-input" />
                </div>
              </div>
              <div className="form-grp">
                <label htmlFor={purposeId}>Borrow Purpose</label>
                <div className="input-wrap">
                  <MessageSquare className="input-icon" size={20} style={{ top: '1.5rem', transform: 'none' }} />
                  <textarea id={purposeId} value={purpose} onChange={(event) => setPurpose(event.target.value)} className="form-textarea form-input" placeholder="Describe intended use..."></textarea>
                </div>
              </div>
              <button onClick={handleSubmit} className="btn-large">Initiate Borrow Protocol</button>
            </div>
          )}

          {item.isOwner && (
            <div className="detail-action-card">
              <p className="detail-desc compact">This item is listed under your Vault Ledger. Manage it from My Items.</p>
            </div>
          )}

          {item.status === 'borrowed' && !item.isOwner && (
            <div className="detail-action-card">
              <p className="detail-desc compact">This item is currently reserved and unavailable for new borrow requests.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ItemFormView({ item, categories, onBack, onSubmit }) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    category: item?.category || '',
    quantity: item?.quantity || 1,
    phoneNumber: item?.phoneNumber === 'Not provided' ? '' : item?.phoneNumber || '',
    imageUrl: item?.image?.startsWith('data:') || item?.image?.startsWith('/api/') ? '' : item?.image || '',
    imageFile: null,
    isAvailable: item ? item.status === 'available' : true,
  });
  const [details, setDetails] = useState(item?.details || {});
  const [formError, setFormError] = useState('');

  const [imagePreview, setImagePreview] = useState(
    item?.image && !item.image.startsWith('data:') && !item.image.startsWith('/api/') ? item.image : null
  );

  const selectedCategory = formData.category;
  const selectedFields = getCategorySchema(selectedCategory);
  const categorySuggestion = selectedCategory === 'Miscellaneous / Others'
    ? suggestBestFitCategory(formData.name, formData.description, details)
    : '';

  const handleChange = (event) => {
    const { name, value, files, type, checked } = event.target;

    if (type === 'file') {
      const file = files?.[0] || null;
      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }));

      // Show preview of selected file
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleDetailChange = (event) => {
    const { name, value } = event.target;
    setDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError('');
    if (!formData.name.trim()) {
      setFormError('Item name is required.');
      return;
    }

    if (!formData.category) {
      setFormError('Category is required.');
      return;
    }

    const missingFields = selectedFields
      .filter((field) => !String(details[field.key] || '').trim())
      .map((field) => field.label);

    if (missingFields.length > 0) {
      setFormError(`Please fill in: ${missingFields.join(', ')}.`);
      return;
    }

    onSubmit({
      ...formData,
      detailsJson: JSON.stringify(details),
    });
  };

  const displayImage = imagePreview || (item?.image && !item.image.startsWith('data:') ? item.image : null);

  return (
    <div className="detail-container compact-page">
      <button onClick={onBack} className="detail-back">
        <ChevronLeft size={20} strokeWidth={3} /> Back to Vault Ledger
      </button>
      <div className="form-shell">
        <div>
          <p className="dash-title-sub">Vault Ledger</p>
          <h2 className="dash-title-main">{item ? 'Edit Item' : 'Add Item'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="vault-form">
          {formError && <div className="form-error-banner">{formError}</div>}
          <div className="form-grp">
            <label>Item Name</label>
            <input name="name" value={formData.name} onChange={handleChange} className="form-input plain" placeholder="e.g., Graphing Calculator" />
          </div>
          <div className="form-grp">
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleChange} className="form-select plain">
              <option value="">Select category</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </div>

          {selectedCategory && (
            <div className="category-guidance">
              <div className="category-guidance-header">
                <ClipboardList size={18} />
                <strong>Category: {selectedCategory}</strong>
              </div>
              <p>Required Fields to Fill:</p>
              <ul>
                {selectedFields.map((field) => (
                  <li key={field.key}>{field.label}</li>
                ))}
              </ul>
              {selectedCategory === 'Miscellaneous / Others' && (
                <div className="category-warning">
                  {CATEGORY_SUPPORT_NOTE}
                  {categorySuggestion && categorySuggestion !== selectedCategory && (
                    <div className="category-suggestion">
                      Suggested best-fit category: <strong>{categorySuggestion}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {selectedFields.length > 0 && (
            <div className="category-fields-grid">
              {selectedFields.map((field) => (
                <div className="form-grp" key={field.key}>
                  <label>{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      name={field.key}
                      value={details[field.key] || ''}
                      onChange={handleDetailChange}
                      className="form-textarea plain"
                      placeholder={field.placeholder || ''}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      name={field.key}
                      value={details[field.key] || ''}
                      onChange={handleDetailChange}
                      className="form-select plain"
                    >
                      <option value="">Select an option</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      name={field.key}
                      value={details[field.key] || ''}
                      onChange={handleDetailChange}
                      className="form-input plain"
                      placeholder={field.placeholder || ''}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="form-grid-two">
            <div className="form-grp">
              <label>Quantity</label>
              <input name="quantity" type="number" min="1" value={formData.quantity} onChange={handleChange} className="form-input plain" />
            </div>
            <div className="form-grp">
              <label>Contact Number</label>
              <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="form-input plain" placeholder="Optional" />
            </div>
          </div>
          <div className="form-grp">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="form-textarea form-input plain" placeholder="Condition, inclusions, and borrowing reminders."></textarea>
          </div>
          <div className="form-grp">
            <label>Image URL</label>
            <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="form-input plain" placeholder="Optional external image URL" />
          </div>
          <div className="form-grp">
            <label>Upload Image (JPG/PNG)</label>
            <input name="imageFile" type="file" accept="image/png,image/jpeg" onChange={handleChange} className="form-input plain" />
            {displayImage && (
              <div style={{ marginTop: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>Preview:</p>
                <img src={displayImage} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '0.375rem', objectFit: 'cover' }} />
              </div>
            )}
          </div>
          <label className="check-row">
            <input name="isAvailable" type="checkbox" checked={formData.isAvailable} onChange={handleChange} />
            Mark item as available for lending
          </label>
          <button className="btn-large" type="submit"><Save size={20} /> Save Item</button>
        </form>
      </div>
    </div>
  );
}

function MyItemsView({ items, onAddItem, onSelectItem, onEditItem, onDeleteItem }) {
  return (
    <div className="dash-view-container">
      <div className="dash-view-header">
        <div>
          <p className="dash-title-sub">Vault Ledger</p>
          <h2 className="dash-title-main">My Items</h2>
        </div>
        <button className="btn primary" onClick={onAddItem}><Plus size={16} /> Add Item</button>
      </div>

      {items.length === 0 && <EmptyState title="No Listed Items" description="Add your first resource to make it available for borrowing." />}

      <div className="management-list">
        {items.map((item) => (
          <div className="management-card" key={item.id}>
            <ImageWithFallback src={item.image} alt={item.name} className="management-img" />
            <div className="management-main">
              <span className="item-cat">{item.category}</span>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <span className={`badge ${item.status}`}>{item.status}</span>
            </div>
            <div className="management-actions">
              <button className="btn primary" onClick={() => onSelectItem(item)}>View</button>
              <button className="btn" onClick={() => onEditItem(item)}><Pencil size={14} /> Edit</button>
              <button className="btn danger" onClick={() => onDeleteItem(item.rawId || item.id)}><Trash2 size={14} /> Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RequestsView({ incoming, mine, records, pendingPreview, onAction }) {
  const incomingList = incoming.length ? incoming : pendingPreview;

  return (
    <div className="dash-view-container">
      <div className="dash-view-header">
        <div>
          <p className="dash-title-sub">Borrow Flow</p>
          <h2 className="dash-title-main">Requests</h2>
        </div>
      </div>

      <div className="request-columns">
        <RequestPanel title="Incoming Requests" requests={incomingList} mode="incoming" onAction={onAction} />
        <RequestPanel title="My Requests" requests={mine} mode="mine" onAction={onAction} />
      </div>

      <section className="record-panel">
        <h3>Recent Activity</h3>
        {records.length === 0 && <p className="muted">No request activity yet.</p>}
        {records.map((record) => (
          <div className="record-row" key={record.id}>
            <Clock size={16} />
            <span>{record.action}</span>
            <strong>{record.item}</strong>
            <small>{record.performed_at?.slice(0, 16).replace('T', ' ')}</small>
          </div>
        ))}
      </section>
    </div>
  );
}

function RequestPanel({ title, requests, mode, onAction }) {
  const [extensionDates, setExtensionDates] = useState({});

  return (
    <section className="request-panel">
      <h3>{title}</h3>
      {requests.length === 0 && <p className="muted">No requests found.</p>}
      {requests.map((request) => (
        <div className="request-card" key={request.id}>
          <div>
            <span className={`badge ${requestStatusClass(request.status)}`}>{request.status}</span>
            <h4>{request.item?.name || 'Borrowed Item'}</h4>
            <p>{mode === 'incoming' ? `Borrower: ${request.borrower?.fullName || request.borrower?.username}` : `Owner: ${request.item?.owner_name || 'Item owner'}`}</p>
            {request.purpose && <p className="muted">Purpose: {request.purpose}</p>}
            <p className="muted">Due Date: {request.due_date || 'Not set'}</p>
          </div>
          {mode === 'incoming' && request.can_manage && (
            <div className="request-actions">
              <button className="btn success" onClick={() => onAction(request.id, 'approve')}><CheckCircle2 size={14} /> Approve</button>
              <button className="btn danger" onClick={() => onAction(request.id, 'reject')}><XCircle size={14} /> Reject</button>
            </div>
          )}
          {mode === 'mine' && request.status === 'Approved' && (
            <div className="request-actions stacked">
              <button className="btn success" onClick={() => onAction(request.id, 'return')}><RotateCcw size={14} /> Return</button>
              <input
                type="date"
                className="mini-date"
                value={extensionDates[request.id] || ''}
                onChange={(event) => setExtensionDates((prev) => ({ ...prev, [request.id]: event.target.value }))}
              />
              <button
                className="btn"
                onClick={() => onAction(request.id, 'extend', { due_date: extensionDates[request.id], note: 'Borrower requested an extension.' })}
              >
                Extend
              </button>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}

function CalendarView({ events }) {
  return (
    <div className="dash-view-container">
      <div className="dash-view-header">
        <div>
          <p className="dash-title-sub">Due Dates</p>
          <h2 className="dash-title-main">Calendar</h2>
        </div>
      </div>

      <div className="calendar-list">
        {events.length === 0 && <EmptyState title="No Upcoming Due Dates" description="Approved borrow requests with due dates will appear here." />}
        {events.map((event) => (
          <div className="calendar-card" key={event.id}>
            <div className="calendar-date"><Calendar size={20} /> {event.date}</div>
            <h3>{event.title}</h3>
            <span className="badge cat">{event.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <Package size={32} />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
