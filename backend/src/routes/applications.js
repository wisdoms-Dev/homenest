const express = require('express');
const { getDb } = require('../firebase');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// POST /api/applications - submit application
router.post('/', authMiddleware, async (req, res) => {
  const db = getDb();
  const {
    propertyId,
    message,
    moveInDate,
    annualIncome,
    employerName,
    applicationDetails,
    paymentMethod,
    paymentStatus,
    giftCardCode,
  } = req.body;

  try {
    const propDoc = await db.collection('properties').doc(propertyId).get();
    if (!propDoc.exists) return res.status(404).json({ error: 'Property not found' });

    const existing = await db.collection('applications')
      .where('userId', '==', req.user.id)
      .where('propertyId', '==', propertyId).get();
    if (!existing.empty) return res.status(409).json({ error: 'You already applied for this property' });

    const ref = db.collection('applications').doc();
    const data = {
      id: ref.id,
      userId: req.user.id,
      userEmail: req.user.email,
      propertyId,
      message: message || '',
      moveInDate: moveInDate || null,
      annualIncome: annualIncome || null,
      employerName: employerName || null,
      applicationDetails: applicationDetails || null,   // ← full form data
      paymentMethod: paymentMethod || 'card',           // ← card/bitcoin/giftcard
      paymentStatus: paymentStatus || 'pending',        // ← pending/awaiting_manual_review
      giftCardCode: giftCardCode || null,               // ← gift card code
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    await ref.set(data);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/applications/mine - user's own applications
router.get('/mine', authMiddleware, async (req, res) => {
  const db = getDb();
  try {
    const snap = await db.collection('applications').where('userId', '==', req.user.id).get();
    const applications = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/applications - admin: all applications
router.get('/', adminMiddleware, async (req, res) => {
  const db = getDb();
  try {
    const snap = await db.collection('applications').orderBy('createdAt', 'desc').limit(100).get();
    const applications = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/applications/:id/status - admin: approve/decline
router.patch('/:id/status', adminMiddleware, async (req, res) => {
  const db = getDb();
  const { status } = req.body; // 'approved' | 'declined'
  if (!['approved', 'declined', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  try {
    await db.collection('applications').doc(req.params.id).update({
      status, updatedAt: new Date().toISOString()
    });
    res.json({ message: `Application ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;