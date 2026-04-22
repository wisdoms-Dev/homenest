const express = require('express');
const { getDb } = require('../firebase');
const { adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/stats - dashboard metrics
router.get('/stats', adminMiddleware, async (req, res) => {
  const db = getDb();
  try {
    const [propertiesSnap, applicationsSnap, usersSnap, paymentsSnap] = await Promise.all([
      db.collection('properties').where('active', '==', true).get(),
      db.collection('applications').get(),
      db.collection('users').get(),
      db.collection('payments').where('status', '==', 'completed').get(),
    ]);

    const totalRevenue = paymentsSnap.docs.reduce((sum, d) => sum + (d.data().amount || 0), 0);
    const pending = applicationsSnap.docs.filter(d => d.data().status === 'pending').length;
    const approved = applicationsSnap.docs.filter(d => d.data().status === 'approved').length;

    res.json({
      totalProperties: propertiesSnap.size,
      totalApplications: applicationsSnap.size,
      pendingApplications: pending,
      approvedApplications: approved,
      totalUsers: usersSnap.size,
      totalRevenue: totalRevenue.toFixed(2),
      totalPayments: paymentsSnap.size,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/users - all users
router.get('/users', adminMiddleware, async (req, res) => {
  const db = getDb();
  try {
    const snap = await db.collection('users').get();
    const users = snap.docs.map(d => {
      const { passwordHash, ...u } = d.data();
      return { id: d.id, ...u };
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/users/:id/role - change user role
router.patch('/users/:id/role', adminMiddleware, async (req, res) => {
  const db = getDb();
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  try {
    await db.collection('users').doc(req.params.id).update({ role });
    res.json({ message: 'Role updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/payments - all payments
router.get('/payments', adminMiddleware, async (req, res) => {
  const db = getDb();
  try {
    const snap = await db.collection('payments').orderBy('createdAt', 'desc').get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;