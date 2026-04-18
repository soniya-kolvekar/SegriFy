const admin = require('firebase-admin');
const User = require('../models/User');

// Load project ID from env
const projectId = process.env.FIREBASE_PROJECT_ID;

let serviceAccount;
try {
  // Try to load from root or backend folder
  serviceAccount = require('../../firebase-service-account.json');
} catch (e) {
  try {
    serviceAccount = require('../firebase-service-account.json');
  } catch (err) {
    console.warn("⚠️ Firebase service account file not found.");
  }
}

if (!admin.apps.length) {
    try {
        if (serviceAccount) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: serviceAccount.project_id || projectId
            });
            console.log(`✅ Firebase Admin initialized for project: ${serviceAccount.project_id || projectId}`);
        } else if (projectId) {
            admin.initializeApp({
                projectId: projectId
            });
            console.log(`ℹ️ Firebase Admin initialized with Project ID: ${projectId} (No Service Account)`);
        } else {
            console.warn("❌ Firebase Admin could not be initialized: Missing Project ID and Service Account.");
        }
    } catch (e) {
        console.warn("❌ Firebase Admin Initialization Failed:", e.message);
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
    
    if (!user && process.env.NODE_ENV === 'production') {
      return res.status(401).json({ message: 'Unauthorized: User not found in database' });
    }

    req.user = {
      firebaseUid: decodedToken.uid,
      email: decodedToken.email,
      admin: decodedToken.admin || false,
      role: user ? user.role : 'municipal', // Default to municipal for admin accounts or dev
      mongoUser: user
    };
    
    next();
  } catch (error) {
    if (error.code === 'auth/id-token-expired') {
      console.warn('🎫 Firebase Auth: Token expired');
      return res.status(401).json({ message: 'Unauthorized: Token expired', code: 'TOKEN_EXPIRED' });
    }

    // DEVELOPMENT BYPASS: Allow access if we're in dev and no service account is configured
    if (!serviceAccount && process.env.NODE_ENV !== 'production') {
      console.warn("🚧 DEV MODE: Bypassing Firebase Auth because service account is missing.");
      req.user = {
        firebaseUid: 'dev-user-uid',
        email: 'admin@segrify.gov',
        admin: true,
        role: 'municipal'
      };
      return next();
    }
    
    console.error('Firebase Auth Error:', error.message);
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
  // Rely purely on the immutable Custom Claim assigned by Firebase
  if (req.user.admin !== true && req.user.role !== 'municipal') {
    return res.status(403).json({ message: 'Forbidden: Missing Hardcoded Municipal Claims' });
  }

  next();
};

const verifyWorker = (req, res, next) => {
  // Workers, Municipal Admins, or accounts with global Admin claims are allowed
  if (req.user.admin !== true && req.user.role !== 'worker' && req.user.role !== 'municipal') {
    return res.status(403).json({ message: 'Forbidden: Missing Worker Verification' });
  }

  next();
};

module.exports = {
  verifyFirebaseToken,
  checkRole,
  verifyMunicipal,
  verifyWorker
};
