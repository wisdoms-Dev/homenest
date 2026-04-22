import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 80, color: '#e5e7eb', lineHeight: 1 }}>404</div>
      <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, margin: '16px 0 8px' }}>Page not found</h1>
      <p style={{ color: '#9ca3af', marginBottom: 28 }}>This page doesn't exist or has been moved.</p>
      <Link to="/" className="btn btn-primary">Go home</Link>
    </div>
  );
}