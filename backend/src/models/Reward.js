const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pointsEarned: { type: Number, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
  category: { 
    type: String, 
    enum: ['segregation_bonus', 'perfect_month', 'community_referral'], 
    default: 'segregation_bonus' 
  }
});

module.exports = mongoose.model('Reward', rewardSchema);
