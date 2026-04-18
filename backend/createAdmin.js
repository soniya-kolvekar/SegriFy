require('dotenv').config();
const mongoose = require('mongoose');
const admin = require('firebase-admin');
const User = require('./src/models/User');

// Load Service Account
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const createMunicipalUser = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const email = 'admin@segrify.gov';
    const password = 'SecurePassword123!';
    const name = 'City Admin';

    // 1. Create User in Firebase
    console.log('Creating Firebase User...');
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: name,
    });
    console.log('Firebase User created with UID:', userRecord.uid);

    // 2. Create User in MongoDB
    console.log('Creating MongoDB record...');
    const newUser = new User({
      firebaseUid: userRecord.uid,
      name: name,
      email: email,
      role: 'municipal',
      qrToken: 'MUNICIPAL_ADMIN_TOKEN' // Ensure uniqueness
    });

    await newUser.save();
    console.log('✅ Success! Municipal User Created!');
    console.log('----------------------------------------------------');
    console.log('You can now log in at the normal /login page using:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
        console.error('Error: This admin email is already registered in Firebase.');
    } else {
        console.error('An error occurred:', error);
    }
    process.exit(1);
  }
};

createMunicipalUser();
