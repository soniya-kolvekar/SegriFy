const express = require('express');
const router = express.Router();
const SegregationRecord = require('../models/SegregationRecord');
const User = require('../models/User');
const { verifyFirebaseToken, checkRole, verifyMunicipal } = require('../middleware/auth');

// Municipal Analytics (Only Municipal role with extra secret check)
router.get('/analytics/city', verifyFirebaseToken, verifyMunicipal, async (req, res) => {
  try {
    const totalRecords = await SegregationRecord.countDocuments();
    const properCount = await SegregationRecord.countDocuments({ status: 'proper' });
    const improperCount = await SegregationRecord.countDocuments({ status: 'improper' });

    // Aggregation for waste distribution
    const wasteDistribution = await SegregationRecord.aggregate([
      { $group: { _id: "$wasteType", count: { $sum: 1 } } }
    ]);

    // Active users count
    const activeUsers = await User.countDocuments({ role: 'citizen' });

    res.json({
      totalRecords,
      properCount,
      improperCount,
      wasteDistribution,
      activeUsers,
      properRate: ((properCount / totalRecords) * 100).toFixed(2)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Citizen Stats (Only Citizen or Municipal)
router.get('/citizen/:userId', verifyFirebaseToken, checkRole(['citizen', 'municipal']), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    const records = await SegregationRecord.find({ userId: req.params.userId }).limit(10).sort({ date: -1 });
    
    res.json({
      user,
      recentRecords: records
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
