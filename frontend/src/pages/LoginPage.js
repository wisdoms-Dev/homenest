import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') === 'register' ? 'register' : 'login');
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'login') {
        const user = await login(form.email, form.password);
        toast.success(`Welcome back, ${user.name}!`);
      } else {
        const user = await register(form.name, form.email, form.password, form.phone);
        toast.success(`Welcome to HomeNest, ${user.name}!`);
      }
      navigate('/listings');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', padding: 24 }}>
      <div className="card" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, textDecoration: 'none', color: '#1a6b4a' }}>
            Home<span style={{ color: '#e07b39' }}>Nest</span>
          </Link>
          <p style={{ color: '#9ca3af', fontSize: 14, marginTop: 4 }}>
            {tab === 'login' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: 24 }}>
          {['login', 'register'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex: 1, padding: '10px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500, color: tab === t ? '#1a6b4a' : '#9ca3af', borderBottom: tab === t ? '2px solid #1a6b4a' : '2px solid transparent', transition: 'all 0.15s' }}>
              {t === 'login' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {tab === 'register' && (
            <>
              <div className="form-group">
                <label>Full name</label>
                <input type="text" name="name" placeholder="Jane Smith" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Phone (optional)</label>
                <input type="tel" name="phone" placeholder="+1 (555) 000-0000" value={form.phone} onChange={handleChange} />
              </div>
            </>
          )}
          <div className="form-group">
            <label>Email address</label>
            <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Please wait...' : tab === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 16 }}>
          By continuing you agree to our <a href="#" style={{ color: '#1a6b4a' }}>Terms</a> and <a href="#" style={{ color: '#1a6b4a' }}>Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}