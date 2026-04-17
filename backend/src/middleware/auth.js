const admin = require('firebase-admin');
const User = require('../models/User');

// Load your downloaded service account key
// Make sure this file is inside the backend/ folder and is listed in .gitignore!
let serviceAccount;
try {
  serviceAccount = require('../../firebase-service-account.json');
} catch (e) {
  console.warn("Service account file not found. Falling back to default credentials.");
}

if (!admin.apps.length) {
    try {
        admin.initializeApp(serviceAccount ? {
          credential: admin.credential.cert(serviceAccount)
        } : {
            credential: admin.credential.applicationDefault()
        });
    } catch (e) {
        console.warn("Firebase Admin Initialization Warning:", e.message);
    }
}


const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    // Find MongoDB user associated with this Firebase UID
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    req.user = {
      firebaseUid: decodedToken.uid,
      email: decodedToken.email,
      ... (user ? { id: user._id, role: user.role, mongoUser: user } : {})
    };
    
    next();
  } catch (error) {
    console.error('Firebase Auth Error:', error);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Forbidden: No role assigned' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: `Forbidden: Requires one of ${allowedRoles.join(', ')}` });
    }

    next();
  };
};

const verifyMunicipal = (req, res, next) => {
  // First ensure they are actually marked as municipal (or worker, per new rules)
  if (req.user.role !== 'municipal') {
    return res.status(403).json({ message: 'Forbidden: Not a municipal account' });
  }

  // Then enforce the backend-controlled secret
  const secretId = req.headers['x-municipal-id'];
  if (!secretId || secretId !== process.env.MUNICIPAL_SECRET) {
    return res.status(403).json({ message: 'Forbidden: Invalid municipal access signature' });
  }

  next();
};

const verifyWorker = (req, res, next) => {
  if (req.user.role !== 'worker') {
    return res.status(403).json({ message: 'Forbidden: Not a worker account' });
  }

  const secretId = req.headers['x-municipal-id']; // Workers also use municipal infrastructure
  if (!secretId || secretId !== process.env.MUNICIPAL_SECRET) {
    return res.status(403).json({ message: 'Forbidden: Invalid worker access signature' });
  }

  next();
};

module.exports = {
  verifyFirebaseToken,
  checkRole,
  verifyMunicipal,
  verifyWorker
};
