const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

/*
 * Backend for Hebrew Typing Game
 *
 * This server exposes a simple endpoint to accept geolocation data
 * from players after they log in. In a real production environment,
 * you should authenticate users (e.g. via Firebase Auth) and
 * associate the location with the authenticated user. Do not send
 * location or personal data without explicit user permission.
 */

// Firestore setup (optional). To enable persistence, provide your own
// service account key in serviceAccountKey.json and uncomment these lines.
// const admin = require('firebase-admin');
// const serviceAccount = require('./serviceAccountKey.json');
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
// const db = admin.firestore();

/**
 * POST /location
 * Receives { latitude, longitude } and stores it in Firestore or logs.
 */
app.post('/location', async (req, res) => {
  const { latitude, longitude } = req.body;
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ success: false, error: 'Invalid location data' });
  }
  try {
    // Uncomment below to save to Firestore when configured
    // const docRef = db.collection('players').doc();
    // await docRef.set({
    //   latitude,
    //   longitude,
    //   updatedAt: admin.firestore.FieldValue.serverTimestamp()
    // });

    // For demonstration, we log the location to the console
    console.log('Received location:', latitude, longitude);
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Fallback route
app.get('/', (req, res) => {
  res.send('Hebrew Typing Game backend is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});