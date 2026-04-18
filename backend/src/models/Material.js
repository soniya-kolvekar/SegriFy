const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  costPerTon: { type: Number, required: true },
  description: { type: String },
  unit: { type: String, default: 'ton' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Material', materialSchema);
