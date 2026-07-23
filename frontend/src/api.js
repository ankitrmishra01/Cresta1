export const API_BASE = import.meta.env.VITE_API_BASE || '/api';

/**
 * Make an authenticated API call with automatic JWT token attachment.
 * On 401, attempts to refresh the token once and retry.
 *
 * @param {string} url - Full URL or path relative to API_BASE
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<Response>}
 */
export async function apiCall(url, options = {}) {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;

    // Attach JWT token
    const token = localStorage.getItem('access_token');
    const headers = {
        ...(options.headers || {}),
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    // Default to JSON content type for POST/PUT
    if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    let response = await fetch(fullUrl, { ...options, headers });

    // If 401, try to refresh token
    if (response.status === 401 && token) {
        const refreshed = await refreshToken();
        if (refreshed) {
            // Retry with new token
            const newToken = localStorage.getItem('access_token');
            headers['Authorization'] = `Bearer ${newToken}`;
            response = await fetch(fullUrl, { ...options, headers });
        }
    }

    return response;
}

/**
 * Refresh the access token using the stored refresh token.
 * @returns {Promise<boolean>} true if refresh succeeded
 */
export async function refreshToken() {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) return false;

    try {
        const response = await fetch(`${API_BASE}/auth/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('access_token', data.access);
            if (data.refresh) {
                localStorage.setItem('refresh_token', data.refresh);
            }
            return true;
        } else {
            // Refresh token expired — force logout
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            return false;
        }
    } catch {
        return false;
    }
}
