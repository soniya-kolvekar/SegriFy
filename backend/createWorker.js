require('dotenv').config();
const mongoose = require('mongoose');
const admin = require('firebase-admin');
const User = require('./src/models/User');

// Load Service Account
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const createFieldWorker = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const email = 'worker@segrify.gov';
    const password = 'workerissad';
    const name = 'Field Worker (Demo)';

    console.log('Checking if user already exists in Firebase...');
    try {
      const existingUser = await admin.auth().getUserByEmail(email);
      console.log('User already exists in Firebase. Updating record in MongoDB...');
      
      let dbUser = await User.findOne({ email });
      if (!dbUser) {
        dbUser = new User({
          firebaseUid: existingUser.uid,
          name: name,
          email: email,
          role: 'worker',
          qrToken: `WORKER-${existingUser.uid.slice(-5)}`
        });
        await dbUser.save();
      } else {
        dbUser.role = 'worker';
        await dbUser.save();
      }
      console.log('✅ MongoDB record synchronized.');
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        console.log('Creating new Firebase User...');
        const userRecord = await admin.auth().createUser({
          email: email,
          password: password,
          displayName: name,
        });

        console.log('Creating MongoDB record...');
        const newUser = new User({
          firebaseUid: userRecord.uid,
          name: name,
          email: email,
          role: 'worker',
          qrToken: `WORKER-${userRecord.uid.slice(-5)}`
        });
        await newUser.save();
        console.log('✅ Success! Field Worker Created!');
      } else {
        throw err;
      }
    }

    console.log('----------------------------------------------------');
    console.log('You can now log in using:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
};

createFieldWorker();
