import AdminPage from './AdminPage';
import React, { useState, useEffect, createContext, useContext } from 'react';

// ─── Tiny router (no react-router-dom needed to start) ────────────────────
function getPath() { return window.location.pathname; }

// ─── Auth context ─────────────────────────────────────────────────────────
const AuthCtx = createContext({ user: null, loading: false });
function AuthProvider({ children }) {
  const [user] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hn_user')); } catch { return null; }
  });
  return <AuthCtx.Provider value={{ user, loading: false }}>{children}</AuthCtx.Provider>;
}
const useAuth = () => useContext(AuthCtx);

// ─── Demo properties ──────────────────────────────────────────────────────
const DEMOS = [
  { id:'1', title:'Modern 2BR Apartment', city:'Austin', state:'TX', price:2100, type:'rent', beds:2, baths:1, sqft:980, img:'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=500&q=70' },
  { id:'2', title:'Charming 3BR House',   city:'Miami',  state:'FL', price:3400, type:'rent', beds:3, baths:2, sqft:1450, img:'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500&q=70' },
  { id:'3', title:'Studio in NYC',        city:'New York', state:'NY', price:2800, type:'rent', beds:0, baths:1, sqft:480, img:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=70' },
  { id:'4', title:'Spacious Family Home', city:'Dallas', state:'TX', price:385000, type:'buy', beds:4, baths:3, sqft:2800, img:'https://images.unsplash.com/photo-1506974210756-8e1b8985d348?w=500&q=70' },
  { id:'5', title:'Cozy 1BR Condo',       city:'Chicago', state:'IL', price:1600, type:'rent', beds:1, baths:1, sqft:720, img:'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=500&q=70' },
  { id:'6', title:'New Build 3BR Home',   city:'Phoenix', state:'AZ', price:425000, type:'buy', beds:3, baths:2, sqft:1950, img:'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=500&q=70' },
];

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
  feeBox: { background:'#f0f9f4', border:'1px solid #c8e8d8', borderRadius:8, padding:16, margin:'16px 0' },
  formGroup: { marginBottom:16 },
  label: { display:'block', fontSize:13, fontWeight:500, color:'#6b7280', marginBottom:5 },
  input: { width:'100%', padding:'10px 13px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:14, outline:'none', fontFamily:'inherit' },
};

// ─── Navbar ───────────────────────────────────────────────────────────────
function Navbar({ page, setPage }) {
  const { user } = useAuth();
  return (
    <nav style={S.nav}>
      <span style={S.logo} onClick={() => setPage('home')}>
        Home<span style={S.logoSpan}>Nest</span>
      </span>
      <div style={S.navLinks}>
        <button style={S.navLink} onClick={() => setPage('listings')}>Browse</button>
        <button style={S.navLink} onClick={() => setPage('ai')}>AI Match</button>
        {user?.role === 'admin' && <button style={S.navLink} onClick={() => setPage('admin')}>Admin</button>}
        {user
          ? <><button style={S.navLink} onClick={() => setPage('dashboard')}>My Applications</button>
              <button style={S.btnOutline} onClick={() => { localStorage.clear(); window.location.reload(); }}>Sign out</button></>
          : <><button style={S.btnOutline} onClick={() => setPage('login')}>Sign in</button>
              <button style={S.btnPrimary} onClick={() => setPage('login')}>Get started</button></>
        }
      </div>
    </nav>
  );
}

// ─── Property Card ────────────────────────────────────────────────────────
function PropCard({ p, onClick }) {
  return (
    <div style={S.card} onClick={onClick}>
      <img src={p.img} alt={p.title} style={S.cardImg} />
      <div style={S.cardBody}>
        <span style={{ ...S.badge, background: p.type === 'rent' ? '#1a6b4a' : '#e07b39' }}>
          {p.type === 'rent' ? 'For rent' : 'For sale'}
        </span>
        <div style={S.price}>${p.price.toLocaleString()}{p.type === 'rent' ? '/mo' : ''}</div>
        <div style={S.addr}>{p.city}, {p.state}</div>
        <div style={S.meta}>
          <span>{p.beds > 0 ? `${p.beds} bd` : 'Studio'}</span>
          <span>{p.baths} ba</span>
          <span>{p.sqft.toLocaleString()} sqft</span>
        </div>
      </div>
    </div>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────
function HomePage({ setPage, setSelectedProp }) {
  return (
    <div>
      <div style={S.hero}>
        <p style={{ fontSize:12, letterSpacing:'0.1em', textTransform:'uppercase', opacity:0.7, marginBottom:14 }}>The smarter way to find a home</p>
        <h1 style={S.heroTitle}>Rent or buy your<br/>perfect U.S. home</h1>
        <p style={S.heroSub}>Browse verified listings, apply online, and move in — all with a simple $35 application fee</p>
        <div style={S.searchBar}>
          <select style={S.searchSelect}><option>All types</option><option>For rent</option><option>For sale</option></select>
          <input style={S.searchInput} placeholder="City, state or ZIP code..." />
          <button style={S.btnPrimary} onClick={() => setPage('listings')}>Search homes</button>
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
          {DEMOS.slice(0,4).map(p => <PropCard key={p.id} p={p} onClick={() => { setSelectedProp(p); setPage('property'); }} />)}
        </div>
        <div style={{ textAlign:'center', marginTop:32 }}>
          <button style={S.btnOutline} onClick={() => setPage('listings')}>View all listings →</button>
        </div>
      </div>

      <div style={S.aiBanner}>
        <div style={S.aiBannerInner}>
          <div>
            <h2 style={{ fontSize:24, fontFamily:'Georgia,serif', color:'#1a6b4a', marginBottom:6 }}>Let AI find your perfect home</h2>
            <p style={{ fontSize:15, color:'#4b5563', maxWidth:480 }}>Tell us your preferences and our AI will match you with the best listings</p>
          </div>
          <button style={S.btnAccent} onClick={() => setPage('ai')}>Try AI Match</button>
        </div>
      </div>

      <div style={{ ...S.section, textAlign:'center' }}>
        <h2 style={{ ...S.sectionTitle, marginBottom:6 }}>How HomeNest works</h2>
        <p style={{ ...S.sectionSub, marginBottom:32 }}>Three simple steps to your new home</p>
        <div style={S.stepsGrid}>
          {[['01','Browse listings','Search thousands of verified rental and purchase listings across 48 U.S. states.'],
            ['02','Apply online','Submit your application with a one-time $35 fee — processed securely via Stripe.'],
            ['03','Move in','Get approved fast and coordinate your move-in directly with the property manager.']
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

// ─── Listings Page ────────────────────────────────────────────────────────
function ListingsPage({ setPage, setSelectedProp }) {
  const [filter, setFilter] = useState('all');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    fetch(`${base}/properties?limit=50`)
      .then(r => r.json())
      .then(d => {
        const props = d.properties || [];
        // Fall back to demo data if nothing in database yet
        setProperties(props);
      })
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'rent' ? properties.filter(p => p.type === 'rent')
                 : filter === 'buy'  ? properties.filter(p => p.type === 'buy')
                 : properties;

  return (
    <div style={{ maxWidth:1160, margin:'0 auto', padding:'40px 24px' }}>
      <h1 style={{ ...S.sectionTitle, marginBottom:20 }}>Browse all properties</h1>
      <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
        {[['all','All'],['rent','For rent'],['buy','For sale']].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{ padding:'7px 18px', borderRadius:20, border:'1px solid #e5e7eb', fontSize:13, cursor:'pointer', background: filter===v ? '#1a6b4a' : '#fff', color: filter===v ? '#fff' : '#4b5563', fontFamily:'inherit' }}>{l}</button>
        ))}
      </div>
      {loading
        ? <p style={{ color:'#9ca3af' }}>Loading properties...</p>
        : <p style={{ color:'#9ca3af', fontSize:14, marginBottom:20 }}>{filtered.length} properties found</p>
      }
      <div style={S.grid}>
        {filtered.map(p => (
          <PropCard key={p.id} p={{
            ...p,
            img: p.images?.[0] || p.img || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=500&q=70'
          }} onClick={() => { setSelectedProp(p); setPage('property'); }} />
        ))}
      </div>
    </div>
  );
}
// ─── Property Detail Page ─────────────────────────────────────────────────
function PropertyPage({ property, setPage }) {
  const { user } = useAuth();
  if (!property) { setPage('listings'); return null; }
  return (
    <div style={{ maxWidth:1000, margin:'0 auto', padding:'32px 24px' }}>
      <button style={{ ...S.navLink, marginBottom:20, color:'#9ca3af' }} onClick={() => setPage('listings')}>← Back to listings</button>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:32, alignItems:'start' }}>
        <div>
          <img src={property.img} alt={property.title} style={{ width:'100%', height:360, objectFit:'cover', borderRadius:12 }} />
          <div style={{ marginTop:24, background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:24 }}>
            <h2 style={{ fontSize:20, marginBottom:8 }}>About this property</h2>
            <p style={{ color:'#6b7280', lineHeight:1.7 }}>A beautiful {property.beds > 0 ? `${property.beds}-bedroom` : 'studio'} property in {property.city}, {property.state}. {property.sqft.toLocaleString()} sq ft of living space with {property.baths} bathroom{property.baths > 1 ? 's' : ''}. Available for {property.type === 'rent' ? 'rent' : 'purchase'} immediately.</p>
          </div>
        </div>
        <div style={{ position:'sticky', top:80 }}>
          <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:24 }}>
            <div style={{ fontSize:30, fontWeight:700, fontFamily:'Georgia,serif', color:'#1a6b4a', marginBottom:4 }}>
              ${property.price.toLocaleString()}{property.type === 'rent' ? <span style={{ fontSize:16, fontWeight:400, color:'#9ca3af' }}>/mo</span> : ''}
            </div>
            <div style={{ fontSize:14, color:'#9ca3af', marginBottom:20 }}>{property.city}, {property.state}</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:20 }}>
              {[[property.beds > 0 ? property.beds : '—', property.beds > 0 ? 'Beds' : 'Studio'],[property.baths,'Baths'],[property.sqft.toLocaleString(),'Sq ft']].map(([v,l]) => (
                <div key={l} style={{ background:'#f9fafb', borderRadius:8, padding:12, textAlign:'center' }}>
                  <div style={{ fontSize:18, fontWeight:600 }}>{v}</div>
                  <div style={{ fontSize:12, color:'#9ca3af' }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={S.feeBox}>
              <p style={{ fontSize:13, color:'#1a6b4a', marginBottom:4 }}>One-time application fee via Stripe</p>
              <strong style={{ fontSize:22, color:'#1a6b4a' }}>$35.00</strong>
            </div>
            {user
              ? <button style={{ ...S.btnAccent, width:'100%', padding:14, fontSize:15 }} onClick={() => setPage('apply')}>Apply now — $35 fee</button>
              : <button style={{ ...S.btnPrimary, width:'100%', padding:14, fontSize:15 }} onClick={() => setPage('login')}>Sign in to apply</button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────
function LoginPage({ setPage }) {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg('');
    try {
      const url = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const base = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const endpoint = base.replace(/\/api$/, '') + '/api/' + (tab === 'login' ? 'auth/login' : 'auth/register');
      const res = await fetch(endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      localStorage.setItem('hn_token', data.token);
      localStorage.setItem('hn_user', JSON.stringify(data.user));
      window.location.reload();
    } catch(err) {
      setMsg(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'calc(100vh - 64px)', padding:24 }}>
      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:32, width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ ...S.logo, fontSize:26 }}>Home<span style={S.logoSpan}>Nest</span></div>
        </div>
        <div style={{ display:'flex', borderBottom:'1px solid #e5e7eb', marginBottom:24 }}>
          {[['login','Sign in'],['register','Create account']].map(([t,l]) => (
            <button key={t} onClick={() => setTab(t)} style={{ flex:1, padding:'10px', background:'none', border:'none', cursor:'pointer', fontSize:14, fontWeight:500, fontFamily:'inherit', color: tab===t ? '#1a6b4a' : '#9ca3af', borderBottom: tab===t ? '2px solid #1a6b4a' : '2px solid transparent' }}>{l}</button>
          ))}
        </div>
        <form onSubmit={handle}>
          {tab === 'register' && (
            <div style={S.formGroup}><label style={S.label}>Full name</label><input style={S.input} placeholder="Jane Smith" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} required /></div>
          )}
          <div style={S.formGroup}><label style={S.label}>Email address</label><input style={S.input} type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} required /></div>
          <div style={S.formGroup}><label style={S.label}>Password</label><input style={S.input} type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))} required minLength={6} /></div>
          {msg && <p style={{ color:'#dc2626', fontSize:13, marginBottom:12 }}>{msg}</p>}
          <button type="submit" style={{ ...S.btnPrimary, width:'100%', padding:12, fontSize:15 }} disabled={loading}>
            {loading ? 'Please wait...' : tab === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <p style={{ fontSize:12, color:'#9ca3af', textAlign:'center', marginTop:14 }}>
          Backend must be running for login to work.{' '}
          <button style={{ ...S.navLink, color:'#1a6b4a', fontSize:12 }} onClick={() => setPage('home')}>← Back to home</button>
        </p>
      </div>
    </div>
  );
}

// ─── AI Match Page ────────────────────────────────────────────────────────
function AIPage({ setPage, setSelectedProp }) {
  const [form, setForm] = useState({ type:'rent', beds:'', budget:'', location:'' });
  const [results, setResults] = useState([]);
  const [done, setDone] = useState(false);

  const match = (e) => {
    e.preventDefault();
    let r = [...DEMOS];
    if (form.type) r = r.filter(p => p.type === form.type);
    if (form.beds) r = r.filter(p => form.beds === '0' ? p.beds === 0 : p.beds >= parseInt(form.beds));
    if (form.budget) r = r.filter(p => p.price <= parseInt(form.budget));
    if (form.location) r = r.filter(p => p.city.toLowerCase().includes(form.location.toLowerCase()) || p.state.toLowerCase().includes(form.location.toLowerCase()));
    setResults(r.length > 0 ? r : DEMOS.slice(0,3));
    setDone(true);
  };

  return (
    <div style={{ maxWidth:860, margin:'0 auto', padding:'40px 24px' }}>
      <h1 style={{ ...S.sectionTitle, marginBottom:6, textAlign:'center' }}>AI Home Matching</h1>
      <p style={{ ...S.sectionSub, textAlign:'center', marginBottom:28 }}>Tell us what you're looking for</p>
      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:24, marginBottom:28 }}>
        <form onSubmit={match}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div style={S.formGroup}><label style={S.label}>Looking to</label><select style={S.input} value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))}><option value="rent">Rent</option><option value="buy">Buy</option></select></div>
            <div style={S.formGroup}><label style={S.label}>Bedrooms</label><select style={S.input} value={form.beds} onChange={e => setForm(f=>({...f,beds:e.target.value}))}><option value="">Any</option><option value="0">Studio</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option></select></div>
            <div style={S.formGroup}><label style={S.label}>Max budget ($)</label><input style={S.input} type="number" placeholder={form.type==='rent'?'3000':'500000'} value={form.budget} onChange={e => setForm(f=>({...f,budget:e.target.value}))} /></div>
            <div style={S.formGroup}><label style={S.label}>City or state</label><input style={S.input} placeholder="e.g. Austin or TX" value={form.location} onChange={e => setForm(f=>({...f,location:e.target.value}))} /></div>
          </div>
          <button type="submit" style={{ ...S.btnPrimary, width:'100%', padding:12, marginTop:8, fontSize:15 }}>Find my matches</button>
        </form>
      </div>
      {done && (
        <>
          <div style={{ background:'#f0f9f4', border:'1px solid #c8e8d8', borderRadius:10, padding:16, marginBottom:24, display:'flex', gap:12 }}>
            <div style={{ background:'#1a6b4a', color:'#fff', borderRadius:'50%', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, flexShrink:0, fontWeight:700 }}>AI</div>
            <p style={{ fontSize:15, color:'#1a4a35', lineHeight:1.7 }}>Based on your preferences, I found {results.length} great match{results.length !== 1 ? 'es' : ''} for you! {results[0] && `${results[0].title} in ${results[0].city}, ${results[0].state} looks like an excellent fit.`}</p>
          </div>
          <div style={S.grid}>
            {results.map(p => <PropCard key={p.id} p={p} onClick={() => { setSelectedProp(p); setPage('property'); }} />)}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Simple placeholder pages ─────────────────────────────────────────────
function ApplyPage({ property, setPage }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [payMethod, setPayMethod] = useState('card');
  const [form, setForm] = useState({
    fullName: user?.name || '',
    dob: '', phone: '',
    email: user?.email || '',
    currentAddress: '', employerName: '',
    jobTitle: '', monthlyIncome: '',
    timeAtJob: '', prevLandlord: '',
    prevRentDuration: '', reasonLeaving: '',
    occupants: '1', hasPets: 'no',
    petDetails: '', moveInDate: '', message: '',
    giftCardCode: '',
  });

  if (!property) { setPage('listings'); return null; }

  const BTC_ADDRESS = 'bc1q6s678gzwp2ux5j7eymn7trvevl5f5e9l2k5ahx';

  const F = ({ label, name, type='text', placeholder='', options=null, rows=0 }) => (
    <div style={S.formGroup}>
      <label style={S.label}>{label}</label>
      {options ? (
        <select style={S.input} value={form[name]}
          onChange={e => setForm(f=>({...f,[name]:e.target.value}))}>
          {options.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      ) : rows > 0 ? (
        <textarea style={{...S.input, height:rows*40, resize:'vertical'}}
          placeholder={placeholder} value={form[name]}
          onChange={e => setForm(f=>({...f,[name]:e.target.value}))} />
      ) : (
        <input style={S.input} type={type}
          placeholder={placeholder} value={form[name]}
          onChange={e => setForm(f=>({...f,[name]:e.target.value}))} />
      )}
    </div>
  );

  const sectionStyle = { background:'#fff', border:'1px solid #e5e7eb',
    borderRadius:12, padding:24, marginBottom:20 };
  const sectionTitle = { fontSize:18, fontWeight:700,
    fontFamily:'Georgia,serif', marginBottom:16,
    paddingBottom:12, borderBottom:'1px solid #f3f4f6' };

  const handleSubmit = async () => {
    setLoading(true); setMsg('');
    try {
      const base = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('hn_token');

      if (payMethod === 'card') {
        // Stripe card payment — create application then redirect
        const appRes = await fetch(`${base}/applications`, {
          method: 'POST',
          headers: { 'Content-Type':'application/json',
            Authorization:`Bearer ${token}` },
          body: JSON.stringify({
            propertyId: property.id,
            moveInDate: form.moveInDate,
            message: form.message,
            employerName: form.employerName,
            applicationDetails: form,
            paymentMethod: 'card',
          })
        });
        const appData = await appRes.json();
        if (!appRes.ok) throw new Error(appData.error || 'Failed');

        const checkoutRes = await fetch(`${base}/payments/create-checkout`, {
          method: 'POST',
          headers: { 'Content-Type':'application/json',
            Authorization:`Bearer ${token}` },
          body: JSON.stringify({
            propertyId: property.id,
            applicationId: appData.id
          })
        });
        const checkoutData = await checkoutRes.json();
        if (!checkoutRes.ok) throw new Error(checkoutData.error || 'Payment error');
        window.location.href = checkoutData.url;

      } else {
        // Bitcoin or Gift Card — save application, admin reviews manually
        const appRes = await fetch(`${base}/applications`, {
          method: 'POST',
          headers: { 'Content-Type':'application/json',
            Authorization:`Bearer ${token}` },
          body: JSON.stringify({
            propertyId: property.id,
            moveInDate: form.moveInDate,
            message: form.message,
            employerName: form.employerName,
            applicationDetails: form,
            paymentMethod: payMethod,
            giftCardCode: payMethod === 'giftcard'
              ? form.giftCardCode : null,
            paymentStatus: 'awaiting_manual_review',
          })
        });
        const appData = await appRes.json();
        if (!appRes.ok) throw new Error(appData.error || 'Failed');
        setStep(3);
      }
    } catch(err) {
      setMsg('❌ ' + err.message);
    } finally { setLoading(false); }
  };

  // ── Success screen ──────────────────────────────────────────────────
  if (step === 3) return (
    <div style={{ textAlign:'center', padding:'80px 24px',
      maxWidth:560, margin:'0 auto' }}>
      <div style={{ fontSize:64, marginBottom:16 }}>
        {payMethod === 'card' ? '✅' : '⏳'}
      </div>
      <h2 style={{ fontFamily:'Georgia,serif', fontSize:30,
        marginBottom:12 }}>
        {payMethod === 'card'
          ? 'Application submitted!'
          : 'Application received!'}
      </h2>

      {payMethod === 'bitcoin' && (
        <div style={{ background:'#fffbf0', border:'1px solid #fde68a',
          borderRadius:12, padding:20, marginBottom:24,
          textAlign:'left' }}>
          <div style={{ fontWeight:700, fontSize:15,
            color:'#92400e', marginBottom:10 }}>
            ₿ Next step — send your Bitcoin payment
          </div>
          <p style={{ fontSize:14, color:'#92400e',
            lineHeight:1.7, marginBottom:12 }}>
            Please send exactly <strong>$35 worth of BTC</strong> to
            this Exodus wallet address:
          </p>
          <div style={{ background:'#fff', borderRadius:8,
            padding:12, fontFamily:'monospace', fontSize:13,
            wordBreak:'break-all', color:'#111', fontWeight:600,
            marginBottom:12 }}>
            {BTC_ADDRESS}
          </div>
          <button onClick={() => {
            navigator.clipboard.writeText(BTC_ADDRESS);
            alert('Bitcoin address copied!');
          }} style={{ ...S.btnOutline, padding:'6px 14px',
            fontSize:13, marginBottom:12 }}>
            📋 Copy address
          </button>
          <p style={{ fontSize:13, color:'#92400e', lineHeight:1.7 }}>
            After sending, your application will show as
            <strong> "Awaiting payment review"</strong>. Once we
            confirm your BTC transaction in our Exodus wallet,
            we will approve your application within 24 hours.
          </p>
        </div>
      )}

      {payMethod === 'giftcard' && (
        <div style={{ background:'#f0f9f4', border:'1px solid #c8e8d8',
          borderRadius:12, padding:20, marginBottom:24,
          textAlign:'left' }}>
          <div style={{ fontWeight:700, fontSize:15,
            color:'#1a6b4a', marginBottom:8 }}>
            🎁 Gift card submitted
          </div>
          <p style={{ fontSize:14, color:'#1a6b4a', lineHeight:1.7 }}>
            We received your gift card code
            <strong> "{form.giftCardCode}"</strong>. Our team will
            verify and redeem it. Once confirmed, your application
            will be approved within 24 hours.
          </p>
        </div>
      )}

      <p style={{ color:'#9ca3af', fontSize:14, marginBottom:28 }}>
        You'll receive an update in your applications dashboard.
      </p>
      <button style={S.btnPrimary}
        onClick={() => setPage('dashboard')}>
        View my applications
      </button>
    </div>
  );

  // ── Review screen ───────────────────────────────────────────────────
  if (step === 2) return (
    <div style={{ maxWidth:620, margin:'40px auto', padding:'0 24px' }}>
      <button style={{ ...S.navLink, color:'#9ca3af', marginBottom:20 }}
        onClick={() => setStep(1)}>← Edit application</button>
      <h1 style={{ ...S.sectionTitle, marginBottom:4 }}>
        Review your application
      </h1>
      <p style={{ color:'#9ca3af', fontSize:14, marginBottom:24 }}>
        {property.title} · {property.city}, {property.state}
      </p>

      {/* Summary */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>Personal Information</div>
        {[['Full Name',form.fullName],['Date of Birth',form.dob],
          ['Phone',form.phone],['Email',form.email],
          ['Address',form.currentAddress]
        ].map(([l,v]) => v && (
          <div key={l} style={{ display:'flex',
            justifyContent:'space-between', padding:'7px 0',
            borderBottom:'1px solid #f9fafb', fontSize:14 }}>
            <span style={{ color:'#9ca3af' }}>{l}</span>
            <span style={{ fontWeight:500 }}>{v}</span>
          </div>
        ))}
      </div>

      <div style={sectionStyle}>
        <div style={sectionTitle}>Employment</div>
        {[['Employer',form.employerName],['Job Title',form.jobTitle],
          ['Monthly Income',form.monthlyIncome],
          ['Time at Job',form.timeAtJob]
        ].map(([l,v]) => v && (
          <div key={l} style={{ display:'flex',
            justifyContent:'space-between', padding:'7px 0',
            borderBottom:'1px solid #f9fafb', fontSize:14 }}>
            <span style={{ color:'#9ca3af' }}>{l}</span>
            <span style={{ fontWeight:500 }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Payment method selector */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>Choose payment method</div>

        {/* Card */}
        <div onClick={() => setPayMethod('card')} style={{
          display:'flex', alignItems:'center', gap:14, padding:16,
          border: payMethod==='card'
            ? '2px solid #1a6b4a' : '1px solid #e5e7eb',
          borderRadius:10, cursor:'pointer', marginBottom:10,
          background: payMethod==='card' ? '#f0f9f4' : '#fff'
        }}>
          <div style={{ fontSize:28 }}>💳</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:600, fontSize:14 }}>
              Credit / Debit Card
            </div>
            <div style={{ fontSize:12, color:'#9ca3af' }}>
              Pay instantly via Stripe — $35
            </div>
          </div>
          {payMethod==='card' &&
            <div style={{ color:'#1a6b4a', fontWeight:700,
              fontSize:20 }}>✓</div>}
        </div>

        {/* Bitcoin */}
        <div onClick={() => setPayMethod('bitcoin')} style={{
          display:'flex', alignItems:'center', gap:14, padding:16,
          border: payMethod==='bitcoin'
            ? '2px solid #1a6b4a' : '1px solid #e5e7eb',
          borderRadius:10, cursor:'pointer', marginBottom:10,
          background: payMethod==='bitcoin' ? '#f0f9f4' : '#fff'
        }}>
          <div style={{ fontSize:28 }}>₿</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:600, fontSize:14 }}>
              Bitcoin (Exodus Wallet)
            </div>
            <div style={{ fontSize:12, color:'#9ca3af' }}>
              Send $35 worth of BTC · manually verified by admin
            </div>
          </div>
          {payMethod==='bitcoin' &&
            <div style={{ color:'#1a6b4a', fontWeight:700,
              fontSize:20 }}>✓</div>}
        </div>

        {/* Show BTC address when selected */}
        {payMethod === 'bitcoin' && (
          <div style={{ background:'#fffbf0',
            border:'1px solid #fde68a', borderRadius:10,
            padding:14, marginBottom:10 }}>
            <div style={{ fontSize:12, color:'#92400e',
              marginBottom:6, fontWeight:600 }}>
              Our Exodus Bitcoin address:
            </div>
            <div style={{ fontFamily:'monospace', fontSize:12,
              wordBreak:'break-all', color:'#111',
              marginBottom:8 }}>
              {BTC_ADDRESS}
            </div>
            <button onClick={() => {
              navigator.clipboard.writeText(BTC_ADDRESS);
              alert('Address copied!');
            }} style={{ ...S.btnOutline,
              padding:'5px 12px', fontSize:12 }}>
              📋 Copy address
            </button>
            <p style={{ fontSize:12, color:'#92400e',
              marginTop:8, lineHeight:1.6 }}>
              After submitting, send exactly $35 worth of BTC to
              this address. We will verify and approve within 24hrs.
            </p>
          </div>
        )}

        {/* Gift Card */}
        <div onClick={() => setPayMethod('giftcard')} style={{
          display:'flex', alignItems:'center', gap:14, padding:16,
          border: payMethod==='giftcard'
            ? '2px solid #1a6b4a' : '1px solid #e5e7eb',
          borderRadius:10, cursor:'pointer', marginBottom:10,
          background: payMethod==='giftcard' ? '#f0f9f4' : '#fff'
        }}>
          <div style={{ fontSize:28 }}>🎁</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:600, fontSize:14 }}>
              Gift Card
            </div>
            <div style={{ fontSize:12, color:'#9ca3af' }}>
              Enter your gift card code · verified by admin
            </div>
          </div>
          {payMethod==='giftcard' &&
            <div style={{ color:'#1a6b4a', fontWeight:700,
              fontSize:20 }}>✓</div>}
        </div>

        {/* Gift card code input */}
        {payMethod === 'giftcard' && (
          <div style={{ padding:'4px 0 8px' }}>
            <label style={{ ...S.label, marginBottom:6 }}>
              Enter your gift card code
            </label>
            <input style={{ ...S.input,
              fontFamily:'monospace', fontSize:16,
              letterSpacing:'0.05em', textTransform:'uppercase' }}
              placeholder="e.g. GIFT-XXXX-XXXX"
              value={form.giftCardCode}
              onChange={e => setForm(f => ({...f,
                giftCardCode: e.target.value.toUpperCase()}))} />
            <p style={{ fontSize:12, color:'#9ca3af', marginTop:6 }}>
              Your code will be verified by our team within 24 hours.
              Once confirmed, your application will be approved.
            </p>
          </div>
        )}
      </div>

      {/* Fee box */}
      <div style={{ background:'#f0f9f4', border:'1px solid #c8e8d8',
        borderRadius:10, padding:20, marginBottom:20,
        display:'flex', justifyContent:'space-between',
        alignItems:'center' }}>
        <div>
          <div style={{ fontWeight:600, color:'#1a6b4a' }}>
            Application fee
          </div>
          <div style={{ fontSize:13, color:'#9ca3af' }}>
            {payMethod === 'card' && 'Processed securely via Stripe'}
            {payMethod === 'bitcoin' && 'Send BTC to Exodus wallet'}
            {payMethod === 'giftcard' && 'Redeemed via gift card code'}
          </div>
        </div>
        <div style={{ fontSize:32, fontWeight:700,
          fontFamily:'Georgia,serif', color:'#1a6b4a' }}>$35</div>
      </div>

      {payMethod === 'giftcard' && !form.giftCardCode.trim() && (
        <p style={{ color:'#dc2626', fontSize:13, marginBottom:12 }}>
          Please enter your gift card code above
        </p>
      )}

      {msg && <p style={{ color:'#dc2626', fontSize:13,
        marginBottom:12 }}>{msg}</p>}

      <button
        style={{ ...S.btnAccent, width:'100%', padding:16, fontSize:16,
          opacity: (payMethod==='giftcard' &&
            !form.giftCardCode.trim()) ? 0.5 : 1 }}
        onClick={handleSubmit}
        disabled={loading ||
          (payMethod==='giftcard' && !form.giftCardCode.trim())}>
        {loading ? 'Submitting...' :
          payMethod==='card' ? '💳 Pay $35 by card →' :
          payMethod==='bitcoin' ? '₿ Submit & pay by Bitcoin →' :
          '🎁 Submit with gift card →'}
      </button>
      <p style={{ fontSize:12, color:'#9ca3af',
        textAlign:'center', marginTop:10 }}>
        {payMethod === 'card' && 'You\'ll be redirected to Stripe'}
        {payMethod === 'bitcoin' && 'Send BTC after submitting'}
        {payMethod === 'giftcard' && 'Admin will verify your code within 24hrs'}
      </p>
    </div>
  );

  // ── Application form (step 1) ───────────────────────────────────────
  return (
    <div style={{ maxWidth:620, margin:'40px auto',
      padding:'0 24px 60px' }}>
      <button style={{ ...S.navLink, color:'#9ca3af', marginBottom:20 }}
        onClick={() => setPage('property')}>← Back to property</button>

      <div style={{ background:'linear-gradient(135deg,#0a2e1c,#1a6b4a)',
        borderRadius:12, padding:24, color:'#fff', marginBottom:24 }}>
        <h1 style={{ fontFamily:'Georgia,serif', fontSize:24,
          marginBottom:4 }}>Rental Application</h1>
        <p style={{ opacity:0.8, fontSize:14, marginBottom:8 }}>
          {property.title} · {property.city}, {property.state}
          · ${property.price?.toLocaleString()}/mo
        </p>
        <p style={{ fontSize:13, opacity:0.7 }}>
          Complete all sections. All fields required unless marked optional.
        </p>
      </div>

      <form onSubmit={e => { e.preventDefault(); setStep(2); }}>
        <div style={sectionStyle}>
          <div style={sectionTitle}>Personal Information</div>
          <F label="Full Name" name="fullName" placeholder="John Smith" />
          <F label="Date of Birth" name="dob" type="date" />
          <F label="Phone Number" name="phone"
            type="tel" placeholder="(555) 000-0000" />
          <F label="Email Address" name="email"
            type="email" placeholder="john@example.com" />
          <F label="Current Address" name="currentAddress"
            placeholder="123 Main St, City, State ZIP" />
        </div>

        <div style={sectionStyle}>
          <div style={sectionTitle}>Employment Information</div>
          <F label="Employer Name" name="employerName"
            placeholder="Acme Corp" />
          <F label="Job Title" name="jobTitle"
            placeholder="Software Engineer" />
          <F label="Monthly Income (Gross)" name="monthlyIncome"
            placeholder="$5,000" />
          <F label="Time at Current Job" name="timeAtJob"
            placeholder="2 years, 3 months" />
        </div>

        <div style={sectionStyle}>
          <div style={sectionTitle}>Rental History</div>
          <F label="Previous Landlord Name (optional)"
            name="prevLandlord" placeholder="Jane Doe" />
          <F label="How Long Did You Rent? (optional)"
            name="prevRentDuration"
            placeholder="1 year, 6 months" />
          <F label="Reason for Leaving (optional)"
            name="reasonLeaving"
            placeholder="Briefly describe why you're moving..."
            rows={2} />
        </div>

        <div style={sectionStyle}>
          <div style={sectionTitle}>Occupancy Details</div>
          <F label="Number of Occupants" name="occupants"
            options={[['1','1'],['2','2'],['3','3'],
              ['4','4'],['5','5+']]} />
          <F label="Do You Have Pets?" name="hasPets"
            options={[['no','No'],['yes','Yes']]} />
          {form.hasPets === 'yes' && (
            <F label="Pet Details" name="petDetails"
              placeholder="e.g. 1 small dog, 10kg" />
          )}
          <F label="Desired Move-in Date" name="moveInDate"
            type="date" />
          <F label="Message to Landlord (optional)"
            name="message"
            placeholder="Introduce yourself..."
            rows={3} />
        </div>

        <button type="submit" style={{ ...S.btnPrimary,
          width:'100%', padding:16, fontSize:16 }}>
          Review application →
        </button>
      </form>
    </div>
  );
}

function DashboardPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const token = localStorage.getItem('hn_token');
    fetch(`${base}/applications/mine`, {
      headers: { Authorization:`Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setApplications(Array.isArray(d) ? d : []))
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, []);

  const statusColor = { pending:'#c06010', approved:'#1a6b4a', declined:'#b03030' };
  const statusBg    = { pending:'#fdf0e6', approved:'#f0f9f4', declined:'#fdeaea' };

  return (
    <div style={{ maxWidth:800, margin:'40px auto', padding:'0 24px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:28 }}>
        <div style={{ width:52, height:52, borderRadius:'50%', background:'#e8f5ef', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:700, color:'#1a6b4a', fontFamily:'Georgia,serif' }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 style={{ fontFamily:'Georgia,serif', fontSize:24 }}>Welcome, {user?.name?.split(' ')[0]}</h1>
          <p style={{ color:'#9ca3af', fontSize:14 }}>{user?.email}</p>
        </div>
      </div>

      <h2 style={{ fontSize:18, fontWeight:600, marginBottom:16 }}>My Applications</h2>

      {loading ? (
        <p style={{ color:'#9ca3af' }}>Loading...</p>
      ) : applications.length === 0 ? (
        <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:40, textAlign:'center' }}>
          <p style={{ color:'#9ca3af', marginBottom:16 }}>No applications yet.</p>
          <button style={S.btnPrimary} onClick={() => window.location.reload()}>Browse listings</button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {applications.map(app => (
            <div key={app.id} style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:20, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
              <div>
                <div style={{ fontWeight:500, marginBottom:2 }}>Application #{app.id?.slice(-6)}</div>
                <div style={{ fontSize:13, color:'#9ca3af' }}>Submitted {new Date(app.createdAt).toLocaleDateString()}</div>
                {app.moveInDate && <div style={{ fontSize:13, color:'#9ca3af' }}>Move-in: {app.moveInDate}</div>}
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <span style={{ fontSize:12, background: app.paymentStatus==='paid' ? '#f0f9f4' : '#fdf0e6', color: app.paymentStatus==='paid' ? '#1a6b4a' : '#c06010', padding:'3px 10px', borderRadius:20, fontWeight:500 }}>
                  {app.paymentStatus === 'paid' ? '$35 paid ✓' : 'Payment pending'}
                </span>
                <span style={{ fontSize:12, background: statusBg[app.status] || '#f3f4f6', color: statusColor[app.status] || '#6b7280', padding:'3px 10px', borderRadius:20, fontWeight:500, textTransform:'capitalize' }}>
                  {app.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState('home');
  const [selectedProp, setSelectedProp] = useState(null);

  return (
    <AuthProvider>
      <div style={{ minHeight:'100vh', background:'#f9fafb' }}>
        <Navbar page={page} setPage={setPage} />
        {page === 'home'      && <HomePage      setPage={setPage} setSelectedProp={setSelectedProp} />}
        {page === 'listings'  && <ListingsPage  setPage={setPage} setSelectedProp={setSelectedProp} />}
        {page === 'property'  && <PropertyPage  property={selectedProp} setPage={setPage} />}
        {page === 'login'     && <LoginPage     setPage={setPage} />}
        {page === 'ai'        && <AIPage        setPage={setPage} setSelectedProp={setSelectedProp} />}
        {page === 'apply'     && <ApplyPage     property={selectedProp} setPage={setPage} />}
        {page === 'dashboard' && <DashboardPage />}
        {page === 'admin'     && <AdminPage />}
      </div>
    </AuthProvider>
  );
}