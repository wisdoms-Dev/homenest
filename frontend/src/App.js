import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import ListingsPage from './pages/ListingsPage';
import PropertyPage from './pages/PropertyPage';
import ApplicationPage from './pages/ApplicationPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import AIMatchPage from './pages/AIMatchPage';

// ─── Auth context ─────────────────────────────────────────────────────────
const AuthCtx = createContext({ user: null, loading: false });
function AuthProvider({ children }) {
  const [user] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hn_user')); } catch { return null; }
  });
  return <AuthCtx.Provider value={{ user, loading: false }}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);

// ─── Styles ───────────────────────────────────────────────────────────────
const S = {
  nav: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', height:64, background:'#fff', borderBottom:'1px solid #e5e7eb', position:'sticky', top:0, zIndex:100 },
  logo: { fontSize:22, fontWeight:700, color:'#1a6b4a', textDecoration:'none', fontFamily:'Georgia,serif', cursor:'pointer' },
  logoSpan: { color:'#e07b39' },
  navLinks: { display:'flex', gap:20, alignItems:'center' },
  navLink: { fontSize:14, color:'#4b5563', cursor:'pointer', textDecoration:'none', background:'none', border:'none', fontFamily:'inherit' },
  btnPrimary: { padding:'9px 20px', background:'#1a6b4a', color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:500, cursor:'pointer' },
  btnOutline: { padding:'9px 20px', background:'transparent', color:'#4b5563', border:'1px solid #d1d5db', borderRadius:8, fontSize:14, cursor:'pointer' },
  btnAccent: { padding:'12px 28px', background:'#e07b39', color:'#fff', border:'none', borderRadius:8, fontSize:15, fontWeight:500, cursor:'pointer' },
  hero: { background:'linear-gradient(135deg,#0a2e1c,#1a6b4a 55%,#2d9b6e)', padding:'72px 24px 56px', textAlign:'center', color:'#fff' },
  heroTitle: { fontSize:48, fontWeight:700, fontFamily:'Georgia,serif', lineHeight:1.15, marginBottom:12 },
  heroSub: { fontSize:17, opacity:0.85, marginBottom:32, maxWidth:520, margin:'0 auto 32px' },
  searchBar: { display:'flex', gap:8, background:'#fff', borderRadius:12, padding:8, maxWidth:580, margin:'0 auto 36px', alignItems:'center' },
  searchInput: { flex:1, border:'none', outline:'none', fontSize:14, color:'#111', padding:'6px 8px' },
  searchSelect: { border:'none', outline:'none', fontSize:13, color:'#555', padding:'6px 8px', background:'transparent' },
  statsRow: { display:'flex', justifyContent:'center', gap:48, flexWrap:'wrap', marginTop:8 },
  stat: { textAlign:'center' },
  statNum: { display:'block', fontSize:28, fontWeight:700, fontFamily:'Georgia,serif' },
  statLabel: { display:'block', fontSize:12, opacity:0.65 },
  section: { padding:'48px 24px', maxWidth:1160, margin:'0 auto' },
  sectionTitle: { fontSize:28, fontWeight:700, fontFamily:'Georgia,serif', marginBottom:6 },
  sectionSub: { fontSize:15, color:'#9ca3af', marginBottom:28 },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:24 },
  card: { background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, overflow:'hidden', cursor:'pointer' },
  cardImg: { width:'100%', height:190, objectFit:'cover', display:'block', background:'#f3f4f6' },
  cardBody: { padding:16 },
  badge: { display:'inline-block', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600, color:'#fff', marginBottom:8 },
  price: { fontSize:20, fontWeight:700, fontFamily:'Georgia,serif', color:'#1a6b4a', marginBottom:4 },
  addr: { fontSize:13, color:'#9ca3af', marginBottom:8 },
  meta: { display:'flex', gap:14, fontSize:13, color:'#6b7280' },
  aiBanner: { background:'#f0f9f4', borderTop:'1px solid #c8e8d8', borderBottom:'1px solid #c8e8d8', padding:'48px 24px' },
  aiBannerInner: { maxWidth:1160, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', gap:24, flexWrap:'wrap' },
  stepsGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:24 },
  stepCard: { background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:28 },
  stepNum: { fontSize:36, fontWeight:700, fontFamily:'Georgia,serif', color:'#c8e8d8', marginBottom:12 },
};

// ─── Navbar ───────────────────────────────────────────────────────────────
function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <nav style={S.nav}>
      <span style={S.logo} onClick={() => navigate('/')}>
        Home<span style={S.logoSpan}>Nest</span>
      </span>
      <div style={S.navLinks}>
        <button style={S.navLink} onClick={() => navigate('/listings')}>Browse</button>
        <button style={S.navLink} onClick={() => navigate('/ai')}>AI Match</button>
        {user?.role === 'admin' && <button style={S.navLink} onClick={() => navigate('/admin')}>Admin</button>}
        {user
          ? <>
              <button style={S.navLink} onClick={() => navigate('/dashboard')}>My Applications</button>
              <button style={S.btnOutline} onClick={() => { localStorage.clear(); window.location.reload(); }}>Sign out</button>
            </>
          : <>
              <button style={S.btnOutline} onClick={() => navigate('/login')}>Sign in</button>
              <button style={S.btnPrimary} onClick={() => navigate('/login')}>Get started</button>
            </>
        }
      </div>
    </nav>
  );
}

// ─── Property Card ────────────────────────────────────────────────────────
function PropCard({ p, onClick }) {
  const img = p.images?.[0] || p.img || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=500&q=70';
  return (
    <div style={S.card} onClick={onClick}>
      <img src={img} alt={p.title} style={S.cardImg} />
      <div style={S.cardBody}>
        <span style={{ ...S.badge, background: p.type === 'rent' ? '#1a6b4a' : '#e07b39' }}>
          {p.type === 'rent' ? 'For rent' : 'For sale'}
        </span>
        <div style={S.price}>${p.price?.toLocaleString()}{p.type === 'rent' ? '/mo' : ''}</div>
        <div style={S.addr}>{p.city}, {p.state}</div>
        <div style={S.meta}>
          <span>{p.beds > 0 ? `${p.beds} bd` : 'Studio'}</span>
          <span>{p.baths} ba</span>
          <span>{p.sqft?.toLocaleString()} sqft</span>
        </div>
      </div>
    </div>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────
function HomePage() {
  const navigate = useNavigate();
  const DEMOS = [
    { id:'1', title:'Modern 2BR Apartment', city:'Austin', state:'TX', price:2100, type:'rent', beds:2, baths:1, sqft:980, img:'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=500&q=70' },
    { id:'2', title:'Charming 3BR House', city:'Miami', state:'FL', price:3400, type:'rent', beds:3, baths:2, sqft:1450, img:'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500&q=70' },
    { id:'3', title:'Studio in NYC', city:'New York', state:'NY', price:2800, type:'rent', beds:0, baths:1, sqft:480, img:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=70' },
    { id:'4', title:'Spacious Family Home', city:'Dallas', state:'TX', price:385000, type:'buy', beds:4, baths:3, sqft:2800, img:'https://images.unsplash.com/photo-1506974210756-8e1b8985d348?w=500&q=70' },
  ];
  return (
    <div>
      <div style={S.hero}>
        <p style={{ fontSize:12, letterSpacing:'0.1em', textTransform:'uppercase', opacity:0.7, marginBottom:14 }}>The smarter way to find a home</p>
        <h1 style={S.heroTitle}>Rent or buy your<br/>perfect U.S. home</h1>
        <p style={S.heroSub}>Browse verified listings, apply online, and move in — all with a simple $35 application fee</p>
        <div style={S.searchBar}>
          <select style={S.searchSelect}><option>All types</option><option>For rent</option><option>For sale</option></select>
          <input style={S.searchInput} placeholder="City, state or ZIP code..." />
          <button style={S.btnPrimary} onClick={() => navigate('/listings')}>Search homes</button>
        </div>
        <div style={S.statsRow}>
          {[['12,400+','Active listings'],['48 states','Coverage'],['$35','Application fee'],['24/7','Support']].map(([n,l]) => (
            <div key={l} style={S.stat}><span style={S.statNum}>{n}</span><span style={S.statLabel}>{l}</span></div>
          ))}
        </div>
      </div>

      <div style={S.section}>
        <h2 style={S.sectionTitle}>Featured listings</h2>
        <p style={S.sectionSub}>Hand-picked properties across the United States</p>
        <div style={S.grid}>
          {DEMOS.map(p => <PropCard key={p.id} p={p} onClick={() => navigate('/listings')} />)}
        </div>
        <div style={{ textAlign:'center', marginTop:32 }}>
          <button style={S.btnOutline} onClick={() => navigate('/listings')}>View all listings →</button>
        </div>
      </div>

      <div style={S.aiBanner}>
        <div style={S.aiBannerInner}>
          <div>
            <h2 style={{ fontSize:24, fontFamily:'Georgia,serif', color:'#1a6b4a', marginBottom:6 }}>Let AI find your perfect home</h2>
            <p style={{ fontSize:15, color:'#4b5563', maxWidth:480 }}>Tell us your preferences and our AI will match you with the best listings</p>
          </div>
          <button style={S.btnAccent} onClick={() => navigate('/ai')}>Try AI Match</button>
        </div>
      </div>

      <div style={{ ...S.section, textAlign:'center' }}>
        <h2 style={{ ...S.sectionTitle, marginBottom:6 }}>How HomeNest works</h2>
        <p style={{ ...S.sectionSub, marginBottom:32 }}>Three simple steps to your new home</p>
        <div style={S.stepsGrid}>
          {[
            ['01','Browse listings','Search thousands of verified rental and purchase listings across 48 U.S. states.'],
            ['02','Apply online','Submit your application with a one-time $35 fee — processed securely via Stripe.'],
            ['03','Move in','Get approved fast and coordinate your move-in directly with the property manager.'],
          ].map(([n,t,d]) => (
            <div key={n} style={S.stepCard}>
              <div style={S.stepNum}>{n}</div>
              <h3 style={{ fontSize:17, marginBottom:8 }}>{t}</h3>
              <p style={{ fontSize:14, color:'#6b7280', lineHeight:1.6 }}>{d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
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
            <Route path="/" element={<HomePage />} />
            <Route path="/listings" element={<ListingsPage />} />
            <Route path="/properties/:id" element={<PropertyPage />} />
            <Route path="/apply/:propertyId" element={<ApplicationPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/ai" element={<AIMatchPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}