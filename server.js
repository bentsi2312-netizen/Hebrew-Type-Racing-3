const cors = require('cors');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const otpStore = new Map();

const isIsraeliPhone = (phone) => /^(05\d{8}|\+9725\d{8})$/.test(phone || '');
const isEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
const normalizePhone = (phone) => phone.startsWith('+972') ? phone : '+972' + phone.slice(1);
const makeCode = () => Math.floor(100000 + Math.random() * 900000).toString();

app.get('/', (_req, res) => {
  res.send('Hebrew backend is running');
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/send-sms', (req, res) => {
  const phone = String(req.body.phone || '').trim();

  if (!isIsraeliPhone(phone)) {
    return res.status(400).json({ error: 'אנא הזן מספר טלפון ישראלי תקין.' });
  }

  const normalized = normalizePhone(phone);
  const code = makeCode();

  otpStore.set(`sms:${normalized}`, {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000
  });

  return res.json({
    message: `קוד בדיקה: ${code}`
  });
});

app.post('/api/verify-sms', (req, res) => {
  const phone = String(req.body.phone || '').trim();
  const enteredCode = String(req.body.code || '').trim();

  if (!isIsraeliPhone(phone) || !enteredCode) {
    return res.status(400).json({ error: 'פרטים חסרים.' });
  }

  const normalized = normalizePhone(phone);
  const record = otpStore.get(`sms:${normalized}`);

  if (!record || Date.now() > record.expiresAt) {
    return res.status(400).json({ error: 'לא נמצא קוד פעיל או שפג תוקפו.' });
  }

  if (record.code !== enteredCode) {
    return res.status(400).json({ error: 'קוד שגוי.' });
  }

  otpStore.delete(`sms:${normalized}`);

  return res.json({
    message: 'הטלפון אומת בהצלחה!',
    phone: normalized,
    email: null
  });
});

app.post('/api/send-email', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();

  if (!isEmail(email)) {
    return res.status(400).json({ error: 'אנא הזן כתובת אימייל תקינה.' });
  }

  const code = makeCode();

  otpStore.set(`email:${email}`, {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000
  });

  return res.json({
    message: `קוד בדיקה: ${code}`
  });
});

app.post('/api/verify-email', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const enteredCode = String(req.body.code || '').trim();

  if (!isEmail(email) || !enteredCode) {
    return res.status(400).json({ error: 'פרטים חסרים.' });
  }

  const record = otpStore.get(`email:${email}`);

  if (!record || Date.now() > record.expiresAt) {
    return res.status(400).json({ error: 'לא נמצא קוד פעיל או שפג תוקפו.' });
  }

  if (record.code !== enteredCode) {
    return res.status(400).json({ error: 'קוד שגוי.' });
  }

  otpStore.delete(`email:${email}`);

  return res.json({
    message: 'האימייל אומת בהצלחה!',
    phone: null,
    email
  });
});

app.post('/location', (req, res) => {
  const { latitude, longitude } = req.body;

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ error: 'מיקום לא תקין.' });
  }

  return res.json({
    success: true,
    message: 'המיקום נשמר בהצלחה.'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
