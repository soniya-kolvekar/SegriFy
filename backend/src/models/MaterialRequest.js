const mongoose = require('mongoose');

const materialRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemType: { type: String, required: true },
  quantity: { type: Number, required: true }, // in tonnes
  estimatedAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Accepted', 'Rejected', 'Paid'], 
    default: 'Pending' 
  },
  pickupDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MaterialRequest', materialRequestSchema);
