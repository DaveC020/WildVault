const API_BASE_URL = 'http://localhost:8080';
const TOKEN_STORAGE_KEY = 'token';
const ALLOWED_PROFILE_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png']);
const ALLOWED_PROFILE_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

function buildApiError(defaultMessage, response, data) {
	const error = new Error(data?.message || defaultMessage);
	error.status = response?.status;
	return error;
}

function hasAllowedProfileImageExtension(filename) {
	if (!filename || typeof filename !== 'string') {
		return false;
	}

	const lower = filename.toLowerCase();
	return ALLOWED_PROFILE_IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function validateProfileImageFile(file) {
	if (!file) {
		return { valid: false, message: 'No file selected.' };
	}

	const hasValidExtension = hasAllowedProfileImageExtension(file.name || '');
	const mimeType = (file.type || '').toLowerCase();
	const hasValidMimeType = mimeType ? ALLOWED_PROFILE_IMAGE_MIME_TYPES.has(mimeType) : false;

	if (!hasValidExtension || !hasValidMimeType) {
		return {
			valid: false,
			message: 'Invalid file type. Only PNG and JPG/JPEG files are allowed.',
		};
	}

	return { valid: true, message: '' };
}

export function decodeJwtSubject(token) {
	if (!token || typeof token !== 'string') {
		return null;
	}

	const parts = token.split('.');
	if (parts.length !== 3) {
		return null;
	}

	try {
		const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
		const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
		const payload = JSON.parse(atob(padded));
		return typeof payload?.sub === 'string' ? payload.sub : null;
	} catch {
		return null;
	}
}

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
		throw buildApiError('Invalid credentials', response, data);
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
		throw buildApiError('Failed to load user profile', response, data);
	}

	return data;
}

export async function updateUserProfile(token, { firstName, lastName, email, studentId } = {}) {
	const response = await fetch(`${API_BASE_URL}/users/profile`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ firstName, lastName, email, studentId }),
	});

	const data = await response.json().catch(() => null);

	if (!response.ok) {
		throw buildApiError('Failed to update profile', response, data);
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
		throw buildApiError('Failed to update password', response, data);
	}

	return data;
}

export async function uploadUserProfilePhoto(token, file) {
	if (!file) {
		throw new Error('No file selected');
	}

	const validation = validateProfileImageFile(file);
	if (!validation.valid) {
		throw new Error(validation.message);
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
		throw buildApiError('Failed to upload profile photo', response, data);
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

export async function fetchUserProfilePhoto(token, options = {}) {
	const { forceRefresh = false } = options;
	const query = forceRefresh ? `?t=${Date.now()}` : '';
	const response = await fetch(`${API_BASE_URL}/users/profile/photo${query}`, {
		method: 'GET',
		cache: 'no-store',
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (response.status === 404) {
		return null;
	}

	if (!response.ok) {
		throw buildApiError('Failed to load profile photo', response, null);
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

export function buildFullName(profile, fallbackIdentifier = '') {
	const firstName = profile?.firstName;
	const lastName = profile?.lastName;
	const composed = [firstName, lastName].filter((part) => typeof part === 'string' && part.trim()).join(' ').trim();
	if (composed) {
		return composed;
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
