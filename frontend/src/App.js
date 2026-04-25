import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './hooks/useAuth';
import AdminPage from './pages/AdminPage';
import ListingsPage from './pages/ListingsPage';
import PropertyPage from './pages/PropertyPage';
import ApplicationPage from './pages/ApplicationPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import AIMatchPage from './pages/AIMatchPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

// ─── Navbar ───────────────────────────────────────────────────────────────
function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <nav style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 24px', height:64, background:'#fff',
      borderBottom:'1px solid #e5e7eb', position:'sticky', top:0, zIndex:100,
      flexWrap:'wrap', gap:8
    }}>
      <span onClick={() => navigate('/')}
        style={{ fontSize:22, fontWeight:700, color:'#1a6b4a',
          fontFamily:'Georgia,serif', cursor:'pointer', textDecoration:'none' }}>
        Home<span style={{ color:'#e07b39' }}>Nest</span>
      </span>

      <div style={{ display:'flex', gap:16, alignItems:'center', flexWrap:'wrap' }}>
        <Link to="/listings"
          style={{ fontSize:14, color:'#4b5563', textDecoration:'none' }}>
          Browse
        </Link>
        <Link to="/ai"
          style={{ fontSize:14, color:'#4b5563', textDecoration:'none' }}>
          AI Match
        </Link>
        {user?.role === 'admin' && (
          <Link to="/admin"
            style={{ fontSize:14, color:'#4b5563', textDecoration:'none' }}>
            Admin
          </Link>
        )}
        {user ? (
          <>
            <Link to="/dashboard"
              style={{ fontSize:14, color:'#4b5563', textDecoration:'none' }}>
              My Applications
            </Link>
            <button
              onClick={() => { localStorage.clear(); window.location.reload(); }}
              style={{ padding:'8px 18px', background:'transparent', color:'#4b5563',
                border:'1px solid #d1d5db', borderRadius:8, fontSize:14,
                cursor:'pointer', fontFamily:'inherit' }}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">
              <button style={{ padding:'8px 18px', background:'transparent',
                color:'#4b5563', border:'1px solid #d1d5db', borderRadius:8,
                fontSize:14, cursor:'pointer', fontFamily:'inherit' }}>
                Sign in
              </button>
            </Link>
            <Link to="/login">
              <button style={{ padding:'8px 18px', background:'#1a6b4a',
                color:'#fff', border:'none', borderRadius:8, fontSize:14,
                cursor:'pointer', fontFamily:'inherit' }}>
                Get started
              </button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div style={{ minHeight:'100vh', background:'#f9fafb' }}>
          <Navbar />
          <Routes>
            <Route path="/"                  element={<HomePage />} />
            <Route path="/listings"          element={<ListingsPage />} />
            <Route path="/properties/:id"    element={<PropertyPage />} />
            <Route path="/apply/:propertyId" element={<ApplicationPage />} />
            <Route path="/login"             element={<LoginPage />} />
            <Route path="/ai"                element={<AIMatchPage />} />
            <Route path="/dashboard"         element={<DashboardPage />} />
            <Route path="/admin"             element={<AdminPage />} />
            <Route path="*"                  element={<NotFoundPage />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}