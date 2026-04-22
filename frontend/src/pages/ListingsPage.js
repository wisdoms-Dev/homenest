import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { propertiesAPI } from '../utils/api';
import PropertyCard from '../components/PropertyCard';

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'For rent', value: 'rent' },
  { label: 'For sale', value: 'buy' },
];
const BED_FILTERS = [
  { label: 'Any beds', value: '' },
  { label: 'Studio', value: '0' },
  { label: '1 bed', value: '1' },
  { label: '2 beds', value: '2' },
  { label: '3+ beds', value: '3' },
];

export default function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [beds, setBeds] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (type) params.type = type;
      if (beds) params.beds = beds;
      if (city) params.city = city;
      if (maxPrice) params.maxPrice = maxPrice;
      const res = await propertiesAPI.list(params);
      setProperties(res.data.properties || []);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [type, beds, city, maxPrice]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  return (
    <div className="page-section">
      <h1 className="section-heading">Browse all properties</h1>

      {/* Filters */}
      <div className="listings-filters">
        <input
          type="text" placeholder="Search city or state..."
          value={city} onChange={e => setCity(e.target.value)}
          style={{ padding: '9px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, minWidth: 200 }}
        />
        <div className="filter-chips">
          {FILTERS.map(f => (
            <button key={f.value} className={`filter-chip ${type === f.value ? 'active' : ''}`}
              onClick={() => setType(f.value)}>{f.label}</button>
          ))}
        </div>
        <div className="filter-chips">
          {BED_FILTERS.map(f => (
            <button key={f.value} className={`filter-chip ${beds === f.value ? 'active' : ''}`}
              onClick={() => setBeds(f.value)}>{f.label}</button>
          ))}
        </div>
        <select
          value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
          style={{ padding: '9px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}
        >
          <option value="">Any price</option>
          <option value="1500">Under $1,500/mo</option>
          <option value="2500">Under $2,500/mo</option>
          <option value="3500">Under $3,500/mo</option>
          <option value="300000">Under $300k</option>
          <option value="500000">Under $500k</option>
        </select>
      </div>

      {/* Results */}
      {loading ? (
        <div className="loading-screen">Finding properties...</div>
      ) : properties.length === 0 ? (
        <div className="loading-screen">No properties found. Try adjusting your filters.</div>
      ) : (
        <>
          <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 20 }}>{properties.length} properties found</p>
          <div className="properties-grid">
            {properties.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        </>
      )}

      <style>{`
        .listings-filters { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-bottom: 28px; }
        .filter-chips { display: flex; gap: 8px; flex-wrap: wrap; }
        .filter-chip { padding: 7px 16px; border-radius: 20px; border: 1px solid #e5e7eb; font-size: 13px; cursor: pointer; background: #fff; color: #4b5563; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .filter-chip.active { background: #1a6b4a; color: #fff; border-color: #1a6b4a; }
      `}</style>
    </div>
  );
}