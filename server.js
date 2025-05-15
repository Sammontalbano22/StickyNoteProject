// ─── Environment Variables ──────────────────────
require('dotenv').config({ path: 'public/.env' });

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
app.post('/save-goal', verifyUser, async (req, res) => {
  try {
    const { goal } = req.body;
    if (!goal) return res.status(400).json({ error: 'Missing goal' });

    await db.collection('users')
      .doc(req.uid)
      .collection('goals')
      .add({
        text: goal,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/get-goals', verifyUser, async (req, res) => {
  try {
    const snapshot = await db.collection('users')
      .doc(req.uid)
      .collection('goals')
      .orderBy('createdAt', 'desc')
      .get();

    const goals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ goals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/delete-goal/:goalId', verifyUser, async (req, res) => {
  const { goalId } = req.params;
  try {
    const milestoneSnap = await db.collection('users')
      .doc(req.uid)
      .collection('goals')
      .doc(goalId)
      .collection('milestones')
      .get();

    const batch = db.batch();
    milestoneSnap.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    await db.collection('users')
      .doc(req.uid)
      .collection('goals')
      .doc(goalId)
      .delete();

    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Milestones Routes ──────────────────────────
app.post('/add-milestone', verifyUser, async (req, res) => {
  try {
    const { milestone, goalId } = req.body;
    if (!milestone || !goalId) {
      return res.status(400).json({ error: 'Missing milestone or goalId' });
    }

    const milestoneRef = await db.collection('users')
      .doc(req.uid)
      .collection('goals')
      .doc(goalId)
      .collection('milestones')
      .add({
        text: milestone,
        goalId,
        checked: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

    res.json({ status: 'ok', id: milestoneRef.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/milestones/:goalId', verifyUser, async (req, res) => {
  try {
    const { goalId } = req.params;
    const snapshot = await db.collection('users')
      .doc(req.uid)
      .collection('goals')
      .doc(goalId)
      .collection('milestones')
      .orderBy('createdAt', 'asc')
      .get();

    const milestones = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ milestones });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/milestone/:goalId/:milestoneId', verifyUser, async (req, res) => {
  try {
    const { goalId, milestoneId } = req.params;
    const { checked } = req.body;

    await db.collection('users')
      .doc(req.uid)
      .collection('goals')
      .doc(goalId)
      .collection('milestones')
      .doc(milestoneId)
      .update({ checked });

    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/milestone/:goalId/:milestoneId', verifyUser, async (req, res) => {
  const { goalId, milestoneId } = req.params;
  try {
    await db.collection('users')
      .doc(req.uid)
      .collection('goals')
      .doc(goalId)
      .collection('milestones')
      .doc(milestoneId)
      .delete();

    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Journal Routes ─────────────────────────────
app.post('/add-entry', verifyUser, async (req, res) => {
  try {
    const { goal, milestone, response, date } = req.body;
    if (!goal || !response || !date) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    await db.collection('users')
      .doc(req.uid)
      .collection('journal')
      .add({
        goal,
        milestone: milestone || null,
        response,
        date,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/journal', verifyUser, async (req, res) => {
  try {
    const snapshot = await db.collection('users')
      .doc(req.uid)
      .collection('journal')
      .orderBy('createdAt', 'desc')
      .get();

    const entries = snapshot.docs.map(doc => doc.data());
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── AI Steps Generator ─────────────────────────
app.post('/generate-steps', async (req, res) => {
  const { goal } = req.body;
  if (!goal) {
    return res.status(400).json({ error: 'Goal text is required' });
  }

  const prompt = `
You are a goal planning assistant. The user wants to accomplish this long-term goal:

"${goal}"

Break this goal down into 3–5 small, actionable short-term steps they can start working on this week. Make each step clear and specific.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300
    });

    const responseText = completion.choices[0].message.content;
    const steps = responseText.split('\n').filter(line => line.trim().length > 0);

    res.json({ steps });
  } catch (err) {
    console.error("❌ OpenAI Error:", err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});


// ─── Serve Static Frontend ──────────────────────
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  app.use(express.static(path.join(__dirname)));
});

// ─── Start Server ───────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});