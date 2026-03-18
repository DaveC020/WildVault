const API_BASE_URL = 'http://localhost:8080';
const TOKEN_STORAGE_KEY = 'token';

export function setAuthToken(token) {
	localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function getAuthToken() {
	return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function clearAuthToken() {
	localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export async function loginUser({ username, password }) {
	const response = await fetch(`${API_BASE_URL}/api/login`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ username, password }),
	});

	const data = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(data?.message || 'Invalid credentials');
	}

	if (!data?.token) {
		throw new Error('Authentication token not received');
	}

	return data;
}

export async function fetchUserProfile(token) {
	const response = await fetch(`${API_BASE_URL}/users/profile`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	const data = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(data?.message || 'Failed to load user profile');
	}

	return data;
}

export async function updateUserProfile(token, { displayName, fullName, email, studentId } = {}) {
	const response = await fetch(`${API_BASE_URL}/users/profile`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ displayName, fullName, email, studentId }),
	});

	const data = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(data?.message || 'Failed to update profile');
	}

	return data;
}

export async function updateUserPassword(token, { currentPassword, newPassword, confirmPassword } = {}) {
	const response = await fetch(`${API_BASE_URL}/users/profile/password`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
	});

	const data = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(data?.message || 'Failed to update password');
	}

	return data;
}

export async function uploadUserProfilePhoto(token, file) {
	if (!file) {
		throw new Error('No file selected');
	}

	const formData = new FormData();
	formData.append('file', file);

	const response = await fetch(`${API_BASE_URL}/users/profile/photo`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
		},
		body: formData,
	});

	const data = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(data?.message || 'Failed to upload profile photo');
	}

	return data;
}

function blobToDataUrl(blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result);
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
}

export async function fetchUserProfilePhoto(token) {
	const response = await fetch(`${API_BASE_URL}/users/profile/photo`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (response.status === 404) {
		return null;
	}

	if (!response.ok) {
		throw new Error('Failed to load profile photo');
	}

	const blob = await response.blob();
	if (!blob || blob.size === 0) {
		return null;
	}

	const dataUrl = await blobToDataUrl(blob);
	return typeof dataUrl === 'string' ? dataUrl : null;
}

export function getInitials(fullName) {
	if (!fullName || typeof fullName !== 'string') {
		return 'U';
	}

	const parts = fullName
		.trim()
		.split(/\s+/)
		.filter(Boolean);

	if (parts.length === 0) {
		return 'U';
	}

	if (parts.length === 1) {
		return parts[0].slice(0, 2).toUpperCase();
	}

	const first = parts[0][0] || '';
	const last = parts[parts.length - 1][0] || '';
	return `${first}${last}`.toUpperCase();
}

export function buildDisplayName(profile, fallbackIdentifier = '') {
	const displayName = profile?.displayName;
	if (displayName && displayName.trim()) {
		return displayName.trim();
	}

	const fullName = profile?.fullName || profile?.name;
	if (fullName && fullName.trim()) {
		return fullName.trim();
	}

	if (fallbackIdentifier && fallbackIdentifier.includes('@')) {
		return fallbackIdentifier.split('@')[0];
	}

	return fallbackIdentifier || 'User';
}
