const express = require('express');
const router = express.Router();
const MaterialRequest = require('../models/MaterialRequest');
const Complaint = require('../models/Complaint');
const Fine = require('../models/Fine');
const Material = require('../models/Material');
const { verifyFirebaseToken, checkRole } = require('../middleware/auth');

// Get all material requests (Pending and Accepted/Logistics)
router.get('/business/requests', verifyFirebaseToken, checkRole(['municipal']), async (req, res) => {
  try {
    const requests = await MaterialRequest.find()
      .populate('userId', 'name shopId houseId')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update request status (Approve/Reject)
router.patch('/business/requests/:id', verifyFirebaseToken, checkRole(['municipal']), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status update' });
    }

    const request = await MaterialRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = status;
    await request.save();

    // Deduct from inventory if accepted
    if (status === 'Accepted') {
      const material = await Material.findOne({ name: request.itemType });
      if (material) {
        material.availableQuantity = Math.max(0, material.availableQuantity - request.quantity);
        await material.save();
      }
    }

    res.json({ message: `Request ${status.toLowerCase()} successfully`, request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all complaints
router.get('/complaints', verifyFirebaseToken, checkRole(['municipal']), async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update complaint status
router.patch('/complaints/:id', verifyFirebaseToken, checkRole(['municipal']), async (req, res) => {
  try {
    const { status, resolution } = req.body;
    const updateData = { status };
    
    if (status === 'resolved') {
      updateData.resolvedAt = Date.now();
      updateData.resolution = resolution;
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    res.json({ message: 'Complaint updated successfully', complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all fines
router.get('/fines', verifyFirebaseToken, checkRole(['municipal']), async (req, res) => {
  try {
    const fines = await Fine.find()
      .populate('userId', 'name houseId')
      .sort({ issuedAt: -1 });
    res.json(fines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Inventory Management Routes
router.get('/inventory', verifyFirebaseToken, checkRole(['municipal']), async (req, res) => {
  try {
    const materials = await Material.find().sort({ name: 1 });
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/inventory', verifyFirebaseToken, checkRole(['municipal']), async (req, res) => {
  try {
    const { name, costPerTon, availableQuantity, description } = req.body;
    const material = new Material({ name, costPerTon, availableQuantity, description });
    await material.save();
    res.status(201).json(material);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/inventory/:id', verifyFirebaseToken, checkRole(['municipal']), async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!material) return res.status(404).json({ message: 'Material not found' });
    res.json(material);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/inventory/:id', verifyFirebaseToken, checkRole(['municipal']), async (req, res) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.id);
    if (!material) return res.status(404).json({ message: 'Material not found' });
    res.json({ message: 'Material deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
