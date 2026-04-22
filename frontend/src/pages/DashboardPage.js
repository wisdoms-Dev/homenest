import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationsAPI, paymentsAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('applications');

  useEffect(() => {
    Promise.all([applicationsAPI.mine(), paymentsAPI.history()])
      .then(([appRes, payRes]) => {
        setApplications(appRes.data || []);
        setPayments(payRes.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen">Loading your dashboard...</div>;

  const statusClass = { pending: 'status-pending', approved: 'status-approved', declined: 'status-declined' };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#e8f5ef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#1a6b4a' }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24 }}>Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p style={{ color: '#9ca3af', fontSize: 14 }}>{user?.email}</p>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 32 }}>
        {[
          { label: 'Applications', val: applications.length },
          { label: 'Pending', val: applications.filter(a => a.status === 'pending').length },
          { label: 'Approved', val: applications.filter(a => a.status === 'approved').length },
          { label: 'Total fees paid', val: `$${payments.length * 35}` },
        ].map(m => (
          <div key={m.label} style={{ background: '#f9fafb', borderRadius: 10, padding: '16px 18px' }}>
            <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontSize: 22, fontWeight: 500, fontFamily: 'Playfair Display, serif' }}>{m.val}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: 24 }}>
        {[['applications', 'My applications'], ['payments', 'Payment history']].map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500, color: tab === t ? '#1a6b4a' : '#9ca3af', borderBottom: tab === t ? '2px solid #1a6b4a' : '2px solid transparent' }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'applications' && (
        applications.length === 0
          ? <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
              <p style={{ marginBottom: 16 }}>You haven't applied to any properties yet.</p>
              <Link to="/listings" className="btn btn-primary">Browse listings</Link>
            </div>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {applications.map(app => (
                <div key={app.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 2 }}>{app.propertyId}</div>
                    <div style={{ fontSize: 13, color: '#9ca3af' }}>Applied {new Date(app.createdAt).toLocaleDateString()}</div>
                    {app.moveInDate && <div style={{ fontSize: 13, color: '#9ca3af' }}>Move-in: {app.moveInDate}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, background: app.paymentStatus === 'paid' ? '#e8f5ef' : '#fdf0e6', color: app.paymentStatus === 'paid' ? '#1a6b4a' : '#c06010', padding: '3px 10px', borderRadius: 20 }}>
                      {app.paymentStatus === 'paid' ? '$35 paid' : 'Payment pending'}
                    </span>
                    <span className={`status-badge ${statusClass[app.status] || 'status-pending'}`}>{app.status}</span>
                  </div>
                </div>
              ))}
            </div>
      )}

      {tab === 'payments' && (
        payments.length === 0
          ? <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>No payments yet.</div>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {payments.map(p => (
                <div key={p.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>Application fee — {p.propertyId}</div>
                    <div style={{ fontSize: 13, color: '#9ca3af', fontFamily: 'monospace' }}>{p.stripeSessionId?.slice(0, 20)}...</div>
                    <div style={{ fontSize: 13, color: '#9ca3af' }}>{new Date(p.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#1a6b4a' }}>${p.amount}</div>
                </div>
              ))}
            </div>
      )}
    </div>
  );
}