import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../components/common/Logo';

const LEGAL_CONTENT = {
    '/privacy-policy': {
        title: 'Privacy Policy',
        updated: 'July 22, 2026',
        sections: [
            {
                heading: 'Information We Collect',
                body: 'We collect account details, profile information, and usage data needed to provide portfolio analytics, market intelligence, and personalized recommendations.',
            },
            {
                heading: 'How We Use Information',
                body: 'Your data is used to authenticate access, improve product experience, generate insights, and maintain service reliability and security.',
            },
            {
                heading: 'Data Sharing',
                body: 'We do not sell personal data. We may share limited information with trusted service providers that help operate the platform under strict confidentiality obligations.',
            },
            {
                heading: 'Your Choices',
                body: 'You can review and update profile details from your account settings. You may request account deletion by contacting support.',
            },
        ],
    },
    '/terms-of-service': {
        title: 'Terms of Service',
        updated: 'July 22, 2026',
        sections: [
            {
                heading: 'Use of Service',
                body: 'By using Cresta, you agree to use the platform lawfully and not attempt to disrupt, reverse engineer, or misuse features and data.',
            },
            {
                heading: 'Investment Disclaimer',
                body: 'Cresta provides analytical tools and informational content only. Nothing on this platform constitutes financial, legal, or tax advice.',
            },
            {
                heading: 'Account Responsibility',
                body: 'You are responsible for maintaining the confidentiality of your account credentials and for activity performed under your account.',
            },
            {
                heading: 'Service Availability',
                body: 'We may update, suspend, or discontinue parts of the service for maintenance, security, or feature improvements.',
            },
        ],
    },
    '/cookie-policy': {
        title: 'Cookie Policy',
        updated: 'July 22, 2026',
        sections: [
            {
                heading: 'What Are Cookies',
                body: 'Cookies are small text files stored on your device that help us remember preferences, maintain sessions, and improve website performance.',
            },
            {
                heading: 'How We Use Cookies',
                body: 'We use essential cookies for login and security, plus analytics cookies to understand product usage patterns and improve the experience.',
            },
            {
                heading: 'Managing Cookies',
                body: 'You can control or disable cookies from your browser settings. Disabling essential cookies may affect sign-in and core application functionality.',
            },
        ],
    },
};

const LegalPage = () => {
    const { pathname } = useLocation();
    const page = LEGAL_CONTENT[pathname] || LEGAL_CONTENT['/privacy-policy'];

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            <header className="border-b border-[#222222]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <Logo className="w-5 h-5" />
                        <span className="font-semibold">Cresta</span>
                    </Link>
                    <Link to="/markets" className="text-sm text-gray-400 hover:text-white transition-colors">
                        Back to Markets
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold tracking-tight">{page.title}</h1>
                <p className="text-sm text-gray-400 mt-2">Last updated: {page.updated}</p>

                <div className="mt-10 space-y-8">
                    {page.sections.map((section) => (
                        <section key={section.heading}>
                            <h2 className="text-xl font-semibold mb-3">{section.heading}</h2>
                            <p className="text-gray-300 leading-relaxed">{section.body}</p>
                        </section>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default LegalPage;
