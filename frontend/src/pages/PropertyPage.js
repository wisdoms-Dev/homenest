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

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', color:'#9ca3af', fontSize:16 }}>
      Loading property...
    </div>
  );

  if (!property) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', color:'#9ca3af', fontSize:16 }}>
      Property not found.
    </div>
  );

  const {
    title, address, city, state, zip,
    price, type, beds, baths, sqft,
    description, images, videos,
    amenities, yearBuilt
  } = property;

  // Build combined media array
  const allMedia = [
    ...(Array.isArray(images) && images.length > 0 ? images.map(url => ({ url, kind: 'image' })) : []),
    ...(Array.isArray(videos) && videos.length > 0 ? videos.map(url => ({ url, kind: 'video' })) : []),
  ];

  if (allMedia.length === 0) {
    allMedia.push({
      url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=900&q=80',
      kind: 'image'
    });
  }

  const active = allMedia[activeIdx];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 60px' }}>

      {/* Back */}
      <Link to="/listings" style={{ color:'#9ca3af', fontSize:14, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:6, marginBottom:24 }}>
        ← Back to listings
      </Link>

      {/* Title */}
      <h1 style={{ fontFamily:'Georgia,serif', fontSize:28, marginBottom:4 }}>{title}</h1>
      <p style={{ color:'#9ca3af', fontSize:15, marginBottom:24 }}>{address}, {city}, {state} {zip}</p>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:32, alignItems:'start' }}>

        {/* ── LEFT: Gallery + Details ── */}
        <div>

          {/* Main media viewer */}
          <div style={{ position:'relative', borderRadius:12, overflow:'hidden', height:420, background:'#111', marginBottom:8 }}>
            {active.kind === 'video' ? (
              <video
                key={active.url}
                src={active.url}
                controls
                style={{ width:'100%', height:'100%', objectFit:'cover' }}
              />
            ) : (
              <img
                src={active.url}
                alt={title}
                style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
              />
            )}

            {/* Type + rent/sale badge */}
            <div style={{ position:'absolute', top:12, left:12, display:'flex', gap:8 }}>
              <span style={{ background: type==='rent' ? '#1a6b4a' : '#e07b39', color:'#fff', fontSize:12, fontWeight:600, padding:'4px 12px', borderRadius:20 }}>
                {type === 'rent' ? 'For rent' : 'For sale'}
              </span>
              {active.kind === 'video' && (
                <span style={{ background:'rgba(0,0,0,0.7)', color:'#fff', fontSize:12, padding:'4px 10px', borderRadius:20 }}>🎬 Video</span>
              )}
            </div>

            {/* Counter */}
            {allMedia.length > 1 && (
              <div style={{ position:'absolute', bottom:12, right:12, background:'rgba(0,0,0,0.6)', color:'#fff', padding:'4px 12px', borderRadius:20, fontSize:13 }}>
                {activeIdx + 1} / {allMedia.length}
              </div>
            )}

            {/* Prev/Next arrows */}
            {allMedia.length > 1 && (
              <>
                <button onClick={() => setActiveIdx(i => (i - 1 + allMedia.length) % allMedia.length)}
                  style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)',
                    background:'rgba(0,0,0,0.55)', color:'#fff', border:'none', borderRadius:'50%',
                    width:40, height:40, fontSize:22, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  ‹
                </button>
                <button onClick={() => setActiveIdx(i => (i + 1) % allMedia.length)}
                  style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
                    background:'rgba(0,0,0,0.55)', color:'#fff', border:'none', borderRadius:'50%',
                    width:40, height:40, fontSize:22, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  ›
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {allMedia.length > 1 && (
            <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:8, marginBottom:24 }}>
              {allMedia.map((m, i) => (
                <div key={i} onClick={() => setActiveIdx(i)}
                  style={{ position:'relative', flexShrink:0, width:88, height:64, borderRadius:8,
                    overflow:'hidden', cursor:'pointer', transition:'all 0.15s',
                    border: activeIdx===i ? '3px solid #1a6b4a' : '3px solid transparent',
                    opacity: activeIdx===i ? 1 : 0.6 }}>
                  {m.kind === 'video' ? (
                    <>
                      <video src={m.url} style={{ width:'100%', height:'100%', objectFit:'cover' }} muted />
                      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center',
                        justifyContent:'center', background:'rgba(0,0,0,0.35)', color:'#fff', fontSize:20 }}>▶</div>
                    </>
                  ) : (
                    <img src={m.url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Property details */}
          <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:24, marginBottom:20 }}>
            <h2 style={{ fontSize:18, fontWeight:700, marginBottom:16, fontFamily:'Georgia,serif' }}>Property details</h2>

            {/* Stats row */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(100px,1fr))', gap:12, marginBottom:20 }}>
              {[
                { label:'Bedrooms', val: beds > 0 ? `${beds} bd` : 'Studio' },
                { label:'Bathrooms', val: `${baths} ba` },
                { label:'Square ft', val: sqft?.toLocaleString() },
                yearBuilt && { label:'Year built', val: yearBuilt },
              ].filter(Boolean).map(m => (
                <div key={m.label} style={{ background:'#f9fafb', borderRadius:8, padding:'12px 14px', textAlign:'center' }}>
                  <div style={{ fontSize:18, fontWeight:600, color:'#111' }}>{m.val}</div>
                  <div style={{ fontSize:12, color:'#9ca3af', marginTop:2 }}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            <h3 style={{ fontSize:15, fontWeight:600, marginBottom:8 }}>About this property</h3>
            <p style={{ color:'#6b7280', fontSize:14, lineHeight:1.8, marginBottom: amenities?.length > 0 ? 20 : 0 }}>
              {description || `A beautiful ${beds > 0 ? `${beds}-bedroom` : 'studio'} property located in ${city}, ${state}. Features ${sqft?.toLocaleString()} sq ft of living space with ${baths} bathroom${baths > 1 ? 's' : ''}.`}
            </p>

            {/* Amenities */}
            {amenities?.length > 0 && (
              <>
                <h3 style={{ fontSize:15, fontWeight:600, marginBottom:10 }}>Amenities</h3>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {amenities.map(a => (
                    <span key={a} style={{ background:'#f0f9f4', color:'#1a6b4a', padding:'5px 14px', borderRadius:20, fontSize:13 }}>{a}</span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Media count */}
          {(images?.length > 0 || videos?.length > 0) && (
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              {images?.length > 0 && (
                <span style={{ fontSize:13, background:'#f3f4f6', color:'#6b7280', padding:'4px 12px', borderRadius:20 }}>
                  📷 {images.length} photo{images.length > 1 ? 's' : ''}
                </span>
              )}
              {videos?.length > 0 && (
                <span style={{ fontSize:13, background:'#f3f4f6', color:'#6b7280', padding:'4px 12px', borderRadius:20 }}>
                  🎬 {videos.length} video{videos.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT: Sidebar ── */}
        <div style={{ position:'sticky', top:80 }}>
          <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:24 }}>

            {/* Price */}
            <div style={{ fontSize:32, fontWeight:700, fontFamily:'Georgia,serif', color:'#1a6b4a', marginBottom:4 }}>
              ${price?.toLocaleString()}
              {type === 'rent' && <span style={{ fontSize:16, fontWeight:400, color:'#9ca3af' }}>/mo</span>}
            </div>
            <div style={{ fontSize:14, color:'#9ca3af', marginBottom:20 }}>{city}, {state}</div>

            {/* Quick stats */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:20 }}>
              {[
                { label:'Beds', val: beds > 0 ? beds : '—' },
                { label:'Baths', val: baths },
                { label:'Sqft', val: sqft?.toLocaleString() },
              ].map(m => (
                <div key={m.label} style={{ background:'#f9fafb', borderRadius:8, padding:'10px', textAlign:'center' }}>
                  <div style={{ fontSize:17, fontWeight:600 }}>{m.val}</div>
                  <div style={{ fontSize:11, color:'#9ca3af' }}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* Fee box */}
            <div style={{ background:'#f0f9f4', border:'1px solid #c8e8d8', borderRadius:10, padding:16, marginBottom:20 }}>
              <div style={{ fontSize:13, color:'#1a6b4a', marginBottom:4 }}>One-time application fee</div>
              <div style={{ fontSize:26, fontWeight:700, color:'#1a6b4a', fontFamily:'Georgia,serif' }}>$35.00</div>
              <div style={{ fontSize:12, color:'#9ca3af', marginTop:4 }}>Processed securely via Stripe</div>
            </div>

            {/* Apply button */}
            {user ? (
              <button
                onClick={() => navigate(`/apply/${id}`)}
                style={{ width:'100%', padding:'14px', background:'#e07b39', color:'#fff', border:'none',
                  borderRadius:8, cursor:'pointer', fontSize:16, fontWeight:600, fontFamily:'inherit' }}>
                Apply now — $35 fee
              </button>
            ) : (
              <Link to="/login"
                style={{ display:'block', width:'100%', padding:'14px', background:'#1a6b4a', color:'#fff',
                  border:'none', borderRadius:8, cursor:'pointer', fontSize:16, fontWeight:600,
                  fontFamily:'inherit', textAlign:'center', textDecoration:'none', boxSizing:'border-box' }}>
                Sign in to apply
              </Link>
            )}

            <p style={{ fontSize:12, color:'#9ca3af', textAlign:'center', marginTop:10 }}>
              Application fee is non-refundable
            </p>
          </div>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 360px"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="position: sticky"] {
            position: static !important;
          }
        }
      `}</style>
    </div>
  );
}