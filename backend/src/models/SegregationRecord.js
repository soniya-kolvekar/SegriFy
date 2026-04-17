const mongoose = require('mongoose');

const segregationRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['proper', 'improper'], 
    required: true 
  },
  wasteType: { 
    type: String, 
    enum: ['wet', 'dry', 'hazard', 'e-waste'], 
    required: true 
  },
  location: {
    lat: Number,
    lng: Number
  },
  imageUrl: { type: String }
});

module.exports = mongoose.model('SegregationRecord', segregationRecordSchema);
