const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// בדיקת שרת
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// בדיקה ראשית
app.get('/', (req, res) => {
  res.send('השרת עובד ✅');
});

// הפעלת השרת
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
