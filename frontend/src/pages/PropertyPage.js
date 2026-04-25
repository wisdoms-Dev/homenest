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
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    propertiesAPI.get(id)
      .then(res => setProperty(res.data))
      .catch(() => setProperty(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-screen">Loading property...</div>;
  if (!property) return <div className="loading-screen">Property not found.</div>;

  const { title, address, city, state, zip, price, type, beds, baths, sqft, description, images, videos, amenities, yearBuilt } = property;

  // Combine images and videos into one media array
  const allMedia = [
    ...(images?.length > 0 ? images.map(url => ({ url, type: 'image' })) : []),
    ...(videos?.length > 0 ? videos.map(url => ({ url, type: 'video' })) : []),
  ];

  if (allMedia.length === 0) {
    allMedia.push({ url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=900&q=80', type: 'image' });
  }

  const active = allMedia[activeIdx];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      <Link to="/listings" style={{ color: '#9ca3af', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        ← Back to listings
      </Link>

      <div className="property-detail-layout">
        {/* Media gallery */}
        <div>
          {/* Main viewer */}
          <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', height: 400, background: '#000' }}>
            {active.type === 'video' ? (
              <video
                key={active.url}
                src={active.url}
                controls
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <img src={active.url} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}

            <span className={`property-badge ${type === 'rent' ? 'badge-rent' : 'badge-buy'}`}>
              {type === 'rent' ? 'For rent' : 'For sale'}
            </span>

            {/* Counter */}
            {allMedia.length > 1 && (
              <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 10px', borderRadius: 20, fontSize: 12 }}>
                {activeIdx + 1} / {allMedia.length}
                {active.type === 'video' && ' 🎬'}
              </div>
            )}

            {/* Prev / Next */}
            {allMedia.length > 1 && (
              <>
                <button
                  onClick={() => setActiveIdx(i => (i - 1 + allMedia.length) % allMedia.length)}
                  style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 18 }}>
                  ‹
                </button>
                <button
                  onClick={() => setActiveIdx(i => (i + 1) % allMedia.length)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 18 }}>
                  ›
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {allMedia.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {allMedia.map((m, i) => (
                <div key={i} onClick={() => setActiveIdx(i)}
                  style={{ position: 'relative', flexShrink: 0, width: 80, height: 60, borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                    border: activeIdx === i ? '2px solid #1a6b4a' : '2px solid transparent',
                    opacity: activeIdx === i ? 1 : 0.6, transition: 'all 0.15s' }}>
                  {m.type === 'video' ? (
                    <>
                      <video src={m.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: 18 }}>▶</div>
                    </>
                  ) : (
                    <img src={m.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* About */}
          <div className="card" style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}>About this property</h2>
            <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.7 }}>
              {description || `A beautiful ${beds > 0 ? `${beds}-bedroom` : 'studio'} property in ${city}, ${state}. ${sqft?.toLocaleString()} sq ft of living space with ${baths} bathroom${baths > 1 ? 's' : ''}.`}
            </p>
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
            <div style={{ fontSize: 30, fontFamily: 'Georgia, serif', color: '#1a6b4a', fontWeight: 600, marginBottom: 4 }}>
              ${price?.toLocaleString()}
              {type === 'rent' && <span style={{ fontSize: 16, fontWeight: 400, color: '#9ca3af' }}>/mo</span>}
            </div>
            <div style={{ fontSize: 15, color: '#9ca3af', marginBottom: 20 }}>{address}, {city}, {state} {zip}</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Beds',  val: beds > 0 ? beds : 'Studio' },
                { label: 'Baths', val: baths },
                { label: 'Sq ft', val: sqft?.toLocaleString() },
              ].map(m => (
                <div key={m.label} style={{ background: '#f9fafb', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 500 }}>{m.val}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* Media counts */}
            {(images?.length > 0 || videos?.length > 0) && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                {images?.length > 0 && (
                  <span style={{ fontSize: 12, background: '#f3f4f6', color: '#6b7280', padding: '3px 10px', borderRadius: 20 }}>
                    📷 {images.length} photo{images.length > 1 ? 's' : ''}
                  </span>
                )}
                {videos?.length > 0 && (
                  <span style={{ fontSize: 12, background: '#f3f4f6', color: '#6b7280', padding: '3px 10px', borderRadius: 20 }}>
                    🎬 {videos.length} video{videos.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            )}

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
              Your application fee is non-refundable.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .property-detail-layout { display: grid; grid-template-columns: 1fr 360px; gap: 32px; align-items: start; }
        .property-sidebar { position: sticky; top: 80px; }
        @media (max-width: 768px) {
          .property-detail-layout { grid-template-columns: 1fr; }
          .property-sidebar { position: static; }
        }
      `}</style>
    </div>
  );
}