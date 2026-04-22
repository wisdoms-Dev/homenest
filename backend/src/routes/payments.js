const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { getDb } = require('../firebase');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const APPLICATION_FEE = 3500; // $35.00 in cents

// POST /api/payments/create-checkout - create Stripe session
router.post('/create-checkout', authMiddleware, async (req, res) => {
  const { propertyId, applicationId } = req.body;
  const db = getDb();

  try {
    const propDoc = await db.collection('properties').doc(propertyId).get();
    if (!propDoc.exists) return res.status(404).json({ error: 'Property not found' });
    const property = propDoc.data();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: req.user.email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'HomeNest Application Fee',
            description: `Application for ${property.address}, ${property.city}, ${property.state}`,
            images: property.images?.[0] ? [property.images[0]] : [],
          },
          unit_amount: APPLICATION_FEE,
        },
        quantity: 1,
      }],
      metadata: { userId: req.user.id, propertyId, applicationId: applicationId || '' },
      success_url: `${process.env.FRONTEND_URL}/application/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/properties/${propertyId}`,
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payments/webhook - Stripe webhook
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  const db = getDb();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, propertyId, applicationId } = session.metadata;

    // Mark application as paid
    if (applicationId) {
      await db.collection('applications').doc(applicationId).update({
        paymentStatus: 'paid',
        stripeSessionId: session.id,
        paidAt: new Date().toISOString(),
      });
    }

    // Record payment
    await db.collection('payments').add({
      userId, propertyId, applicationId,
      amount: APPLICATION_FEE / 100,
      currency: 'usd',
      stripeSessionId: session.id,
      status: 'completed',
      createdAt: new Date().toISOString(),
    });
  }

  res.json({ received: true });
});

// GET /api/payments/history - user payment history
router.get('/history', authMiddleware, async (req, res) => {
  const db = getDb();
  try {
    const snap = await db.collection('payments').where('userId', '==', req.user.id).get();
    const payments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;