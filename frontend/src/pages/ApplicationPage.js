import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { propertiesAPI, applicationsAPI, paymentsAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';

const BTC_ADDRESS = 'bc1q6s678gzwp2ux5j7eymn7trvevl5f5e9l2k5ahx';

const S = {
  input: { width:'100%', padding:'10px 13px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:14, outline:'none', fontFamily:'inherit', boxSizing:'border-box' },
  label: { display:'block', fontSize:13, fontWeight:500, color:'#6b7280', marginBottom:5 },
  fg: { marginBottom:16 },
  section: { background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:24, marginBottom:20 },
  sectionTitle: { fontSize:18, fontWeight:700, fontFamily:'Georgia,serif', marginBottom:16, paddingBottom:12, borderBottom:'1px solid #f3f4f6' },
  btnPrimary: { padding:'12px 28px', background:'#1a6b4a', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:15, fontFamily:'inherit', width:'100%' },
  btnAccent: { padding:'12px 28px', background:'#e07b39', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:15, fontFamily:'inherit', width:'100%' },
  btnOutline: { padding:'10px 20px', background:'transparent', border:'1px solid #e5e7eb', borderRadius:8, cursor:'pointer', fontFamily:'inherit', fontSize:14 },
};

function Field({ label, name, type='text', placeholder='', options=null, rows=0, value, onChange, required=false }) {
  return (
    <div style={S.fg}>
      <label style={S.label}>{label}</label>
      {options ? (
        <select style={S.input} value={value} onChange={e => onChange(name, e.target.value)}>
          {options.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      ) : rows > 0 ? (
        <textarea style={{...S.input, height:rows*40, resize:'vertical'}} placeholder={placeholder} value={value} onChange={e => onChange(name, e.target.value)} required={required}/>
      ) : (
        <input style={S.input} type={type} placeholder={placeholder} value={value} onChange={e => onChange(name, e.target.value)} required={required}/>
      )}
    </div>
  );
}

export default function ApplicationPage() {
  const { propertyId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1=form, 2=review+payment, 3=success
  const [payMethod, setPayMethod] = useState('card');
  const [form, setForm] = useState({
    fullName: user?.name || '',
    dob: '', phone: '',
    email: user?.email || '',
    currentAddress: '',
    employerName: '', jobTitle: '', monthlyIncome: '', timeAtJob: '',
    prevLandlord: '', prevRentDuration: '', reasonLeaving: '',
    occupants: '1', hasPets: 'no', petDetails: '', moveInDate: '', message: '',
    giftCardCode: '',
  });

  useEffect(() => {
    propertiesAPI.get(propertyId)
      .then(res => setProperty(res.data))
      .catch(() => navigate('/listings'))
      .finally(() => setLoading(false));
  }, [propertyId, navigate]);

  const set = (name, value) => setForm(f => ({ ...f, [name]: value }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (payMethod === 'card') {
        const appRes = await applicationsAPI.submit({
          propertyId,
          moveInDate: form.moveInDate,
          message: form.message,
          employerName: form.employerName,
          applicationDetails: form,
          paymentMethod: 'card',
          paymentStatus: 'pending',
        });
        const checkoutRes = await paymentsAPI.createCheckout({
          propertyId,
          applicationId: appRes.data.id,
        });
        window.location.href = checkoutRes.data.url;
      } else {
        await applicationsAPI.submit({
          propertyId,
          moveInDate: form.moveInDate,
          message: form.message,
          employerName: form.employerName,
          applicationDetails: form,
          paymentMethod: payMethod,
          giftCardCode: payMethod === 'giftcard' ? form.giftCardCode : null,
          paymentStatus: 'awaiting_manual_review',
        });
        setStep(3);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>Loading...</div>;
  if (!property) return null;

  // ── Success screen ──────────────────────────────────────────────────
  if (step === 3) return (
    <div style={{ textAlign:'center', padding:'80px 24px', maxWidth:560, margin:'0 auto' }}>
      <div style={{ fontSize:64, marginBottom:16 }}>⏳</div>
      <h2 style={{ fontFamily:'Georgia,serif', fontSize:30, marginBottom:12 }}>Application received!</h2>

      {payMethod === 'bitcoin' && (
        <div style={{ background:'#fffbf0', border:'1px solid #fde68a', borderRadius:12, padding:20, marginBottom:24, textAlign:'left' }}>
          <div style={{ fontWeight:700, fontSize:15, color:'#92400e', marginBottom:10 }}>₿ Send your Bitcoin payment</div>
          <p style={{ fontSize:14, color:'#92400e', lineHeight:1.7, marginBottom:12 }}>
            Please send exactly <strong>$35 worth of BTC</strong> to this address:
          </p>
          <div style={{ background:'#fff', borderRadius:8, padding:12, fontFamily:'monospace', fontSize:13, wordBreak:'break-all', color:'#111', fontWeight:600, marginBottom:12 }}>
            {BTC_ADDRESS}
          </div>
          <button onClick={() => { navigator.clipboard.writeText(BTC_ADDRESS); toast.success('Copied!'); }}
            style={{ ...S.btnOutline, padding:'6px 14px', fontSize:13 }}>
            📋 Copy address
          </button>
          <p style={{ fontSize:13, color:'#92400e', lineHeight:1.7, marginTop:12 }}>
            Your application will be approved within 24 hours after we confirm your BTC transaction.
          </p>
        </div>
      )}

      {payMethod === 'giftcard' && (
        <div style={{ background:'#f0f9f4', border:'1px solid #c8e8d8', borderRadius:12, padding:20, marginBottom:24, textAlign:'left' }}>
          <div style={{ fontWeight:700, fontSize:15, color:'#1a6b4a', marginBottom:8 }}>🎁 Gift card submitted</div>
          <p style={{ fontSize:14, color:'#1a6b4a', lineHeight:1.7 }}>
            We received your code <strong>"{form.giftCardCode}"</strong>. Our team will verify and approve within 24 hours.
          </p>
        </div>
      )}

      <p style={{ color:'#9ca3af', fontSize:14, marginBottom:28 }}>
        You'll receive an update in your applications dashboard.
      </p>
      <button style={{ ...S.btnPrimary, width:'auto', padding:'12px 28px' }} onClick={() => navigate('/dashboard')}>
        View my applications
      </button>
    </div>
  );

  // ── Review + Payment screen ─────────────────────────────────────────
  if (step === 2) return (
    <div style={{ maxWidth:620, margin:'40px auto', padding:'0 24px 60px' }}>
      <button style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af', fontSize:14, marginBottom:20, fontFamily:'inherit' }} onClick={() => setStep(1)}>
        ← Edit application
      </button>
      <h1 style={{ fontFamily:'Georgia,serif', fontSize:26, marginBottom:4 }}>Review your application</h1>
      <p style={{ color:'#9ca3af', fontSize:14, marginBottom:24 }}>{property.title} · {property.city}, {property.state}</p>

      {/* Summary */}
      <div style={S.section}>
        <div style={S.sectionTitle}>Personal Information</div>
        {[['Full Name',form.fullName],['Date of Birth',form.dob],['Phone',form.phone],['Email',form.email],['Address',form.currentAddress]].map(([l,v]) => v ? (
          <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid #f9fafb', fontSize:14 }}>
            <span style={{ color:'#9ca3af' }}>{l}</span>
            <span style={{ fontWeight:500 }}>{v}</span>
          </div>
        ) : null)}
      </div>

      <div style={S.section}>
        <div style={S.sectionTitle}>Employment</div>
        {[['Employer',form.employerName],['Job Title',form.jobTitle],['Monthly Income',form.monthlyIncome],['Time at Job',form.timeAtJob]].map(([l,v]) => v ? (
          <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid #f9fafb', fontSize:14 }}>
            <span style={{ color:'#9ca3af' }}>{l}</span>
            <span style={{ fontWeight:500 }}>{v}</span>
          </div>
        ) : null)}
      </div>

      {/* Payment method */}
      <div style={S.section}>
        <div style={S.sectionTitle}>Choose payment method</div>

        {/* Card */}
        {[
          ['card', '💳', 'Credit / Debit Card', 'Pay instantly via Stripe — $35'],
          ['bitcoin', '₿', 'Bitcoin (Exodus Wallet)', 'Send $35 worth of BTC · verified by admin'],
          ['giftcard', '🎁', 'Gift Card', 'Enter your gift card code · verified by admin'],
        ].map(([method, icon, title, sub]) => (
          <div key={method} onClick={() => setPayMethod(method)} style={{
            display:'flex', alignItems:'center', gap:14, padding:16,
            border: payMethod===method ? '2px solid #1a6b4a' : '1px solid #e5e7eb',
            borderRadius:10, cursor:'pointer', marginBottom:10,
            background: payMethod===method ? '#f0f9f4' : '#fff'
          }}>
            <div style={{ fontSize:26 }}>{icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, fontSize:14 }}>{title}</div>
              <div style={{ fontSize:12, color:'#9ca3af' }}>{sub}</div>
            </div>
            {payMethod===method && <div style={{ color:'#1a6b4a', fontWeight:700, fontSize:20 }}>✓</div>}
          </div>
        ))}

        {payMethod === 'bitcoin' && (
          <div style={{ background:'#fffbf0', border:'1px solid #fde68a', borderRadius:10, padding:14, marginBottom:10 }}>
            <div style={{ fontSize:12, color:'#92400e', marginBottom:6, fontWeight:600 }}>Our Exodus Bitcoin address:</div>
            <div style={{ fontFamily:'monospace', fontSize:12, wordBreak:'break-all', color:'#111', marginBottom:8 }}>{BTC_ADDRESS}</div>
            <button onClick={() => { navigator.clipboard.writeText(BTC_ADDRESS); toast.success('Copied!'); }}
              style={{ ...S.btnOutline, padding:'5px 12px', fontSize:12 }}>📋 Copy address</button>
            <p style={{ fontSize:12, color:'#92400e', marginTop:8, lineHeight:1.6 }}>
              After submitting, send exactly $35 worth of BTC. We'll verify and approve within 24hrs.
            </p>
          </div>
        )}

        {payMethod === 'giftcard' && (
          <div style={{ padding:'4px 0 8px' }}>
            <label style={{ ...S.label, marginBottom:6 }}>Enter your gift card code</label>
            <input style={{ ...S.input, fontFamily:'monospace', fontSize:16, letterSpacing:'0.05em', textTransform:'uppercase' }}
              placeholder="e.g. GIFT-XXXX-XXXX"
              value={form.giftCardCode}
              onChange={e => set('giftCardCode', e.target.value.toUpperCase())} />
            <p style={{ fontSize:12, color:'#9ca3af', marginTop:6 }}>
              Your code will be verified by our team within 24 hours.
            </p>
          </div>
        )}
      </div>

      {/* Fee box */}
      <div style={{ background:'#f0f9f4', border:'1px solid #c8e8d8', borderRadius:10, padding:20, marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontWeight:600, color:'#1a6b4a' }}>Application fee</div>
          <div style={{ fontSize:13, color:'#9ca3af' }}>
            {payMethod==='card' && 'Processed securely via Stripe'}
            {payMethod==='bitcoin' && 'Send BTC to Exodus wallet'}
            {payMethod==='giftcard' && 'Redeemed via gift card code'}
          </div>
        </div>
        <div style={{ fontSize:32, fontWeight:700, fontFamily:'Georgia,serif', color:'#1a6b4a' }}>$35</div>
      </div>

      {payMethod==='giftcard' && !form.giftCardCode.trim() && (
        <p style={{ color:'#dc2626', fontSize:13, marginBottom:12 }}>Please enter your gift card code above</p>
      )}

      <button
        style={{ ...S.btnAccent, opacity:(payMethod==='giftcard' && !form.giftCardCode.trim()) ? 0.5 : 1 }}
        onClick={handleSubmit}
        disabled={submitting || (payMethod==='giftcard' && !form.giftCardCode.trim())}>
        {submitting ? 'Submitting...' :
          payMethod==='card' ? '💳 Pay $35 by card →' :
          payMethod==='bitcoin' ? '₿ Submit & pay by Bitcoin →' :
          '🎁 Submit with gift card →'}
      </button>
      <p style={{ fontSize:12, color:'#9ca3af', textAlign:'center', marginTop:10 }}>
        {payMethod==='card' && "You'll be redirected to Stripe"}
        {payMethod==='bitcoin' && 'Send BTC after submitting'}
        {payMethod==='giftcard' && 'Admin will verify your code within 24hrs'}
      </p>
    </div>
  );

  // ── Step 1: Full application form ───────────────────────────────────
  return (
    <div style={{ maxWidth:620, margin:'40px auto', padding:'0 24px 60px' }}>
      <Link to={`/properties/${propertyId}`} style={{ color:'#9ca3af', fontSize:14, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:6, marginBottom:20 }}>
        ← Back to property
      </Link>

      <div style={{ background:'linear-gradient(135deg,#0a2e1c,#1a6b4a)', borderRadius:12, padding:24, color:'#fff', marginBottom:24 }}>
        <h1 style={{ fontFamily:'Georgia,serif', fontSize:24, marginBottom:4 }}>Rental Application</h1>
        <p style={{ opacity:0.8, fontSize:14, marginBottom:4 }}>
          {property.title} · {property.city}, {property.state} · ${property.price?.toLocaleString()}/mo
        </p>
        <p style={{ fontSize:13, opacity:0.7 }}>Complete all sections before reviewing your application.</p>
      </div>

      <form onSubmit={e => { e.preventDefault(); setStep(2); }}>
        <div style={S.section}>
          <div style={S.sectionTitle}>Personal Information</div>
          <Field label="Full Name" name="fullName" placeholder="John Smith" value={form.fullName} onChange={set} required />
          <Field label="Date of Birth" name="dob" type="date" value={form.dob} onChange={set} required />
          <Field label="Phone Number" name="phone" type="tel" placeholder="(555) 000-0000" value={form.phone} onChange={set} required />
          <Field label="Email Address" name="email" type="email" placeholder="john@example.com" value={form.email} onChange={set} required />
          <Field label="Current Address" name="currentAddress" placeholder="123 Main St, City, State ZIP" value={form.currentAddress} onChange={set} required />
        </div>

        <div style={S.section}>
          <div style={S.sectionTitle}>Employment Information</div>
          <Field label="Employer Name" name="employerName" placeholder="Acme Corp" value={form.employerName} onChange={set} />
          <Field label="Job Title" name="jobTitle" placeholder="Software Engineer" value={form.jobTitle} onChange={set} />
          <Field label="Monthly Income (Gross)" name="monthlyIncome" placeholder="$5,000" value={form.monthlyIncome} onChange={set} />
          <Field label="Time at Current Job" name="timeAtJob" placeholder="2 years, 3 months" value={form.timeAtJob} onChange={set} />
        </div>

        <div style={S.section}>
          <div style={S.sectionTitle}>Rental History</div>
          <Field label="Previous Landlord Name (optional)" name="prevLandlord" placeholder="Jane Doe" value={form.prevLandlord} onChange={set} />
          <Field label="How Long Did You Rent? (optional)" name="prevRentDuration" placeholder="1 year, 6 months" value={form.prevRentDuration} onChange={set} />
          <Field label="Reason for Leaving (optional)" name="reasonLeaving" placeholder="Briefly describe why you're moving..." rows={2} value={form.reasonLeaving} onChange={set} />
        </div>

        <div style={S.section}>
          <div style={S.sectionTitle}>Occupancy Details</div>
          <Field label="Number of Occupants" name="occupants" options={[['1','1'],['2','2'],['3','3'],['4','4'],['5','5+']]} value={form.occupants} onChange={set} />
          <Field label="Do You Have Pets?" name="hasPets" options={[['no','No'],['yes','Yes']]} value={form.hasPets} onChange={set} />
          {form.hasPets === 'yes' && (
            <Field label="Pet Details" name="petDetails" placeholder="e.g. 1 small dog, 10kg" value={form.petDetails} onChange={set} />
          )}
          <Field label="Desired Move-in Date" name="moveInDate" type="date" value={form.moveInDate} onChange={set} />
          <Field label="Message to Landlord (optional)" name="message" placeholder="Introduce yourself..." rows={3} value={form.message} onChange={set} />
        </div>

        <button type="submit" style={S.btnPrimary}>
          Review application →
        </button>
      </form>
    </div>
  );
}