const mongoose = require('mongoose');

const segregationRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional for field staff
  municipalId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional for office/admin staff
  date: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['proper', 'improper'], 
    required: true 
  },
  location: {
    lat: Number,
    lng: Number
  },
  imageUrl: { type: String }
});

module.exports = mongoose.model('SegregationRecord', segregationRecordSchema);
