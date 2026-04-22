import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">Home<span>Nest</span></Link>

      <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        <Link to="/listings" onClick={() => setMenuOpen(false)}>Browse</Link>
        <Link to="/ai-match" onClick={() => setMenuOpen(false)}>AI Match</Link>
        {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link>}
        {user
          ? <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}>My Applications</Link>
              <button className="btn btn-outline" onClick={handleLogout}>Sign out</button>
            </>
          : <>
              <Link to="/login" className="btn btn-outline" onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link to="/login?tab=register" className="btn btn-primary" onClick={() => setMenuOpen(false)}>Get started</Link>
            </>
        }
      </div>

      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
        <span/><span/><span/>
      </button>
    </nav>
  );
}