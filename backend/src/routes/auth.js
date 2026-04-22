const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../firebase');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password, name, phone } = req.body;
  const db = getDb();

  try {
    const existing = await db.collection('users').where('email', '==', email).get();
    if (!existing.empty) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 12);
    const userRef = db.collection('users').doc();
    const userData = {
      id: userRef.id, email, name,
      phone: phone || null, role: 'user',
      createdAt: new Date().toISOString(),
      savedProperties: [],
    };
    await userRef.set({ ...userData, passwordHash: hash });

    const token = jwt.sign({ id: userRef.id, email, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: userData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  const db = getDb();

  try {
    const snap = await db.collection('users').where('email', '==', email).get();
    if (snap.empty) return res.status(401).json({ error: 'Invalid credentials' });

    const doc = snap.docs[0];
    const user = doc.data();
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: doc.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const { passwordHash, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  const db = getDb();
  try {
    const doc = await db.collection('users').doc(req.user.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'User not found' });
    const { passwordHash, ...user } = doc.data();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/auth/me
router.patch('/me', authMiddleware, async (req, res) => {
  const db = getDb();
  const { name, phone } = req.body;
  try {
    await db.collection('users').doc(req.user.id).update({ name, phone });
    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;