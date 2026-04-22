import React, { useState } from 'react';
import PropertyCard from '../components/PropertyCard';
import { propertiesAPI } from '../utils/api';

export default function AIMatchPage() {
  const [form, setForm] = useState({ type: 'rent', beds: '', maxBudget: '', location: '', mustHave: '', lifestyle: '' });
  const [results, setResults] = useState([]);
  const [aiSummary, setAiSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleMatch = async e => {
    e.preventDefault();
    setLoading(true);
    setResults([]);
    setAiSummary('');

    try {
      // Fetch properties from backend
      const params = {};
      if (form.type) params.type = form.type;
      if (form.beds) params.beds = form.beds;
      if (form.maxBudget) params.maxPrice = form.maxBudget;
      if (form.location) params.city = form.location;
      const propRes = await propertiesAPI.list(params);
      const properties = propRes.data.properties || [];

      // Call Claude AI for recommendations
      const prompt = `You are a helpful HomeNest real estate assistant. A user is looking for a home with these preferences:
- Type: ${form.type === 'rent' ? 'For rent' : 'For sale'}
- Bedrooms: ${form.beds || 'Any'}
- Max budget: ${form.maxBudget ? '$' + parseInt(form.maxBudget).toLocaleString() : 'Not specified'}
- Location: ${form.location || 'Anywhere in the U.S.'}
- Must-haves: ${form.mustHave || 'None specified'}
- Lifestyle notes: ${form.lifestyle || 'None specified'}

Here are the available listings (JSON):
${JSON.stringify(properties.slice(0, 10).map(p => ({ id: p.id, title: p.title, city: p.city, state: p.state, price: p.price, type: p.type, beds: p.beds, baths: p.baths, sqft: p.sqft, amenities: p.amenities })), null, 2)}

Based on the user's preferences, write a short, friendly 2-3 sentence recommendation explaining which properties are the best matches and why. Keep it conversational and helpful.`;

      const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const aiData = await aiRes.json();
      const summary = aiData.content?.find(b => b.type === 'text')?.text || '';
      setAiSummary(summary);
      setResults(properties.slice(0, 6));
    } catch (err) {
      setAiSummary('Unable to load AI recommendations right now. Here are some properties that match your search:');
      try {
        const fallback = await propertiesAPI.list({ type: form.type });
        setResults(fallback.data.properties?.slice(0, 6) || []);
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 34, marginBottom: 8 }}>AI Home Matching</h1>
        <p style={{ color: '#9ca3af', fontSize: 15 }}>Tell us what you're looking for and our AI will find your best matches</p>
      </div>

      <div className="card" style={{ marginBottom: 32 }}>
        <form onSubmit={handleMatch}>
          <div className="form-grid">
            <div className="form-group">
              <label>I'm looking to</label>
              <select name="type" value={form.type} onChange={handleChange}>
                <option value="rent">Rent a home</option>
                <option value="buy">Buy a home</option>
              </select>
            </div>
            <div className="form-group">
              <label>Bedrooms needed</label>
              <select name="beds" value={form.beds} onChange={handleChange}>
                <option value="">Any</option>
                <option value="0">Studio</option>
                <option value="1">1 bedroom</option>
                <option value="2">2 bedrooms</option>
                <option value="3">3+ bedrooms</option>
              </select>
            </div>
            <div className="form-group">
              <label>Max {form.type === 'rent' ? 'monthly' : 'purchase'} budget ($)</label>
              <input type="number" name="maxBudget" placeholder={form.type === 'rent' ? '3000' : '500000'} value={form.maxBudget} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Preferred location</label>
              <input type="text" name="location" placeholder="e.g. Austin, TX or Miami" value={form.location} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Must-have features (e.g. pet-friendly, parking, in-unit laundry)</label>
            <input type="text" name="mustHave" placeholder="e.g. pet-friendly, gym, parking" value={form.mustHave} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Tell us about your lifestyle (optional)</label>
            <textarea name="lifestyle" rows={3} placeholder="e.g. I work from home and need a quiet neighborhood, close to parks..." value={form.lifestyle} onChange={handleChange} style={{ resize: 'vertical' }} />
          </div>
          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
            {loading ? 'Finding your best matches...' : 'Find my perfect home with AI'}
          </button>
        </form>
      </div>

      {aiSummary && (
        <div style={{ background: '#f0f9f4', border: '1px solid #c8e8d8', borderRadius: 12, padding: 20, marginBottom: 28 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ background: '#1a6b4a', color: '#fff', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>AI</div>
            <p style={{ fontSize: 15, color: '#1a4a35', lineHeight: 1.7 }}>{aiSummary}</p>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, marginBottom: 20 }}>Your AI-matched properties</h2>
          <div className="properties-grid">
            {results.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        </>
      )}
    </div>
  );
}