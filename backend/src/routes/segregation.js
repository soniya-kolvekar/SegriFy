const express = require('express');
const router = express.Router();
const SegregationRecord = require('../models/SegregationRecord');
const User = require('../models/User');
const Reward = require('../models/Reward');
const { verifyFirebaseToken, verifyWorker, checkRole } = require('../middleware/auth');

// Validate QR / Get User Data
router.get('/validate/:qrToken', verifyFirebaseToken, async (req, res) => {
  try {
    const { qrToken } = req.params;
    const user = await User.findOne({ qrToken }).select('name houseId shopId');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found / Invalid QR' });
    }

    // Check if already scanned today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingRecord = await SegregationRecord.findOne({
      userId: user._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });
    
    res.json({ 
      user, 
      alreadyScanned: !!existingRecord 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Log Segregation (Worker only with extra secret check)
router.post('/update', verifyFirebaseToken, verifyWorker, async (req, res) => {
  try {
    const { qrToken, status, workerId, municipalId } = req.body;

    // Find citizen by QR Token
    const citizen = await User.findOne({ qrToken });
    if (!citizen) return res.status(404).json({ message: 'User not found' });

    // Block if already scanned today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingRecord = await SegregationRecord.findOne({
      userId: citizen._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existingRecord) {
      return res.status(400).json({ message: 'This resident has already been scanned today.' });
    }

    // Create record
    const record = new SegregationRecord({
      userId: citizen._id,
      workerId,
      municipalId,
      status
    });
    await record.save();

    // Reward Logic
    let pointsEarned = 0;
    if (status === 'proper') {
      pointsEarned = 10; // Simple reward
      citizen.points += pointsEarned;
      
      const reward = new Reward({
        userId: citizen._id,
        pointsEarned,
        description: `Proper waste segregation`
      });
      await reward.save();
    } else {
      // Logic for improper: Check history (Total improper marks for this user this month)
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const improperCount = await SegregationRecord.countDocuments({ 
        userId: citizen._id, 
        status: 'improper',
        date: { $gte: monthStart }
      });

      if (improperCount >= 3) {
        citizen.eligibilityStatus = false;
      }
    }

    await citizen.save();

    // Emit real-time updates
    if (global.io) {
      global.io.emit('segregationUpdated', { 
        userId: citizen._id, 
        status, 
        points: citizen.points,
        eligibility: citizen.eligibilityStatus
      });
    }

    res.json({ message: 'Successfully updated', record, citizen });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get History for a user
router.get('/history/:userId', verifyFirebaseToken, checkRole(['citizen', 'municipal']), async (req, res) => {
  try {
    const records = await SegregationRecord.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
