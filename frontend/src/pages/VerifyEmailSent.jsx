import React from 'react';
import { Mail } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

const VerifyEmailSent = () => {
  const { state } = useLocation();
  const email = state?.email || "your email";

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6">
      <div className="max-w-md w-full bento-panel p-10 rounded border border-[#222222] shadow-sm bg-[#0A0A0A] text-center">
        
        <div className="flex justify-center mb-6">
          <Mail className="w-10 h-10 text-white" />
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4">Check your inbox</h2>
        
        <p className="text-gray-400 mb-6 leading-relaxed">
          We've sent a verification link to <br/>
          <span className="text-white font-semibold">{email}</span>
        </p>
        
        <div className="space-y-4">
          <p className="text-gray-500 text-sm">
            The link will expire in 24 hours. If you don't see it, check your spam folder.
          </p>
          
          <div className="pt-6 border-t border-[#222222]">
            <Link 
              to="/auth" 
              className="text-white hover:text-gray-300 font-medium transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailSent;
