import React, { useState, useEffect } from 'react';
import { propertiesAPI, applicationsAPI } from '../utils/api';
import toast from 'react-hot-toast';

const CLOUDINARY_CLOUD = 'dus3aeb5i';
const CLOUDINARY_PRESET = 'homenest_uploads';

async function uploadToCloudinary(file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_PRESET);
  formData.append('folder', 'properties');
  const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/${resourceType}/upload`;
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      const data = JSON.parse(xhr.responseText);
      if (xhr.status === 200) resolve(data.secure_url);
      else reject(new Error(data.error?.message || 'Upload failed'));
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(formData);
  });
}

const inp = { width:'100%', padding:'10px 13px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' };
const lbl = { display:'block', fontSize:13, fontWeight:500, color:'#6b7280', marginBottom:5 };
const fg  = { marginBottom:16 };

export default function AdminPage() {
  const [tab, setTab]                     = useState('dashboard');
  const [properties, setProperties]       = useState([]);
  const [applications, setApplications]   = useState([]);
  const [selectedApp, setSelectedApp]     = useState(null);
  const [saving, setSaving]               = useState(false);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [form, setForm] = useState({
    title:'', address:'', city:'', state:'', zip:'',
    price:'', type:'rent', beds:'', baths:'', sqft:'', description:'',
  });

  useEffect(() => {
    if (tab === 'properties')   loadProperties();
    if (tab === 'applications') loadApplications();
  }, [tab]);

  const loadProperties = async () => {
    try { const r = await propertiesAPI.list({ limit:50 }); setProperties(r.data.properties || []); }
    catch { setProperties([]); }
  };
  const loadApplications = async () => {
    try { const r = await applicationsAPI.all(); setApplications(Array.isArray(r.data) ? r.data : []); }
    catch { setApplications([]); }
  };

  const handleMediaFiles = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setMediaPreviews(prev => [...prev, ...files.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image',
      file,
    }))]);
  };

  const removeMedia = (i) => {
    setMediaPreviews(p => p.filter((_,idx) => idx !== i));
    setUploadProgress(prev => { const n = {...prev}; delete n[i]; return n; });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.address || !form.city || !form.state) {
      toast.error('Please fill all required fields'); return;
    }
    setSaving(true);
    try {
      const imageUrls = [], videoUrls = [];
      for (let i = 0; i < mediaPreviews.length; i++) {
        const { file, type } = mediaPreviews[i];
        toast.loading(`Uploading ${type} ${i+1} of ${mediaPreviews.length}...`, { id:'upload' });
        const url = await uploadToCloudinary(file, pct =>
          setUploadProgress(prev => ({ ...prev, [i]: pct }))
        );
        if (type === 'video') videoUrls.push(url);
        else imageUrls.push(url);
      }
      toast.dismiss('upload');
      await propertiesAPI.create({
        ...form,
        price: parseInt(form.price), beds: parseInt(form.beds)||0,
        baths: parseInt(form.baths)||0, sqft: parseInt(form.sqft)||0,
        images: imageUrls, videos: videoUrls, active: true,
      });
      toast.success('Property added!');
      setForm({ title:'',address:'',city:'',state:'',zip:'',price:'',type:'rent',beds:'',baths:'',sqft:'',description:'' });
      setMediaPreviews([]); setUploadProgress({});
      setTab('properties');
    } catch(err) {
      toast.error(err.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this listing?')) return;
    try { await propertiesAPI.delete(id); setProperties(p => p.filter(x => x.id !== id)); toast.success('Removed'); }
    catch { toast.error('Failed to delete'); }
  };

  const updateStatus = async (id, status) => {
    try {
      await applicationsAPI.updateStatus(id, status);
      setApplications(a => a.map(x => x.id===id ? {...x,status} : x));
      if (selectedApp?.id === id) setSelectedApp(s => ({...s, status}));
      toast.success(`Application ${status}`);
    } catch { toast.error('Failed to update'); }
  };

  const tabs = [['dashboard','Dashboard'],['properties','Properties'],['add','+ Add Property'],['applications','Applications']];

  return (
    <div style={{ maxWidth:1000, margin:'0 auto', padding:'32px 24px' }}>
      <h1 style={{ fontFamily:'Georgia,serif', fontSize:26, marginBottom:24 }}>Admin Dashboard</h1>

      <div style={{ display:'flex', gap:4, borderBottom:'2px solid #e5e7eb', marginBottom:28, flexWrap:'wrap' }}>
        {tabs.map(([t,l]) => (
          <button key={t} onClick={() => { setTab(t); setSelectedApp(null); }}
            style={{ padding:'10px 18px', background:'none', border:'none', cursor:'pointer', fontSize:14,
              fontWeight:500, fontFamily:'inherit', color:tab===t?'#1a6b4a':'#9ca3af',
              borderBottom:tab===t?'3px solid #1a6b4a':'3px solid transparent', marginBottom:-2 }}>
            {l}
          </button>
        ))}
      </div>

      {/* DASHBOARD */}
      {tab === 'dashboard' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14 }}>
          {[
            ['Total listings', properties.length||'—'],
            ['Applications', applications.length||'—'],
            ['Awaiting review', applications.filter(a=>a.paymentStatus==='awaiting_manual_review').length],
            ['Approved', applications.filter(a=>a.status==='approved').length],
          ].map(([l,v]) => (
            <div key={l} style={{ background:'#f9fafb', borderRadius:10, padding:'16px 18px' }}>
              <div style={{ fontSize:12, color:'#9ca3af', marginBottom:4 }}>{l}</div>
              <div style={{ fontSize:24, fontWeight:700, fontFamily:'Georgia,serif' }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      {/* PROPERTIES */}
      {tab === 'properties' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <p style={{ color:'#9ca3af', fontSize:14 }}>{properties.length} listings</p>
            <button onClick={() => setTab('add')}
              style={{ padding:'9px 20px', background:'#1a6b4a', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontFamily:'inherit', fontSize:14 }}>
              + Add property
            </button>
          </div>
          {/* FIX: wrap grid in a max-width container so a single card doesn't stretch full width */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,320px))', gap:20 }}>
            {properties.map(p => (
              <div key={p.id} style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, overflow:'hidden', width:'100%' }}>
                <div style={{ position:'relative', height:180, background:'#f3f4f6', overflow:'hidden' }}>
                  {p.images?.length > 0 ? (
                    <>
                      <img src={p.images[0]} alt={p.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      {(p.images.length > 1 || p.videos?.length > 0) && (
                        <div style={{ position:'absolute', bottom:8, right:8, background:'rgba(0,0,0,0.6)', color:'#fff', padding:'2px 8px', borderRadius:20, fontSize:12 }}>
                          {p.images.length > 1 && `+${p.images.length-1} photos`}
                          {p.videos?.length > 0 && ` · ${p.videos.length} video${p.videos.length>1?'s':''}`}
                        </div>
                      )}
                    </>
                  ) : p.videos?.length > 0 ? (
                    <video src={p.videos[0]} style={{ width:'100%', height:'100%', objectFit:'cover' }} muted />
                  ) : (
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#9ca3af', fontSize:13 }}>No media</div>
                  )}
                </div>
                <div style={{ padding:14 }}>
                  <div style={{ fontSize:18, fontWeight:700, color:'#1a6b4a', fontFamily:'Georgia,serif' }}>
                    ${p.price?.toLocaleString()}{p.type==='rent'?'/mo':''}
                  </div>
                  <div style={{ fontSize:13, color:'#9ca3af', margin:'4px 0 8px' }}>{p.address}, {p.city}, {p.state}</div>
                  <div style={{ fontSize:13, color:'#6b7280', display:'flex', gap:12 }}>
                    <span>{p.beds>0?`${p.beds} bd`:'Studio'}</span>
                    <span>{p.baths} ba</span>
                    <span>{p.sqft?.toLocaleString()} sqft</span>
                  </div>
                  <button onClick={() => handleDelete(p.id)}
                    style={{ marginTop:10, padding:'5px 14px', background:'#fdeaea', color:'#b03030', border:'none', borderRadius:6, cursor:'pointer', fontSize:13, fontFamily:'inherit' }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD PROPERTY */}
      {tab === 'add' && (
        <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:28, maxWidth:680 }}>
          <h2 style={{ fontSize:20, marginBottom:20 }}>Add new property</h2>
          <form onSubmit={handleSave}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div style={{ gridColumn:'1/-1', ...fg }}>
                <label style={lbl}>Property title *</label>
                <input style={inp} placeholder="e.g. Modern 2BR Apartment" value={form.title} required
                  onChange={e => setForm(f=>({...f,title:e.target.value}))} />
              </div>
              <div style={fg}>
                <label style={lbl}>Type</label>
                <select style={inp} value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))}>
                  <option value="rent">For rent</option>
                  <option value="buy">For sale</option>
                </select>
              </div>
              <div style={fg}>
                <label style={lbl}>Price ($) *</label>
                <input style={inp} type="number" placeholder="2000" value={form.price} required
                  onChange={e => setForm(f=>({...f,price:e.target.value}))} />
              </div>
              <div style={{ gridColumn:'1/-1', ...fg }}>
                <label style={lbl}>Street address *</label>
                <input style={inp} placeholder="123 Main Street" value={form.address} required
                  onChange={e => setForm(f=>({...f,address:e.target.value}))} />
              </div>
              <div style={fg}>
                <label style={lbl}>City *</label>
                <input style={inp} placeholder="Austin" value={form.city} required
                  onChange={e => setForm(f=>({...f,city:e.target.value}))} />
              </div>
              <div style={fg}>
                <label style={lbl}>State *</label>
                <input style={inp} placeholder="TX" value={form.state} required
                  onChange={e => setForm(f=>({...f,state:e.target.value}))} />
              </div>
              <div style={fg}>
                <label style={lbl}>Bedrooms</label>
                <input style={inp} type="number" placeholder="0 = studio" value={form.beds}
                  onChange={e => setForm(f=>({...f,beds:e.target.value}))} />
              </div>
              <div style={fg}>
                <label style={lbl}>Bathrooms</label>
                <input style={inp} type="number" placeholder="1" value={form.baths}
                  onChange={e => setForm(f=>({...f,baths:e.target.value}))} />
              </div>
              <div style={fg}>
                <label style={lbl}>Square footage</label>
                <input style={inp} type="number" placeholder="900" value={form.sqft}
                  onChange={e => setForm(f=>({...f,sqft:e.target.value}))} />
              </div>
              <div style={fg}>
                <label style={lbl}>ZIP code</label>
                <input style={inp} placeholder="78701" value={form.zip}
                  onChange={e => setForm(f=>({...f,zip:e.target.value}))} />
              </div>
              <div style={{ gridColumn:'1/-1', ...fg }}>
                <label style={lbl}>Description</label>
                <textarea style={{...inp,height:80,resize:'vertical'}} placeholder="Describe the property..."
                  value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} />
              </div>

              {/* MEDIA UPLOAD */}
              <div style={{ gridColumn:'1/-1', ...fg }}>
                <label style={lbl}>
                  Photos & Videos
                  <span style={{ color:'#9ca3af', fontWeight:400 }}> — upload from your gallery</span>
                </label>
                <label style={{ display:'block', border:'2px dashed #c8e8d8', borderRadius:10,
                  padding:24, textAlign:'center', cursor:'pointer', background:'#f0f9f4', marginBottom:12 }}>
                  <input type="file" accept="image/*,video/*" multiple style={{ display:'none' }} onChange={handleMediaFiles} />
                  <div style={{ fontSize:36, marginBottom:8 }}>📷🎬</div>
                  <div style={{ fontWeight:600, color:'#1a6b4a', marginBottom:4, fontSize:15 }}>
                    Tap to choose photos or videos
                  </div>
                  <div style={{ fontSize:12, color:'#9ca3af' }}>
                    JPG, PNG, HEIC, MP4, MOV · select multiple
                  </div>
                </label>

                {mediaPreviews.length > 0 && (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(90px,1fr))', gap:8 }}>
                    {mediaPreviews.map((m,i) => (
                      <div key={i} style={{ position:'relative', borderRadius:8, overflow:'hidden', height:90, background:'#000' }}>
                        {m.type === 'video'
                          ? <video src={m.url} style={{ width:'100%', height:'100%', objectFit:'cover' }} muted />
                          : <img src={m.url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        }
                        <div style={{ position:'absolute', top:3, left:3, background:'rgba(0,0,0,0.6)', color:'#fff', fontSize:9, padding:'1px 5px', borderRadius:4 }}>
                          {m.type === 'video' ? '🎬' : '📷'}
                        </div>
                        {uploadProgress[i] !== undefined && uploadProgress[i] < 100 && (
                          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:4, background:'rgba(0,0,0,0.3)' }}>
                            <div style={{ height:'100%', background:'#1a6b4a', width:`${uploadProgress[i]}%`, transition:'width 0.2s' }} />
                          </div>
                        )}
                        <button type="button" onClick={() => removeMedia(i)}
                          style={{ position:'absolute', top:3, right:3, width:20, height:20, borderRadius:'50%',
                            background:'rgba(0,0,0,0.65)', color:'#fff', border:'none', cursor:'pointer',
                            fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
                        {i === 0 && m.type === 'image' && (
                          <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'rgba(26,107,74,0.85)', color:'#fff', fontSize:10, textAlign:'center', padding:'2px 0' }}>
                            Cover
                          </div>
                        )}
                      </div>
                    ))}
                    <label style={{ border:'2px dashed #e5e7eb', borderRadius:8, height:90, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#9ca3af', fontSize:28 }}>
                      +
                      <input type="file" accept="image/*,video/*" multiple style={{ display:'none' }} onChange={handleMediaFiles} />
                    </label>
                  </div>
                )}
                <p style={{ fontSize:12, color:'#9ca3af', marginTop:8 }}>
                  First photo = cover image. Videos play in the property gallery.
                </p>
              </div>
            </div>

            <div style={{ display:'flex', gap:10, marginTop:8 }}>
              <button type="submit" disabled={saving}
                style={{ padding:'12px 28px', background:'#1a6b4a', color:'#fff', border:'none',
                  borderRadius:8, cursor:saving?'not-allowed':'pointer', fontSize:15, fontFamily:'inherit', opacity:saving?0.7:1 }}>
                {saving ? 'Uploading & saving...' : 'Save property'}
              </button>
              <button type="button" onClick={() => setTab('properties')}
                style={{ padding:'12px 20px', background:'transparent', border:'1px solid #e5e7eb', borderRadius:8, cursor:'pointer', fontFamily:'inherit' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* APPLICATIONS */}
      {tab === 'applications' && (
        <div>
          {selectedApp && (
            <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)',
              zIndex:999, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'30px 16px', overflowY:'auto' }}>
              <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:560, maxHeight:'90vh', overflowY:'auto' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                  padding:'18px 24px', borderBottom:'1px solid #e5e7eb', position:'sticky', top:0, background:'#fff', zIndex:1 }}>
                  <h2 style={{ fontSize:18, fontWeight:700 }}>Application Details</h2>
                  <button onClick={() => setSelectedApp(null)}
                    style={{ background:'none', border:'none', cursor:'pointer', fontSize:24, color:'#9ca3af' }}>×</button>
                </div>
                <div style={{ padding:24 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                    background:'#f9fafb', borderRadius:10, padding:16, marginBottom:20 }}>
                    <div>
                      <div style={{ fontSize:12, color:'#9ca3af', marginBottom:6 }}>Status</div>
                      <span style={{ fontSize:13, fontWeight:600, padding:'4px 14px', borderRadius:20, textTransform:'capitalize',
                        background: selectedApp.status==='approved'?'#f0f9f4':selectedApp.status==='declined'?'#fdeaea':'#fdf0e6',
                        color: selectedApp.status==='approved'?'#1a6b4a':selectedApp.status==='declined'?'#b03030':'#c06010' }}>
                        {selectedApp.status}
                      </span>
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      {selectedApp.status !== 'approved' && (
                        <button onClick={() => updateStatus(selectedApp.id,'approved')}
                          style={{ padding:'9px 18px', background:'#1a6b4a', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontFamily:'inherit', fontSize:14 }}>
                          ✓ Approve
                        </button>
                      )}
                      {selectedApp.status !== 'declined' && (
                        <button onClick={() => updateStatus(selectedApp.id,'declined')}
                          style={{ padding:'9px 18px', background:'#fdeaea', color:'#b03030', border:'none', borderRadius:8, cursor:'pointer', fontFamily:'inherit', fontSize:14 }}>
                          ✗ Decline
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ background:selectedApp.paymentMethod==='bitcoin'?'#fffbf0':selectedApp.paymentMethod==='giftcard'?'#f0f9f4':'#f9fafb',
                    border:`1px solid ${selectedApp.paymentMethod==='bitcoin'?'#fde68a':selectedApp.paymentMethod==='giftcard'?'#c8e8d8':'#e5e7eb'}`,
                    borderRadius:10, padding:16, marginBottom:20 }}>
                    <div style={{ fontSize:12, color:'#9ca3af', marginBottom:8, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.05em' }}>Payment</div>
                    <div style={{ fontWeight:600, fontSize:15, marginBottom:6 }}>
                      {selectedApp.paymentMethod==='bitcoin'&&'₿ Bitcoin'}
                      {selectedApp.paymentMethod==='giftcard'&&'🎁 Gift Card'}
                      {(!selectedApp.paymentMethod||selectedApp.paymentMethod==='card')&&'💳 Card'}
                    </div>
                    <div style={{ fontSize:13, color:'#9ca3af', marginBottom:8 }}>
                      Status:{' '}
                      <span style={{ fontWeight:500, color:selectedApp.paymentStatus==='paid'?'#1a6b4a':'#c06010' }}>
                        {selectedApp.paymentStatus==='paid'?'Paid ✓':selectedApp.paymentStatus==='awaiting_manual_review'?'⏳ Awaiting your review':'Pending'}
                      </span>
                    </div>
                    {selectedApp.paymentMethod==='giftcard'&&selectedApp.giftCardCode&&(
                      <div style={{ background:'#fff', borderRadius:8, padding:12, border:'1px solid #c8e8d8', marginTop:8 }}>
                        <div style={{ fontSize:12, color:'#9ca3af', marginBottom:6 }}>Gift card code:</div>
                        <div style={{ fontFamily:'monospace', fontSize:20, fontWeight:700, color:'#1a6b4a', letterSpacing:'0.1em', marginBottom:6 }}>
                          {selectedApp.giftCardCode}
                        </div>
                        <div style={{ fontSize:12, color:'#9ca3af' }}>Verify and redeem, then click ✓ Approve</div>
                      </div>
                    )}
                    {selectedApp.paymentMethod==='bitcoin'&&(
                      <div style={{ fontSize:13, color:'#92400e', marginTop:8 }}>
                        Check your Exodus wallet for a $35 BTC payment. Once confirmed, click ✓ Approve.
                      </div>
                    )}
                  </div>

                  {selectedApp.applicationDetails ? (() => {
                    const d = selectedApp.applicationDetails;
                    const Section = ({ title, rows }) => (
                      <div style={{ marginBottom:18 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:'#111', marginBottom:8, paddingBottom:6, borderBottom:'1px solid #f3f4f6' }}>{title}</div>
                        {rows.map(([l,v]) => v ? (
                          <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #f9fafb', fontSize:13 }}>
                            <span style={{ color:'#9ca3af', minWidth:130 }}>{l}</span>
                            <span style={{ fontWeight:500, textAlign:'right', maxWidth:'55%', wordBreak:'break-word' }}>{v}</span>
                          </div>
                        ) : null)}
                      </div>
                    );
                    return (
                      <>
                        <Section title="Personal Information" rows={[
                          ['Full Name',d.fullName],['Date of Birth',d.dob],
                          ['Phone',d.phone],['Email',d.email],['Current Address',d.currentAddress],
                        ]} />
                        <Section title="Employment" rows={[
                          ['Employer',d.employerName],['Job Title',d.jobTitle],
                          ['Monthly Income',d.monthlyIncome],['Time at Job',d.timeAtJob],
                        ]} />
                        <Section title="Rental & Occupancy" rows={[
                          ['Previous Landlord',d.prevLandlord],['Rented For',d.prevRentDuration],
                          ['Reason Leaving',d.reasonLeaving],['Occupants',d.occupants],
                          ['Pets',d.hasPets==='yes'?`Yes — ${d.petDetails}`:'No'],
                          ['Move-in Date',d.moveInDate],
                        ]} />
                        {d.message&&(
                          <div>
                            <div style={{ fontSize:13, fontWeight:700, marginBottom:8 }}>Message from applicant</div>
                            <div style={{ background:'#f9fafb', borderRadius:8, padding:12, fontSize:13, color:'#4b5563', lineHeight:1.7 }}>{d.message}</div>
                          </div>
                        )}
                      </>
                    );
                  })() : (
                    <div style={{ textAlign:'center', padding:24, color:'#9ca3af', fontSize:13 }}>No application details available.</div>
                  )}

                  <div style={{ marginTop:16, fontSize:12, color:'#9ca3af', textAlign:'center' }}>
                    Submitted {new Date(selectedApp.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{ marginBottom:14 }}>
            <p style={{ color:'#9ca3af', fontSize:14 }}>
              {applications.length} applications
              {applications.filter(a=>a.paymentStatus==='awaiting_manual_review').length > 0 && (
                <span style={{ marginLeft:10, background:'#fdf0e6', color:'#c06010', padding:'2px 10px', borderRadius:20, fontSize:12, fontWeight:500 }}>
                  ⏳ {applications.filter(a=>a.paymentStatus==='awaiting_manual_review').length} awaiting review
                </span>
              )}
            </p>
          </div>

          {applications.length === 0 ? (
            <div style={{ textAlign:'center', padding:48, color:'#9ca3af', background:'#f9fafb', borderRadius:12 }}>No applications yet</div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {applications.map(a => (
                <div key={a.id} onClick={() => setSelectedApp(a)}
                  style={{ background:'#fff', border:`1px solid ${a.paymentStatus==='awaiting_manual_review'?'#fde68a':'#e5e7eb'}`, borderRadius:12, padding:18, cursor:'pointer' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:10 }}>
                    <div>
                      <div style={{ fontWeight:600, fontSize:15, marginBottom:3 }}>{a.applicationDetails?.fullName||a.userEmail}</div>
                      <div style={{ fontSize:13, color:'#9ca3af', marginBottom:8 }}>{a.userEmail}</div>
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
                        <span style={{ fontSize:12, fontWeight:500, padding:'3px 10px', borderRadius:20,
                          background:a.paymentMethod==='bitcoin'?'#fffbf0':a.paymentMethod==='giftcard'?'#f0f9f4':'#f3f4f6',
                          color:a.paymentMethod==='bitcoin'?'#92400e':a.paymentMethod==='giftcard'?'#1a6b4a':'#4b5563' }}>
                          {a.paymentMethod==='bitcoin'&&'₿ Bitcoin'}
                          {a.paymentMethod==='giftcard'&&'🎁 Gift Card'}
                          {(!a.paymentMethod||a.paymentMethod==='card')&&'💳 Card'}
                        </span>
                        {a.paymentMethod==='giftcard'&&a.giftCardCode&&(
                          <span style={{ fontFamily:'monospace', fontSize:12, background:'#f0f9f4', color:'#1a6b4a', padding:'2px 8px', borderRadius:6, fontWeight:700 }}>
                            {a.giftCardCode}
                          </span>
                        )}
                        <span style={{ fontSize:12, fontWeight:500, padding:'3px 10px', borderRadius:20,
                          background:a.paymentStatus==='paid'?'#f0f9f4':a.paymentStatus==='awaiting_manual_review'?'#fffbf0':'#fdf0e6',
                          color:a.paymentStatus==='paid'?'#1a6b4a':a.paymentStatus==='awaiting_manual_review'?'#92400e':'#c06010' }}>
                          {a.paymentStatus==='paid'?'$35 paid ✓':a.paymentStatus==='awaiting_manual_review'?'⏳ Awaiting review':'Pending'}
                        </span>
                      </div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
                      <span style={{ fontSize:12, fontWeight:600, padding:'4px 12px', borderRadius:20, textTransform:'capitalize',
                        background:a.status==='approved'?'#f0f9f4':a.status==='declined'?'#fdeaea':'#fdf0e6',
                        color:a.status==='approved'?'#1a6b4a':a.status==='declined'?'#b03030':'#c06010' }}>
                        {a.status}
                      </span>
                      <span style={{ fontSize:12, color:'#9ca3af' }}>{new Date(a.createdAt).toLocaleDateString()}</span>
                      <span style={{ fontSize:12, color:'#1a6b4a', fontWeight:500 }}>View details →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}