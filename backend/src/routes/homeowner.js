const express = require('express');
const router = express.Router();
const User = require('../models/User');
const SegregationRecord = require('../models/SegregationRecord');
const Reward = require('../models/Reward');
const Complaint = require('../models/Complaint');
const Fine = require('../models/Fine');
const crypto = require('crypto');
const { verifyFirebaseToken } = require('../middleware/auth');

// POST /api/homeowner/setup  — One-time profile completion after signup
router.post('/setup', verifyFirebaseToken, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, houseId, shopId, maskedAadhaar } = req.body;
    const finalId = houseId || shopId;

    if (!name || !finalId) {
      return res.status(400).json({ message: 'Name and identification number are required.' });
    }

    // Prevent re-setup if profile already completed
    if (user.houseId || user.shopId) {
      return res.status(400).json({ message: 'Profile already completed.' });
    }

    // Generate QR based on finalId — deterministic and unique
    const normalizedId = finalId.toUpperCase().trim();
    const qrToken = normalizedId;
    const qrPayload = normalizedId;

    user.name = name;
    if (houseId) user.houseId = houseId;
    if (shopId) user.shopId = shopId;
    user.maskedAadhaar = maskedAadhaar || '';
    user.qrToken = qrToken;
    user.qrPayload = qrPayload;
    await user.save();

    res.json({ message: 'Profile setup complete', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// GET /api/homeowner/profile
router.get('/profile', verifyFirebaseToken, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.firebaseUid }).select('-__v');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/homeowner/calendar?month=YYYY-MM
// Returns all segregation records for a given month
router.get('/calendar', verifyFirebaseToken, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { month } = req.query; // e.g. "2024-10"
    let start, end;
    if (month) {
      start = new Date(`${month}-01T00:00:00.000Z`);
      end = new Date(start);
      end.setMonth(end.getMonth() + 1);
    } else {
      // Default: current month
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    const records = await SegregationRecord.find({
      userId: user._id,
      date: { $gte: start, $lt: end }
    }).select('date status wasteType imageUrl');

    res.json({ records });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/homeowner/rewards
// Returns reward history + current month strike count for 3-strike logic
router.get('/rewards', verifyFirebaseToken, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Count improper records this month for the 3-strike rule
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const improperCount = await SegregationRecord.countDocuments({
      userId: user._id,
      status: 'improper',
      date: { $gte: monthStart, $lt: monthEnd }
    });

    const rewardsEligible = improperCount < 3; // 3-strike rule

    // Get all reward transactions
    const rewards = await Reward.find({ userId: user._id }).sort({ date: -1 });

    // Get all segregation records as transaction history
    const segregationHistory = await SegregationRecord.find({ userId: user._id })
      .sort({ date: -1 })
      .limit(20)
      .select('date status wasteType');

    res.json({
      totalPoints: user.points,
      improperCount,
      rewardsEligible,
      rewards,
      segregationHistory
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/homeowner/complaint
// Submit a complaint to the municipal authority
router.post('/complaint', verifyFirebaseToken, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { subject, description } = req.body;
    if (!subject || !description) {
      return res.status(400).json({ message: 'Subject and description are required' });
    }

    const complaint = new Complaint({
      userId: user._id,
      userName: user.name,
      houseId: user.houseId,
      subject,
      description,
      status: 'pending'
    });

    await complaint.save();

    // Emit real-time event for Municipal Dashboard
    if (global.io) {
      global.io.emit('new_complaint', { complaint });
    }

    res.status(201).json({ message: 'Complaint submitted successfully', complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/homeowner/complaints
// Fetch all past complaints for the citizen
router.get('/complaints', verifyFirebaseToken, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const complaints = await Complaint.find({ userId: user._id }).sort({ createdAt: -1 });
    res.json({ complaints });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/homeowner/fines
// Fetch all fines attached to the citizen
router.get('/fines', verifyFirebaseToken, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.firebaseUid });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const fines = await Fine.find({ userId: user._id }).sort({ issuedAt: -1 });
    res.json({ fines });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/homeowner/fines/pay
// Razorpay Verification Hook -> mark fine as 'paid'
router.post('/fines/pay', verifyFirebaseToken, async (req, res) => {
  try {
    const { fineId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // RSA Verification
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: "Invalid Signature. Fine resolution halted." });
    }

    const fine = await Fine.findById(fineId);
    if (!fine) return res.status(404).json({ message: "Fine not found!" });

    fine.status = 'paid';
    fine.paymentId = razorpay_payment_id;
    fine.resolvedAt = new Date();
    await fine.save();

    res.json({ message: "Fine paid successfully", fine });
  } catch (err) {
    console.error('Fine Payment Verification Error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
