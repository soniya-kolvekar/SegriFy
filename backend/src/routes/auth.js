const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyFirebaseToken } = require('../middleware/auth');

// Sync Firebase User to MongoDB (Called after Firebase Signup)
router.post('/sync', verifyFirebaseToken, async (req, res) => {
  try {
    const { name, role, houseId, shopId, maskedAadhaar } = req.body;
    const { firebaseUid, email } = req.user;
    
    // Strict Role Enforcement: Block unauthorized roles from public signup
    if (role === 'municipal' || role === 'worker') {
      return res.status(403).json({ message: 'Forbidden: Cannot register as a municipal or worker account' });
    }

    if (!['citizen', 'business'].includes(role)) {
       return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Check if user already exists
    let user = await User.findOne({ firebaseUid });
    if (user) {
      return res.status(200).json({ message: 'User already synced', user });
    }

    // Create unique QR token for scanning
    const qrToken = Math.random().toString(36).substring(2, 10).toUpperCase();

    user = new User({
      firebaseUid,
      email,
      name,
      role,
      houseId,
      shopId,
      maskedAadhaar,
      qrToken
    });

    await user.save();

    res.status(201).json({ message: 'User successfully synced to database', user });
  } catch (err) {
    console.error('Sync Error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get Current User Profile
router.get('/me', verifyFirebaseToken, async (req, res) => {
  try {
    if (!req.user.mongoUser) {
      return res.status(404).json({ message: 'User profile not found in database' });
    }
    res.json({ user: req.user.mongoUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update User Profile (Used for Business Onboarding)
router.patch('/update-profile', verifyFirebaseToken, async (req, res) => {
  try {
    const { businessName, aadhaarNo, panCard, shopNumber } = req.body;
    const firebaseUid = req.user.firebaseUid;

    const user = await User.findOneAndUpdate(
      { firebaseUid },
      { 
        businessName, 
        aadhaarNo, 
        panCard, 
        shopNumber,
        // Also update name if provided, or use businessName as name
        name: businessName || req.user.mongoUser.name 
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    console.error('Update Profile Error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
