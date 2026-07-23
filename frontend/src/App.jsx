import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Logo from './components/common/Logo';

import { UserProvider } from './context/UserContext';
import { SearchProvider } from './context/SearchContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/common/ErrorBoundary';

import ChatWidget from './components/ChatWidget';

// Helper to add a minimum delay to lazy loading so the loader is visible
const lazyWithDelay = (importFunc, delay = 1500) => {
  return lazy(() =>
    Promise.all([
      importFunc(),
      new Promise(resolve => setTimeout(resolve, delay))
    ]).then(([moduleExports]) => moduleExports)
  );
};

// Route-level code splitting
const LandingPage = lazyWithDelay(() => import('./pages/LandingPage'));
const AuthPage = lazyWithDelay(() => import('./pages/AuthPage'));
const Dashboard = lazyWithDelay(() => import('./pages/Dashboard'));
const RiskAssessment = lazyWithDelay(() => import('./pages/RiskAssessment'));
const MarketsPage = lazyWithDelay(() => import('./pages/MarketsPage'));
const SettingsPage = lazyWithDelay(() => import('./pages/SettingsPage'));
const VerifyEmailSent = lazyWithDelay(() => import('./pages/VerifyEmailSent'));
const VerifyEmail = lazyWithDelay(() => import('./pages/VerifyEmail'));
const LegalPage = lazyWithDelay(() => import('./pages/LegalPage'));

// Premium loading screen
const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
    <div className="flex flex-col items-center gap-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-3"
      >
        <Logo className="w-10 h-10" />
        <span className="text-2xl font-bold tracking-tight text-white">
          Cresta
        </span>
      </motion.div>

      <div className="w-48 h-[2px] bg-[#111111] rounded-full overflow-hidden relative">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-[#4ade80] to-transparent w-full"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: 'easeInOut',
          }}
        />
      </div>
    </div>
  </div>
);

function App() {
  return (
    <div className="min-h-screen">
      <ErrorBoundary>
        <ThemeProvider>
          <UserProvider>
            <ToastProvider>
              <Router>
                <SearchProvider>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<LandingPage />} />

                      <Route path="/auth" element={<AuthPage />} />

                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/risk-assessment"
                        element={
                          <ProtectedRoute>
                            <RiskAssessment />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/markets"
                        element={<MarketsPage />}
                      />

                      <Route
                        path="/settings"
                        element={
                          <ProtectedRoute>
                            <SettingsPage />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/verify-email-sent"
                        element={<VerifyEmailSent />}
                      />

                      <Route
                        path="/verify-email"
                        element={<VerifyEmail />}
                      />

                      <Route
                        path="/privacy-policy"
                        element={<LegalPage />}
                      />

                      <Route
                        path="/terms-of-service"
                        element={<LegalPage />}
                      />

                      <Route
                        path="/cookie-policy"
                        element={<LegalPage />}
                      />

                      <Route
                        path="*"
                        element={<LandingPage />}
                      />
                    </Routes>

                    {/* Floating AI Chat Widget */}
                    <ChatWidget />
                  </Suspense>
                </SearchProvider>
              </Router>
            </ToastProvider>
          </UserProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </div>
  );
}

export default App;