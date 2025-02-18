const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const admin = require('firebase-admin');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

// Initialize Firebase Admin SDK
if (process.env.NODE_ENV === 'production') {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: " {{ YOUR DATABASE URL }} "
  });
} else {
  const serviceAccount = require('./svc-account.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: " {{ YOUR DATABASE URL }} "
  });
}

// Import the User model
const User = require('./models/User');

const userRoutes = require('./routes/userRoutes');
const itemRoutes = require('./routes/itemRoutes');
const miscRoutes = require('./routes/miscRoutes');
// const imageRoutes = require('./routes/imageRoutes');
const { verifyFirebaseToken, generateCsrfToken } = require('./middlewares/auth');

const app = express();

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 1 * 30 * 1000, // ms
  max: 300 // Limit each IP to n requests per windowMs
});

// Apply rate limiting to all requests
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8000', 'https://osrs-trading-app.uc.r.appspot.com', 'https://runetick.com'],
  credentials: true,
}));

app.use(bodyParser.json());
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex'),
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    httpOnly: true,
    maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days
  }
}));

app.get('/api/groot', (req, res) => {
  res.send('I am Groot.');
});

app.post('/api/login', async (req, res) => {
  const idToken = req.body.idToken;
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email;


    // Check if user exists in our database
    let user = await User.findByUid(uid);
    
    if (!user) {
      // First-time login: create user with default settings
      user = await User.createWithDefaults(uid, email);
    }

    req.session.uid = uid; // Store the UID in the session
    res.json({ uid: uid, isNewUser: !user });
  } catch (error) {
    console.error('Error in login process:', error);
    res.status(401).json({ error: 'Unauthorized', details: error.message });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.clearCookie('connect.sid'); // Clear the session cookie
    res.json({ message: 'Logged out successfully' });
  });
});

// Protected route example
app.get('/api/protected', verifyFirebaseToken, (req, res) => {
  res.json({ message: 'This is a protected route', uid: req.user.uid });
});

app.get('/api/live', verifyFirebaseToken, (req, res) => {
  res.json({ epochTime: Date.now() });
});

app.post('/api/verifyToken', async (req, res) => {
  const idToken = req.body.idToken;
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    req.session.uid = uid; // Store the UID in the session
    res.json({ uid: uid });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// User routes
app.use('/api/users', verifyFirebaseToken, userRoutes);
app.use('/api/items', verifyFirebaseToken, itemRoutes);
app.use('/api/misc', verifyFirebaseToken, miscRoutes);
// app.use('/api/image-proxy', verifyFirebaseToken, imageRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
