const express = require('express');
const cors = require('cors');
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(express.json());

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhone) {
  console.error('Missing Twilio environment variables');
}

const client = twilio(accountSid, authToken);
const otpStore = new Map();

function isIsraeliPhone(phone) {
  return /^(05\d{8}|\+9725\d{8})$/.test(phone || '');
}

function normalizePhone(phone) {
  const p = String(phone || '').trim();
  if (p.startsWith('+972')) return p;
  if (p.startsWith('05')) return '+972' + p.slice(1);
  return p;
}

function makeCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

app.get('/', (_req, res) => {
  res.send('Hebrew Typing Game backend is running');
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/send-sms', async (req, res) => {
  try {
    const phone = String(req.body.phone || '').trim();

    if (!isIsraeliPhone(phone)) {
      return res.status(400).json({ error: 'אנא הזן מספר טלפון ישראלי תקין.' });
    }

    const normalizedPhone = normalizePhone(phone);
    const code = makeCode();

    otpStore.set(normalizedPhone, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000
    });

    await client.messages.create({
      body: `קוד האימות שלך הוא: ${code}`,
      from: twilioPhone,
      to: normalizedPhone
    });

    return res.json({
      message: 'נשלח קוד אימות לטלפון שלך'
    });
  } catch (error) {
    console.error('send-sms error:', error);
    return res.status(500).json({
      error: 'שליחת ה-SMS נכשלה'
    });
  }
});

app.post('/api/verify-sms', (req, res) => {
  try {
    const phone = String(req.body.phone || '').trim();
    const code = String(req.body.code || '').trim();

    if (!isIsraeliPhone(phone)) {
      return res.status(400).json({ error: 'מספר טלפון לא תקין.' });
    }

    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: 'קוד אימות לא תקין.' });
    }

    const normalizedPhone = normalizePhone(phone);
    const record = otpStore.get(normalizedPhone);

    if (!record) {
      return res.status(400).json({ error: 'לא נמצא קוד. בקש קוד חדש.' });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(normalizedPhone);
      return res.status(400).json({ error: 'תוקף הקוד פג. בקש קוד חדש.' });
    }

    if (record.code !== code) {
      return res.status(400).json({ error: 'קוד שגוי.' });
    }

    otpStore.delete(normalizedPhone);

    return res.json({
      message: 'האימות הצליח'
    });
  } catch (error) {
    console.error('verify-sms error:', error);
    return res.status(500).json({ error: 'האימות נכשל' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
