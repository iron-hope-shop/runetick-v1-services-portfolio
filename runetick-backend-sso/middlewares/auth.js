const admin = require('firebase-admin');
const crypto = require('crypto');

const verifyFirebaseToken = async (req, res, next) => {
  const idToken = req.headers.authorization && req.headers.authorization.split(' ')[1]; // Extract token from Authorization header
  if (!idToken) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    if (error.status === 429) {
        console.error('Too many requests:', error);
        res.status(429).json({ error: 'Too many requests, please try again later.' });
    } else {
        console.error('Error verifying token:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
  }
};

const generateCsrfToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

// const csrfProtection = (req, res, next) => {
//   const csrfToken = req.headers['x-csrf-token'];
//   if (csrfToken !== req.session.csrfToken) {
//     return res.status(403).json({ error: 'Invalid CSRF token' });
//   }
//   next();
// };

module.exports = { verifyFirebaseToken, generateCsrfToken };
// module.exports = { verifyFirebaseToken, generateCsrfToken, csrfProtection };
