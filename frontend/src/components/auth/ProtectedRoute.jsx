import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const ProtectedRoute = ({ children }) => {
    const { user, isValidating } = useUser();

    // While we're checking the token with the backend, show nothing (or a loader)
    if (isValidating) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-[var(--app-bg)] z-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-[var(--app-muted)] font-medium">Verifying session...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    return children;
};

export default ProtectedRoute;
