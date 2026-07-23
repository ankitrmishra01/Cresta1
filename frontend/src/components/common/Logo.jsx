import React from 'react';

const Logo = ({ className = "w-6 h-6", color = "#4ade80" }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3L3 19h18L12 3z" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 9.5l-5 8.5h10L12 9.5z" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export default Logo;
