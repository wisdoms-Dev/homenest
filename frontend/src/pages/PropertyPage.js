import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { propertiesAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';

export default function PropertyPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    propertiesAPI.get(id)
      .then(res => setProperty(res.data))
      .catch(() => setProperty(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-screen">Loading property...</div>;
  if (!property) return <div className="loading-screen">Property not found.</div>;

  const { title, address, city, state, zip, price, type, beds, baths, sqft, description, images, amenities, yearBuilt } = property;
  const allImages = images?.length > 0 ? images : [
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=900&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900&q=80',
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      <Link to="/listings" style={{ color: '#9ca3af', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        ← Back to listings
      </Link>

      <div className="property-detail-layout">
        {/* Image gallery */}
        <div>
          <div className="main-image">
            <img src={allImages[activeImg]} alt={title} />
            <span className={`property-badge ${type === 'rent' ? 'badge-rent' : 'badge-buy'}`}>
              {type === 'rent' ? 'For rent' : 'For sale'}
            </span>
          </div>
          <div className="thumb-row">
            {allImages.map((img, i) => (
              <img key={i} src={img} alt="" className={`thumb ${activeImg === i ? 'active' : ''}`} onClick={() => setActiveImg(i)} />
            ))}
          </div>

          <div className="card" style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}>About this property</h2>
            <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.7 }}>{description || 'A beautiful property in a prime location with easy access to local amenities, schools, and transport links.'}</p>

            {amenities?.length > 0 && (
              <>
                <h3 style={{ fontSize: 16, marginTop: 20, marginBottom: 10 }}>Amenities</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {amenities.map(a => (
                    <span key={a} style={{ background: '#f0f9f4', color: '#1a6b4a', padding: '4px 12px', borderRadius: 20, fontSize: 13 }}>{a}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="property-sidebar">
          <div className="card">
            <div style={{ fontSize: 30, fontFamily: 'Playfair Display, serif', color: '#1a6b4a', fontWeight: 600, marginBottom: 4 }}>
              ${price?.toLocaleString()}{type === 'rent' ? <span style={{ fontSize: 16, fontWeight: 400, color: '#9ca3af' }}>/mo</span> : ''}
            </div>
            <div style={{ fontSize: 15, color: '#9ca3af', marginBottom: 20 }}>{address}, {city}, {state} {zip}</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Beds', val: beds > 0 ? beds : 'Studio' },
                { label: 'Baths', val: baths },
                { label: 'Sq ft', val: sqft?.toLocaleString() },
              ].map(m => (
                <div key={m.label} style={{ background: '#f9fafb', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 500 }}>{m.val}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>{m.label}</div>
                </div>
              ))}
            </div>

            {yearBuilt && <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 16 }}>Built in {yearBuilt}</p>}

            <div className="fee-notice">
              <p>One-time application fee (paid securely via Stripe)</p>
              <strong>$35.00</strong>
            </div>

            {user ? (
              <button className="btn btn-accent btn-lg btn-full" onClick={() => navigate(`/apply/${id}`)}>
                Apply now — $35 fee
              </button>
            ) : (
              <Link to="/login" className="btn btn-primary btn-lg btn-full">Sign in to apply</Link>
            )}

            <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 12 }}>
              Your application fee is non-refundable. By applying you agree to our terms.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .property-detail-layout { display: grid; grid-template-columns: 1fr 360px; gap: 32px; align-items: start; }
        .main-image { position: relative; border-radius: 12px; overflow: hidden; height: 400px; }
        .main-image img { width: 100%; height: 100%; object-fit: cover; }
        .thumb-row { display: flex; gap: 8px; margin-top: 8px; }
        .thumb { width: 80px; height: 60px; object-fit: cover; border-radius: 8px; cursor: pointer; opacity: 0.6; border: 2px solid transparent; transition: all 0.15s; }
        .thumb.active { opacity: 1; border-color: #1a6b4a; }
        .property-sidebar { position: sticky; top: 80px; }
        @media (max-width: 768px) {
          .property-detail-layout { grid-template-columns: 1fr; }
          .property-sidebar { position: static; }
        }
      `}</style>
    </div>
  );
}