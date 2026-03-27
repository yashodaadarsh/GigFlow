require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const axios = require('axios');

const sequelize = require('./config/database');
const Payment = require('./models/Payment');

const app = express();
app.use(cors());
app.use(express.json());

// Razorpay setup – gracefully handle missing credentials
let razorpay = null;
try {
  const Razorpay = require('razorpay');
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'YOUR_KEY_ID_HERE') {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log('✅ Razorpay initialized');
  } else {
    console.warn('⚠️  Razorpay credentials not set — payment endpoints in mock mode');
  }
} catch (e) {
  console.warn('Razorpay SDK not available:', e.message);
}

const GIG_URL = process.env.GIG_SERVICE_URL || 'http://localhost:8082';
const NOTIF_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8083';

async function updateGigStatus(gigId, status, token) {
  try {
    await axios.put(`${GIG_URL}/api/gigs/${gigId}/status?status=${status}`, {}, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch (e) {
    console.warn('Could not update gig status:', e.message);
  }
}

async function pushNotification(userId, message) {
  try {
    await axios.post(`${NOTIF_URL}/api/notifications/notify`, { userId, message });
  } catch (e) {}
}

// ---------- ROUTES ----------

app.get('/api/health', (req, res) => res.json({ status: 'Payment Service running', razorpay: !!razorpay }));

/**
 * POST /api/payments/create-order
 * Body: { gigId, hirerId, bidderId, amount }
 * Creates a Razorpay order and returns {orderId, amount, currency, key}
 */
app.post('/api/payments/create-order', async (req, res) => {
  const { gigId, hirerId, bidderId, amount, token } = req.body;
  try {
    // Record payment intent
    let payment = await Payment.findOne({ where: { gig_id: String(gigId), status: 'PENDING' } });
    if (!payment) {
      payment = await Payment.create({
        gig_id: String(gigId),
        hirer_id: String(hirerId),
        bidder_id: String(bidderId),
        amount: parseFloat(amount),
        status: 'PENDING',
      });
    }

    if (!razorpay) {
      // Mock mode: return a fake order for testing
      return res.json({
        orderId: `mock_order_${Date.now()}`,
        amount: Math.round(parseFloat(amount) * 100), // paise
        currency: 'INR',
        key: 'mock_key',
        paymentId: payment.id,
        mock: true,
      });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(parseFloat(amount) * 100), // paise
      currency: 'INR',
      receipt: `gig_${gigId}_pay_${payment.id}`,
    });

    payment.razorpay_order_id = order.id;
    await payment.save();

    // Move gig to PAYMENT_PENDING
    await updateGigStatus(gigId, 'PAYMENT_PENDING', token);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      paymentId: payment.id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/payments/verify
 * Body: { razorpayOrderId, razorpayPaymentId, razorpaySignature, gigId, hirerId, bidderId, token }
 * Verifies HMAC, marks payment PAID, advances gig to DELIVERED
 */
app.post('/api/payments/verify', async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, gigId, hirerId, bidderId, token, mock } = req.body;
  try {
    let isValid = false;

    if (mock) {
      isValid = true; // mock mode bypass
    } else {
      const secret = process.env.RAZORPAY_KEY_SECRET;
      const body = `${razorpayOrderId}|${razorpayPaymentId}`;
      const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');
      isValid = expectedSignature === razorpaySignature;
    }

    if (!isValid) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Update payment record
    await Payment.update(
      { status: 'PAID', razorpay_payment_id: razorpayPaymentId, razorpay_signature: razorpaySignature },
      { where: { razorpay_order_id: razorpayOrderId } }
    );

    // Move gig to DELIVERED
    await updateGigStatus(gigId, 'DELIVERED', token);

    // Notify both parties
    await pushNotification(bidderId, '💰 Payment received! Project marked as DELIVERED.');
    await pushNotification(hirerId, '✅ Payment successful! Project is now DELIVERED.');

    res.json({ success: true, message: 'Payment verified, project delivered!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/payments/gig/:gigId  – get payment status for a gig
 */
app.get('/api/payments/gig/:gigId', async (req, res) => {
  try {
    const payment = await Payment.findOne({ where: { gig_id: String(req.params.gigId) } });
    res.json(payment || { status: 'NONE' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- STARTUP ----------
const PORT = process.env.PORT || 5001;
sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Payment DB synchronized');
    app.listen(PORT, () => console.log(`🚀 Payment Service on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ DB failed:', err.message);
    app.listen(PORT, () => console.log(`⚠️ Payment Service running without DB on port ${PORT}`));
  });
