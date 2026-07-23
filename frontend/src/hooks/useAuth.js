import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { API_BASE } from '../api';

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { login: setUserContext } = useUser();
    const navigate = useNavigate();

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/auth/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: email, password })
            });

            let data = {};
            try { data = await res.json(); } catch { /* non-JSON body */ }

            if (res.ok) {
                const userRes = await fetch(`${API_BASE}/auth/me/`, {
                    headers: { 'Authorization': `Bearer ${data.access}` }
                });
                let userData = { email };
                if (userRes.ok) { userData = await userRes.json(); }
                setUserContext(userData, { access: data.access, refresh: data.refresh });
                navigate('/dashboard');
            } else if (res.status === 401 || res.status === 400) {
                setError(data.detail || data.non_field_errors?.[0] || data.error || 'Invalid email or password.');
            } else {
                setError(`Server error (${res.status}). Please try again.`);
            }
        } catch (err) {
            setError('Cannot reach server. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/auth/signup/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            let data = {};
            try { data = await res.json(); } catch { /* non-JSON body */ }

            if (res.ok) {
                setUserContext(data.user, { access: data.access, refresh: data.refresh });
                navigate('/dashboard');
            } else {
                let errMsg = data.detail || data.error || 'Registration failed.';
                if (typeof data === 'object' && !data.detail && !data.error) {
                    const firstKey = Object.keys(data)[0];
                    if (firstKey && Array.isArray(data[firstKey])) {
                        errMsg = `${firstKey}: ${data[firstKey][0]}`;
                    }
                }
                setError(errMsg);
            }
        } catch (err) {
            setError('Cannot reach server. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const googleLogin = async (accessToken) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/auth/google/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ access_token: accessToken })
            });
            const data = await res.json();
            
            if (res.ok && data.success) {
                const userRes = await fetch(`${API_BASE}/auth/me/`, {
                    headers: { 'Authorization': `Bearer ${data.tokens.access}` }
                });
                let userData = data.user;
                if (userRes.ok) {
                    userData = await userRes.json();
                }
                
                setUserContext(userData, data.tokens);
                navigate('/dashboard');
            } else {
                setError(data.error || data.detail || 'Google Login failed.');
            }
        } catch (err) {
            setError('Network error. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return { login, register, googleLogin, loading, error };
};
