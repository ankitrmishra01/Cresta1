import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_BASE, refreshToken } from '../api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // isValidating: true while we check the token with the backend
    const [isValidating, setIsValidating] = useState(true);

    const [hasCompletedRiskAssessment, setHasCompletedRiskAssessment] = useState(() => {
        return localStorage.getItem('risk_assessment_completed') === 'true';
    });

    // On mount, validate the token by calling /auth/me/
    useEffect(() => {
        const validateSession = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                // No token at all — clear any stale user in storage
                setUser(null);
                setIsValidating(false);
                return;
            }

            try {
                let res = await fetch(`${API_BASE}/auth/me/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // Try refresh if expired
                if (res.status === 401) {
                    const refreshed = await refreshToken();
                    if (refreshed) {
                        const newToken = localStorage.getItem('access_token');
                        res = await fetch(`${API_BASE}/auth/me/`, {
                            headers: { 'Authorization': `Bearer ${newToken}` }
                        });
                    }
                }

                if (res.ok) {
                    const data = await res.json();
                    setUser(prev => ({ ...prev, ...data }));
                    if (data.risk_profile) {
                        setHasCompletedRiskAssessment(true);
                        localStorage.setItem('risk_assessment_completed', 'true');
                    }
                } else {
                    logout();
                }
            } catch {
                // Network error — keep user logged in (offline mode)
            } finally {
                setIsValidating(false);
            }
        };

        validateSession();
    }, []);


    const login = (userData, tokens) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        if (userData?.risk_profile) {
            setHasCompletedRiskAssessment(true);
            localStorage.setItem('risk_assessment_completed', 'true');
        } else {
            setHasCompletedRiskAssessment(false);
            localStorage.removeItem('risk_assessment_completed');
        }

        if (tokens) {
            localStorage.setItem('access_token', tokens.access);
            localStorage.setItem('refresh_token', tokens.refresh);
        }
    };

    const logout = () => {
        setUser(null);
        setHasCompletedRiskAssessment(false);
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('risk_assessment_completed');
        localStorage.removeItem('ai_insights_data');
    };

    const completeRiskAssessment = () => {
        setHasCompletedRiskAssessment(true);
        localStorage.setItem('risk_assessment_completed', 'true');
    };

    return (
        <UserContext.Provider value={{ user, login, logout, hasCompletedRiskAssessment, completeRiskAssessment, isValidating }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
