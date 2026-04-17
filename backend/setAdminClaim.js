require('dotenv').config();
const admin = require('firebase-admin');

// Load Service Account
const serviceAccount = require('./firebase-service-account.json');

if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
}

const setUserAsAdmin = async (email) => {
  try {
    // 1. Get User by Email
    const user = await admin.auth().getUserByEmail(email);
    
    // 2. Set Custom Claims
    const currentClaims = user.customClaims || {};
    await admin.auth().setCustomUserClaims(user.uid, {
        ...currentClaims,
        admin: true,
        role: 'municipal'
    });

    console.log(`✅ Success! The user ${email} is now a hardcoded Municipal Admin.`);
    console.log('Firebase Custom Claims have been successfully assigned.');
    console.log('Note: The user must log out and log back in to refresh their secure token wrapper!');
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
        console.error(`❌ Error: No Firebase user exists with the email "${email}". Please ensure they signed up first.`);
    } else {
        console.error('❌ An error occurred:', error);
    }
    process.exit(1);
  }
};

const targetEmail = process.argv[2];

if (!targetEmail) {
    console.error('Usage: node setAdminClaim.js <user-email>');
    process.exit(1);
}

setUserAsAdmin(targetEmail);
