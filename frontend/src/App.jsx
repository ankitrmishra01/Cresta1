import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RiskAssessment from './pages/RiskAssessment';
import MarketsPage from './pages/MarketsPage';
import SettingsPage from './pages/SettingsPage';

import { UserProvider } from './context/UserContext';
import { SearchProvider } from './context/SearchContext'; // Added import

import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UserProvider>
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <SearchProvider>
                    <Dashboard />
                  </SearchProvider>
                </ProtectedRoute>
              } />
              <Route path="/risk" element={
                <ProtectedRoute>
                  <SearchProvider>
                    <RiskAssessment />
                  </SearchProvider>
                </ProtectedRoute>
              } />
              <Route path="/markets" element={
                <ProtectedRoute>
                  <SearchProvider>
                    <MarketsPage />
                  </SearchProvider>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <SearchProvider>
                    <SettingsPage />
                  </SearchProvider>
                </ProtectedRoute>
              } />
              <Route path="*" element={<LandingPage />} />
            </Routes>
          </Router>
        </UserProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
