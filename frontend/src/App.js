import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// ─── Auth (real provider from hooks/useAuth.js) ───────────────────────────
import { AuthProvider } from './hooks/useAuth';

// ─── Shared components ────────────────────────────────────────────────────
import Navbar from './components/Navbar';

// ─── Pages ────────────────────────────────────────────────────────────────
import HomePage        from './pages/HomePage';
import ListingsPage    from './pages/ListingsPage';
import PropertyPage    from './pages/PropertyPage';
import ApplicationPage from './pages/ApplicationPage';
import DashboardPage   from './pages/DashboardPage';
import LoginPage       from './pages/LoginPage';
import AIMatchPage     from './pages/AIMatchPage';
import AdminPage       from './pages/AdminPage';
import NotFoundPage    from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      {/*
        AuthProvider (hooks/useAuth.js) handles:
          - restoring user from localStorage on load
          - authAPI.me() refresh (silent, won't crash if backend offline)
          - login / register / logout helpers
          - isAdmin convenience flag
        Every page/component calls useAuth() to access these.
      */}
      <AuthProvider>
        <div style={{ minHeight: '100vh', background: '#f9fafb' }}>

          {/* Navbar lives in components/Navbar.js — has mobile hamburger menu */}
          <Navbar />

          <Routes>
            <Route path="/"                  element={<HomePage />} />
            <Route path="/listings"          element={<ListingsPage />} />
            <Route path="/properties/:id"    element={<PropertyPage />} />
            <Route path="/apply/:propertyId" element={<ApplicationPage />} />
            <Route path="/login"             element={<LoginPage />} />
            {/* /ai-match matches Navbar.js, HomePage.js and AIMatchPage links */}
            <Route path="/ai-match"          element={<AIMatchPage />} />
            <Route path="/dashboard"         element={<DashboardPage />} />
            <Route path="/admin"             element={<AdminPage />} />
            <Route path="*"                  element={<NotFoundPage />} />
          </Routes>

        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}