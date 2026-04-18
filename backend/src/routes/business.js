const express = require('express');
const router = express.Router();
const Material = require('../models/Material');
const MaterialRequest = require('../models/MaterialRequest');
const { verifyFirebaseToken, checkRole } = require('../middleware/auth');

// Get all available materials and their costs
router.get('/materials', verifyFirebaseToken, async (req, res) => {
  try {
    const materials = await Material.find();
    
    // If no materials exist, return dummy data
    if (materials.length === 0) {
      const dummyMaterials = [
        { name: 'Paper', costPerTon: 150, description: 'High quality recyclable paper' },
        { name: 'Plastic', costPerTon: 200, description: 'Industrial grade plastic waste' },
        { name: 'E-Waste', costPerTon: 500, description: 'Electronic components and scrap' },
        { name: 'Metal', costPerTon: 400, description: 'Aluminum and steel scrap' },
        { name: 'Organic', costPerTon: 100, description: 'Compostable organic waste' }
      ];
      return res.json(dummyMaterials);
    }
    
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit a new material request
router.post('/request', verifyFirebaseToken, checkRole(['business']), async (req, res) => {
  try {
    const { itemType, quantity, estimatedAmount } = req.body;
    const userId = req.user.mongoUser._id;

    const request = new MaterialRequest({
      userId,
      itemType,
      quantity,
      estimatedAmount,
      status: 'Pending'
    });

    await request.save();
    res.status(201).json({ message: 'Request submitted successfully', request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all requests for the logged-in business
router.get('/requests', verifyFirebaseToken, checkRole(['business']), async (req, res) => {
  try {
    const userId = req.user.mongoUser._id;
    const requests = await MaterialRequest.find({ userId }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
