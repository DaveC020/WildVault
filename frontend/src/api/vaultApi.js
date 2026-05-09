const API_BASE_URL = 'http://localhost:8080';

function getToken() {
  return localStorage.getItem('token');
}

function authHeaders(extra = {}) {
  const token = getToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

async function parseResponse(response, fallbackMessage) {
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message = data?.error || data?.message || (Array.isArray(data?.errors) ? data.errors.join('\n') : null) || fallbackMessage;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      query.set(key, value);
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

function buildItemFormData(item = {}) {
  const formData = new FormData();
  formData.append('name', item.name || '');
  formData.append('description', item.description || '');
  formData.append('category', item.category || '');
  formData.append('quantity', String(item.quantity || 1));
  formData.append('is_available', String(item.isAvailable ?? true));
  formData.append('phone_number', item.phoneNumber || '');
  formData.append('image_url', item.imageUrl || '');
  if (item.imageFile) {
    formData.append('image_file', item.imageFile);
  }
  return formData;
}

export async function fetchDashboardData(filters = {}) {
  const response = await fetch(`${API_BASE_URL}/api/items/dashboard${buildQuery(filters)}`, {
    headers: authHeaders(),
  });
  return parseResponse(response, 'Failed to load dashboard data');
}

export async function fetchVaultItems(filters = {}) {
  const response = await fetch(`${API_BASE_URL}/api/items${buildQuery(filters)}`, {
    headers: authHeaders(),
  });
  return parseResponse(response, 'Failed to load items');
}

export async function fetchMyItems() {
  const response = await fetch(`${API_BASE_URL}/api/items/mine`, {
    headers: authHeaders(),
  });
  return parseResponse(response, 'Failed to load your items');
}

export async function fetchItemDetail(id) {
  const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
    headers: authHeaders(),
  });
  return parseResponse(response, 'Failed to load item');
}

export async function createVaultItem(item) {
  const response = await fetch(`${API_BASE_URL}/api/items`, {
    method: 'POST',
    headers: authHeaders(),
    body: buildItemFormData(item),
  });
  return parseResponse(response, 'Failed to create item');
}

export async function updateVaultItem(id, item) {
  const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: buildItemFormData(item),
  });
  return parseResponse(response, 'Failed to update item');
}

export async function deleteVaultItem(id) {
  const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return parseResponse(response, 'Failed to delete item');
}

export async function submitBorrowRequest(itemId, { dueDate, purpose }) {
  const response = await fetch(`${API_BASE_URL}/api/requests/create/${itemId}`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ due_date: dueDate, purpose }),
  });
  return parseResponse(response, 'Failed to submit borrow request');
}

export async function manageBorrowRequest(requestId, action, payload = {}) {
  const response = await fetch(`${API_BASE_URL}/api/requests/manage/${requestId}/${action}`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  return parseResponse(response, 'Failed to update request');
}

export async function fetchRequestHistory() {
  const response = await fetch(`${API_BASE_URL}/api/requests/history`, {
    headers: authHeaders(),
  });
  return parseResponse(response, 'Failed to load request history');
}

export async function fetchCalendarEvents() {
  const response = await fetch(`${API_BASE_URL}/api/requests/calendar`, {
    headers: authHeaders(),
  });
  return parseResponse(response, 'Failed to load calendar events');
}
