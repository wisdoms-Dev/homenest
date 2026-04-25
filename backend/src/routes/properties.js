
const express = require('express');
const { getDb } = require('../firebase');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/properties - list with filters
router.get('/', async (req, res) => {
  const db = getDb();
  const { type, minPrice, maxPrice, beds, city, state, limit = 20, offset = 0 } = req.query;

  try {
    let query = db.collection('properties').where('active', '==', true);
    if (type) query = query.where('type', '==', type);
    if (beds) query = query.where('beds', '==', parseInt(beds));

    const snap = await query.limit(parseInt(limit)).get();
    let properties = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (minPrice) properties = properties.filter(p => p.price >= parseInt(minPrice));
    if (maxPrice) properties = properties.filter(p => p.price <= parseInt(maxPrice));
    if (city) properties = properties.filter(p => p.city?.toLowerCase().includes(city.toLowerCase()));
    if (state) properties = properties.filter(p => p.state?.toLowerCase() === state.toLowerCase());

    res.json({ properties, total: properties.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/properties/:id - single property
router.get('/:id', async (req, res) => {
  const db = getDb();
  try {
    const doc = await db.collection('properties').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Property not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/properties - admin only
router.post('/', adminMiddleware, async (req, res) => {
  const db = getDb();
  const {
    title, description, type, price, beds, baths, sqft,
    address, city, state, zip, images, videos, amenities, yearBuilt
  } = req.body;

  try {
    const ref = db.collection('properties').doc();
    const data = {
      title,
      description: description || '',
      type,
      price: parseInt(price),
      beds: parseInt(beds),
      baths: parseInt(baths),
      sqft: parseInt(sqft),
      address,
      city,
      state,
      zip: zip || '',
      images: images || [],
      videos: videos || [],        // ← videos saved here
      amenities: amenities || [],
      yearBuilt: yearBuilt || null,
      active: true,
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await ref.set(data);
    res.status(201).json({ id: ref.id, ...data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/properties/:id - admin only
router.patch('/:id', adminMiddleware, async (req, res) => {
  const db = getDb();
  try {
    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    await db.collection('properties').doc(req.params.id).update(updates);
    res.json({ message: 'Property updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/properties/:id - admin only (soft delete)
router.delete('/:id', adminMiddleware, async (req, res) => {
  const db = getDb();
  try {
    await db.collection('properties').doc(req.params.id).update({
      active: false, updatedAt: new Date().toISOString()
    });
    res.json({ message: 'Property removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/properties/:id/save - save/unsave for users
router.post('/:id/save', authMiddleware, async (req, res) => {
  const db = getDb();
  try {
    const userRef = db.collection('users').doc(req.user.id);
    const userDoc = await userRef.get();
    const saved = userDoc.data().savedProperties || [];
    const propId = req.params.id;
    const updated = saved.includes(propId)
      ? saved.filter(id => id !== propId)
      : [...saved, propId];
    await userRef.update({ savedProperties: updated });
    res.json({ saved: updated.includes(propId) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;