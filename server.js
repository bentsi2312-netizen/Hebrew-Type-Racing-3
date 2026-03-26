const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Hebrew Typing Game backend is running');
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/send-sms', (req, res) => {
  const phone = String(req.body.phone || '').trim();
  return res.json({ message: 'קוד בדיקה: 123456', phone });
});

app.post('/api/verify-sms', (req, res) => {
  const code = String(req.body.code || '').trim();
  if (code === '123456') {
    return res.json({ message: 'אימות הצליח' });
  }
  return res.status(400).json({ error: 'קוד שגוי' });
});

app.post('/api/send-email', (req, res) => {
  const email = String(req.body.email || '').trim();
  return res.json({ message: 'קוד בדיקה: 123456', email });
});

app.post('/api/verify-email', (req, res) => {
  const code = String(req.body.code || '').trim();
  if (code === '123456') {
    return res.json({ message: 'אימות הצליח' });
  }
  return res.status(400).json({ error: 'קוד שגוי' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on port', PORT);
});
