import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { propertiesAPI } from '../utils/api';
import PropertyCard from '../components/PropertyCard';
import './HomePage.css';

// Fallback listings shown when backend is offline
// FIX: was referenced as both DEMO_PROPERTIES and DEMOS — unified to DEMOS
const DEMOS = [
  { id: '1', title: 'Modern 2BR Apartment', address: '123 Main St', city: 'Austin', state: 'TX', price: 2100, type: 'rent', beds: 2, baths: 1, sqft: 980, images: ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80'] },
  { id: '2', title: 'Charming 3BR House',   address: '456 Oak Ave', city: 'Miami',  state: 'FL', price: 3400, type: 'rent', beds: 3, baths: 2, sqft: 1450, images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80'] },
  { id: '3', title: 'Studio in NYC',        address: '789 Park Blvd', city: 'New York', state: 'NY', price: 2800, type: 'rent', beds: 0, baths: 1, sqft: 480, images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80'] },
  { id: '4', title: 'Spacious Family Home', address: '321 Elm St', city: 'Dallas', state: 'TX', price: 385000, type: 'buy', beds: 4, baths: 3, sqft: 2800, images: ['https://images.unsplash.com/photo-1506974210756-8e1b8985d348?w=600&q=80'] },
];

const STATS = [
  { num: '12,400+', label: 'Active listings' },
  { num: '48 states', label: 'Coverage' },
  { num: '$35', label: 'Application fee' },
  { num: '24/7', label: 'Support' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState(DEMOS);
  const [search, setSearch]     = useState('');
  const [type, setType]         = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const base = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    fetch(`${base}/properties?limit=4`)
      .then(r => r.json())
      .then(d => {
        const props = d.properties || [];
        // FIX: was referencing undefined DEMOS — now correctly uses the const above
        setFeatured(props.length > 0 ? props : DEMOS.slice(0, 4));
      })
      .catch(() => setFeatured(DEMOS.slice(0, 4)));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/listings?city=${search}&type=${type}`);
  };

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <p className="hero-eyebrow">The smarter way to find a home</p>
          <h1 className="hero-title">Rent or buy your<br />perfect U.S. home</h1>
          <p className="hero-sub">
            Browse verified listings, apply online, and move in —
            all with a simple $35 application fee
          </p>
          <form className="search-bar" onSubmit={handleSearch}>
            <select value={type} onChange={e => setType(e.target.value)}>
              <option value="">All types</option>
              <option value="rent">For rent</option>
              <option value="buy">For sale</option>
            </select>
            <input
              type="text"
              placeholder="City, state or ZIP code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Search homes</button>
          </form>
          <div className="hero-stats">
            {STATS.map(s => (
              <div key={s.label} className="hero-stat">
                <span className="hero-stat-num">{s.num}</span>
                <span className="hero-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured listings */}
      <section className="page-section">
        <h2 className="section-heading">Featured listings</h2>
        <p className="section-sub">Hand-picked properties across the United States</p>
        <div className="properties-grid">
          {/* FIX: was calling setSelectedProp/setPage which don't exist.
              Now uses PropertyCard (shared component) with Link navigation. */}
          {featured.map(p => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link to="/listings" className="btn btn-outline btn-lg">View all listings</Link>
        </div>
      </section>

      {/* AI match banner */}
      <section className="ai-banner">
        <div className="ai-banner-inner">
          <div>
            <h2>Let AI find your perfect home</h2>
            <p>Tell us your preferences and our AI will match you with the best listings</p>
          </div>
          {/* FIX: was /ai-match which is correct — matches the route in App.js */}
          <Link to="/ai-match" className="btn btn-accent btn-lg">Try AI Match</Link>
        </div>
      </section>

      {/* How it works */}
      <section className="page-section">
        <h2 className="section-heading" style={{ textAlign: 'center' }}>How HomeNest works</h2>
        <p className="section-sub" style={{ textAlign: 'center' }}>Three simple steps to your new home</p>
        <div className="steps-grid">
          {[
            { n: '01', title: 'Browse listings', desc: 'Search thousands of verified rental and purchase listings across 48 U.S. states.' },
            { n: '02', title: 'Apply online',    desc: 'Submit your application with a one-time $35 fee — processed securely via Stripe.' },
            { n: '03', title: 'Move in',         desc: 'Get approved fast and coordinate your move-in directly with the property manager.' },
          ].map(s => (
            <div key={s.n} className="step-card">
              <div className="step-num">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}