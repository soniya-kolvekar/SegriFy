require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const seedWorker = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    
    const workerData = {
      firebaseUid: "CicqqK6wKsPV0RSjJslknj1P7Wul",
      name: "Field Worker",
      email: "worker@segrify.gov",
      role: "worker",
      points: 0,
      eligibilityStatus: true,
      qrToken: "WORKER_FIELD_TOKEN_7Wul"
    };

    // Upsert the worker
    const user = await User.findOneAndUpdate(
      { email: workerData.email },
      workerData,
      { upsert: true, new: true }
    );

    console.log('✅ Success! Worker Data Seeded/Updated in MongoDB.');
    console.log('Record ID:', user._id);
    console.log('Role:', user.role);
    console.log('----------------------------------------------------');
    console.log('Use this account to access the Worker Dashboard.');
    
    process.exit(0);
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
};

seedWorker();
