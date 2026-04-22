import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { adminAPI, propertiesAPI, applicationsAPI } from '../utils/api';
import toast from 'react-hot-toast';

function AdminStats() {
  const [stats, setStats] = useState(null);
  useEffect(() => { adminAPI.stats().then(r => setStats(r.data)).catch(() => {}); }, []);
  if (!stats) return <div className="loading-screen">Loading stats...</div>;
  return (
    <div>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, marginBottom: 20 }}>Dashboard overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 32 }}>
        {[
          { label: 'Active listings', val: stats.totalProperties },
          { label: 'Total applications', val: stats.totalApplications },
          { label: 'Pending review', val: stats.pendingApplications },
          { label: 'Total revenue', val: `$${parseFloat(stats.totalRevenue).toLocaleString()}` },
          { label: 'Registered users', val: stats.totalUsers },
          { label: 'Payments collected', val: stats.totalPayments },
        ].map(m => (
          <div key={m.label} style={{ background: '#f9fafb', borderRadius: 10, padding: '16px 18px' }}>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontSize: 22, fontWeight: 500, fontFamily: 'Playfair Display, serif' }}>{m.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title:'', address:'', city:'', state:'', zip:'', price:'', type:'rent', beds:'', baths:'', sqft:'', description:'' });

  useEffect(() => {
    propertiesAPI.list({ limit: 50 }).then(r => setProperties(r.data.properties || [])).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this listing?')) return;
    await propertiesAPI.delete(id);
    setProperties(p => p.filter(x => x.id !== id));
    toast.success('Listing removed');
  };

  const handleAdd = async e => {
    e.preventDefault();
    try {
      const res = await propertiesAPI.create(form);
      setProperties(p => [res.data, ...p]);
      setShowForm(false);
      toast.success('Property added!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add property');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22 }}>All properties</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Add property'}</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 17, marginBottom: 18 }}>Add new property</h3>
          <form onSubmit={handleAdd}>
            <div className="form-grid">
              <div className="form-group"><label>Title</label><input value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} required /></div>
              <div className="form-group"><label>Type</label><select value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))}><option value="rent">Rental</option><option value="buy">For sale</option></select></div>
              <div className="form-group"><label>Price ($)</label><input type="number" value={form.price} onChange={e => setForm(f=>({...f,price:e.target.value}))} required /></div>
              <div className="form-group"><label>Address</label><input value={form.address} onChange={e => setForm(f=>({...f,address:e.target.value}))} required /></div>
              <div className="form-group"><label>City</label><input value={form.city} onChange={e => setForm(f=>({...f,city:e.target.value}))} required /></div>
              <div className="form-group"><label>State</label><input value={form.state} onChange={e => setForm(f=>({...f,state:e.target.value}))} required /></div>
              <div className="form-group"><label>Beds</label><input type="number" value={form.beds} onChange={e => setForm(f=>({...f,beds:e.target.value}))} /></div>
              <div className="form-group"><label>Baths</label><input type="number" value={form.baths} onChange={e => setForm(f=>({...f,baths:e.target.value}))} /></div>
              <div className="form-group"><label>Sq ft</label><input type="number" value={form.sqft} onChange={e => setForm(f=>({...f,sqft:e.target.value}))} /></div>
            </div>
            <div className="form-group"><label>Description</label><textarea rows={3} value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} style={{resize:'vertical'}} /></div>
            <button type="submit" className="btn btn-primary">Save property</button>
          </form>
        </div>
      )}

      {loading ? <div className="loading-screen">Loading...</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              {['Address', 'Type', 'Price', 'Beds', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: '#9ca3af', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {properties.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '10px 12px' }}>{p.address}, {p.city}</td>
                <td style={{ padding: '10px 12px', color: '#9ca3af' }}>{p.type === 'rent' ? 'Rental' : 'For sale'}</td>
                <td style={{ padding: '10px 12px' }}>${p.price?.toLocaleString()}</td>
                <td style={{ padding: '10px 12px' }}>{p.beds > 0 ? p.beds : 'Studio'}</td>
                <td style={{ padding: '10px 12px' }}><span className="status-badge status-approved">Active</span></td>
                <td style={{ padding: '10px 12px', display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => toast('Edit form coming soon')}>Edit</button>
                  <button style={{ padding: '4px 12px', fontSize: 12, background: '#fdeaea', color: '#b03030', border: 'none', borderRadius: 6, cursor: 'pointer' }} onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { applicationsAPI.all().then(r => setApplications(r.data || [])).finally(() => setLoading(false)); }, []);

  const updateStatus = async (id, status) => {
    await applicationsAPI.updateStatus(id, status);
    setApplications(a => a.map(x => x.id === id ? { ...x, status } : x));
    toast.success(`Application ${status}`);
  };

  if (loading) return <div className="loading-screen">Loading...</div>;
  return (
    <div>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, marginBottom: 20 }}>All applications</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead><tr style={{ borderBottom: '1px solid #e5e7eb' }}>
          {['Applicant', 'Property', 'Date', 'Fee', 'Status', 'Actions'].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: '#9ca3af', fontWeight: 500 }}>{h}</th>)}
        </tr></thead>
        <tbody>
          {applications.map(a => (
            <tr key={a.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '10px 12px' }}>{a.userEmail}</td>
              <td style={{ padding: '10px 12px', color: '#9ca3af', fontSize: 12 }}>{a.propertyId?.slice(0, 12)}...</td>
              <td style={{ padding: '10px 12px', color: '#9ca3af' }}>{new Date(a.createdAt).toLocaleDateString()}</td>
              <td style={{ padding: '10px 12px' }}><span className={`status-badge ${a.paymentStatus === 'paid' ? 'status-approved' : 'status-pending'}`}>{a.paymentStatus === 'paid' ? '$35 paid' : 'Pending'}</span></td>
              <td style={{ padding: '10px 12px' }}><span className={`status-badge status-${a.status}`}>{a.status}</span></td>
              <td style={{ padding: '10px 12px', display: 'flex', gap: 6 }}>
                {a.status === 'pending' && <>
                  <button style={{ padding: '3px 10px', fontSize: 12, background: '#e8f5ef', color: '#1a6b4a', border: 'none', borderRadius: 6, cursor: 'pointer' }} onClick={() => updateStatus(a.id, 'approved')}>Approve</button>
                  <button style={{ padding: '3px 10px', fontSize: 12, background: '#fdeaea', color: '#b03030', border: 'none', borderRadius: 6, cursor: 'pointer' }} onClick={() => updateStatus(a.id, 'declined')}>Decline</button>
                </>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { adminAPI.users().then(r => setUsers(r.data || [])).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="loading-screen">Loading...</div>;
  return (
    <div>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, marginBottom: 20 }}>Registered users</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead><tr style={{ borderBottom: '1px solid #e5e7eb' }}>
          {['Name', 'Email', 'Joined', 'Role', 'Actions'].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: '#9ca3af', fontWeight: 500 }}>{h}</th>)}
        </tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '10px 12px' }}>{u.name}</td>
              <td style={{ padding: '10px 12px', color: '#9ca3af' }}>{u.email}</td>
              <td style={{ padding: '10px 12px', color: '#9ca3af' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
              <td style={{ padding: '10px 12px' }}><span className={`status-badge ${u.role === 'admin' ? 'status-pending' : 'status-approved'}`}>{u.role}</span></td>
              <td style={{ padding: '10px 12px' }}>
                {u.role !== 'admin' && <button className="btn btn-outline" style={{ padding: '3px 10px', fontSize: 12 }} onClick={() => { adminAPI.updateUserRole(u.id, 'admin'); toast.success('Made admin'); }}>Make admin</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminPage() {
  const location = useLocation();
  const nav = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/properties', label: 'Properties' },
    { to: '/admin/applications', label: 'Applications' },
    { to: '/admin/users', label: 'Users' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      <aside style={{ width: 200, background: '#fff', borderRight: '1px solid #e5e7eb', padding: '24px 12px', flexShrink: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 10px', marginBottom: 12 }}>Admin</div>
        {nav.map(n => (
          <Link key={n.to} to={n.to}
            style={{ display: 'block', padding: '9px 12px', borderRadius: 8, fontSize: 14, textDecoration: 'none', marginBottom: 2, background: location.pathname === n.to ? '#1a6b4a' : 'transparent', color: location.pathname === n.to ? '#fff' : '#4b5563' }}>
            {n.label}
          </Link>
        ))}
      </aside>
      <main style={{ flex: 1, padding: 32, background: '#f9fafb' }}>
        <Routes>
          <Route index element={<AdminStats />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="users" element={<AdminUsers />} />
        </Routes>
      </main>
    </div>
  );
}