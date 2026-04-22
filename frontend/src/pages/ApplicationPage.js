import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { propertiesAPI, applicationsAPI, paymentsAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';

export default function ApplicationPage() {
  const { propertyId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    message: '', moveInDate: '', annualIncome: '', employerName: '',
  });

  useEffect(() => {
    propertiesAPI.get(propertyId)
      .then(res => setProperty(res.data))
      .catch(() => navigate('/listings'))
      .finally(() => setLoading(false));
  }, [propertyId, navigate]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // 1. Create application record
      const appRes = await applicationsAPI.submit({ propertyId, ...form });
      const applicationId = appRes.data.id;

      // 2. Create Stripe checkout session
      const checkoutRes = await paymentsAPI.createCheckout({ propertyId, applicationId });

      // 3. Redirect to Stripe
      window.location.href = checkoutRes.data.url;
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong. Please try again.';
      toast.error(msg);
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!property) return null;

  return (
    <div style={{ maxWidth: 640, margin: '40px auto', padding: '0 24px' }}>
      <Link to={`/properties/${propertyId}`} style={{ color: '#9ca3af', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
        ← Back to property
      </Link>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <img
            src={property.images?.[0] || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=200&q=80'}
            alt={property.title}
            style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
          />
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 600, color: '#1a6b4a' }}>
              ${property.price?.toLocaleString()}{property.type === 'rent' ? '/mo' : ''}
            </div>
            <div style={{ fontSize: 13, color: '#9ca3af' }}>{property.address}, {property.city}, {property.state}</div>
          </div>
        </div>
      </div>

      <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, marginBottom: 6 }}>Submit your application</h1>
      <p style={{ color: '#9ca3af', fontSize: 15, marginBottom: 28 }}>Fill in your details below. After submitting you'll be redirected to pay the $35 application fee via Stripe.</p>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h2 style={{ fontSize: 17, marginBottom: 18 }}>Your information</h2>
          <div style={{ background: '#f9fafb', borderRadius: 8, padding: 14, marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: '#6b7280' }}>Applying as</div>
            <div style={{ fontWeight: 500, marginTop: 2 }}>{user?.name} · {user?.email}</div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Annual income (optional)</label>
              <input type="text" name="annualIncome" placeholder="e.g. $65,000" value={form.annualIncome} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Employer name (optional)</label>
              <input type="text" name="employerName" placeholder="e.g. Acme Corp" value={form.employerName} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Desired move-in date (optional)</label>
            <input type="date" name="moveInDate" value={form.moveInDate} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Message to landlord (optional)</label>
            <textarea name="message" rows={4} placeholder="Introduce yourself and explain why you'd be a great tenant..." value={form.message} onChange={handleChange} style={{ resize: 'vertical' }} />
          </div>
        </div>

        <div className="fee-notice" style={{ margin: '20px 0' }}>
          <p>Non-refundable application fee — processed securely via Stripe</p>
          <strong>$35.00</strong>
        </div>

        <button type="submit" className="btn btn-accent btn-lg btn-full" disabled={submitting}>
          {submitting ? 'Redirecting to payment...' : 'Continue to payment — $35'}
        </button>

        <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 12 }}>
          You'll be redirected to Stripe to complete your secure payment.
        </p>
      </form>
    </div>
  );
}