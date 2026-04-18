const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { 
    type: String, 
    enum: ['citizen', 'worker', 'municipal', 'business', 'citizen-independent', 'citizen-apartment'], 
    default: 'citizen' 
  },
  houseId: { type: String },
  shopId: { type: String },
  businessName: { type: String },
  aadhaarNo: { type: String },
  panCard: { type: String },
  shopNumber: { type: String },
  maskedAadhaar: { type: String },
  qrToken: { type: String, unique: true },
  qrPayload: { type: String },

  points: { type: Number, default: 0 },
  eligibilityStatus: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
