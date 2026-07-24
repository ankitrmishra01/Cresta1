import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { API_BASE } from '../api';

const VerifyEmail = () => {
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link.');
            return;
        }

        const verify = async () => {
            try {
                const res = await fetch(`${API_BASE}/auth/verify-email/?token=${token}`);
                const data = await res.json();
                
                if (res.ok) {
                    setStatus('success');
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Verification failed.');
                }
            } catch (err) {
                setStatus('error');
                setMessage('Connection error. Please try again later.');
            }
        };

        verify();
    }, [token]);

    const containerClasses = "min-h-screen flex items-center justify-center bg-black p-6";
    const cardClasses = "max-w-md w-full bento-panel p-10 rounded border border-[#222222] shadow-sm bg-[#0A0A0A] text-center";

    if (status === 'loading') {
        return (
            <div className={containerClasses}>
                <div className={cardClasses}>
                    <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-white">Verifying your email...</h2>
                    <p className="text-gray-500 mt-2">Please wait a moment.</p>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className={containerClasses}>
                <div className={cardClasses}>
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Email Verified!</h2>
                    <p className="text-gray-400 mb-8">
                        Your account has been successfully verified. You can now access all features.
                    </p>
                    <button 
                        onClick={() => navigate('/auth')}
                        className="premium-button w-full py-4 bg-white hover:bg-gray-200 text-black font-bold rounded-2xl transition-all shadow-lg"
                    >
                        Go to Sign In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={containerClasses}>
            <div className={cardClasses}>
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                    <XCircle className="w-12 h-12 text-red-500" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Verification Failed</h2>
                <p className="text-gray-400 mb-8">
                    {message || "This verification link is invalid or has expired."}
                </p>
                <button 
                    onClick={() => navigate('/auth', { state: { isSignUp: true } })}
                    className="premium-button w-full py-4 bg-[#111111] text-white font-bold rounded-2xl transition-all hover:bg-[#222222]"
                >
                    Back to Sign Up
                </button>
            </div>
        </div>
    );
};

export default VerifyEmail;
