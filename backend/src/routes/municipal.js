const express = require('express');
const router = express.Router();
const MaterialRequest = require('../models/MaterialRequest');
const Complaint = require('../models/Complaint');
const Fine = require('../models/Fine');
const Material = require('../models/Material');
const SegregationRecord = require('../models/SegregationRecord');
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
      { returnDocument: 'after' }
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
    const material = await Material.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
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

// Unified Activity History / Audit Trail
router.get('/history', verifyFirebaseToken, checkRole(['municipal']), async (req, res) => {
  try {
    // 1. Fetch latest data from all major collections
    const [complaints, requests, fines, wasteLogs] = await Promise.all([
      Complaint.find().populate('userId', 'name').sort({ createdAt: -1 }).limit(30),
      MaterialRequest.find().populate('userId', 'name').sort({ createdAt: -1 }).limit(30),
      Fine.find().populate('userId', 'name').sort({ issuedAt: -1 }).limit(30),
      SegregationRecord.find().populate('userId', 'name').sort({ date: -1 }).limit(50)
    ]);

    // 2. Transform into a unified "Activity" format
    const activities = [
      ...complaints.map(c => ({
        id: c._id,
        type: 'complaint',
        title: `Complaint: ${c.subject}`,
        detail: `Resident ${c.userId?.name || 'Unknown'} - ${c.description.substring(0, 50)}...`,
        status: c.status,
        date: c.createdAt
      })),
      ...requests.map(r => ({
        id: r._id,
        type: 'business',
        title: `Material Request: ${r.itemType}`,
        detail: `Business ${r.userId?.name || 'Unknown'} requested ${r.quantity}kg`,
        status: r.status,
        date: r.createdAt
      })),
      ...fines.map(f => ({
        id: f._id,
        type: 'enforcement',
        title: `Fine Issued: ${f.reason}`,
        detail: `Amount: ₹${f.amount} to Resident ${f.userId?.name || 'Unknown'}`,
        status: f.status,
        date: f.issuedAt
      })),
      ...wasteLogs.map(w => ({
        id: w._id,
        type: 'logistics',
        title: `Waste Logged: ${w.status.toUpperCase()}`,
        detail: `Citizen ${w.userId?.name || 'Unknown'} segregation quality record`,
        status: w.status,
        date: w.date
      }))
    ];

    // 3. Sort by date descending
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // 4. Limit to top 100 recent events
    res.json(activities.slice(0, 100));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
