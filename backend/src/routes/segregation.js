const express = require('express');
const router = express.Router();
const SegregationRecord = require('../models/SegregationRecord');
const User = require('../models/User');
const Reward = require('../models/Reward');
const { verifyFirebaseToken, verifyWorker, checkRole } = require('../middleware/auth');

// Log Segregation (Worker only with extra secret check)
router.post('/update', verifyFirebaseToken, verifyWorker, async (req, res) => {
  try {
    const { qrToken, status, wasteType, workerId } = req.body;

    // Find citizen by QR Token
    const citizen = await User.findOne({ qrToken });
    if (!citizen) return res.status(404).json({ message: 'User not found' });

    // Create record
    const record = new SegregationRecord({
      userId: citizen._id,
      workerId,
      status,
      wasteType
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
        description: `Proper waste segregation (${wasteType})`
      });
      await reward.save();
    } else {
      // Logic for improper: Check history
      const improperCount = await SegregationRecord.countDocuments({ 
        userId: citizen._id, 
        status: 'improper',
        date: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) } // Last month
      });

      if (improperCount > 3) {
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
