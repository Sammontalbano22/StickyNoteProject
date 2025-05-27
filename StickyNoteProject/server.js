// ─── Environment Variables ──────────────────────
require('dotenv').config({ path: '.env' });

const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const OpenAI = require('openai');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// ─── Firebase Admin Setup ───────────────────────
admin.initializeApp({
  credential: admin.credential.cert(require('./auth.json'))
});
const db = admin.firestore();

// ─── OpenAI Setup ───────────────────────────────
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ─── Auth Middleware ────────────────────────────
async function verifyUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = await admin.auth().verifyIdToken(token);
    req.uid = decoded.uid;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ─── Goal Routes ────────────────────────────────
app.post('/save-goal', verifyUser, async (req, res) => {});

app.get('/get-goals', verifyUser, async (req, res) => {});

app.delete('/delete-goal/:goalId', verifyUser, async (req, res) => {});

// ─── Milestones Routes ──────────────────────────
app.post('/add-milestone', verifyUser, async (req, res) => {});

app.get('/milestones/:goalId', verifyUser, async (req, res) => {});

app.patch('/milestone/:goalId/:milestoneId', verifyUser, async (req, res) => {});

app.delete('/milestone/:goalId/:milestoneId', verifyUser, async (req, res) => {});

// ─── Journal Routes ─────────────────────────────
app.post('/add-entry', verifyUser, async (req, res) => {});

app.get('/journal', verifyUser, async (req, res) => {});

// ─── AI Steps Generator ─────────────────────────
app.post('/generate-steps', async (req, res) => {});

// ─── Serve Static Frontend ──────────────────────
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  app.use(express.static(path.join(__dirname)));
});

// ─── Start Server ───────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
