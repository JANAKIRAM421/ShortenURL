const express = require('express');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const links = {}; // { code: { url, clicks, lastClicked } }

function validCode(code) {
  return /^[A-Za-z0-9]{6,8}$/.test(code);
}

// Homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.json({ ok: true, version: "1.0", uptime: process.uptime() });
});

// List links for dashboard
app.get('/api/links', (req, res) => {
  const list = Object.entries(links).map(([code, data]) => ({ code, ...data }));
  res.json(list);
});

// Create link (supports custom code)
app.post('/api/links', (req, res) => {
  const { url, code: customCode } = req.body;
  let code = customCode;
  if (!url) return res.json({ success: false, message: "URL required" });
  if (code) {
    if (!validCode(code)) return res.status(400).json({ success: false, message: "Code invalid" });
    if (links[code]) return res.status(409).json({ success: false, message: "Code already exists" });
  } else {
    code = crypto.randomBytes(4).toString('hex').substring(0, 6);
    while (links[code]) code = crypto.randomBytes(4).toString('hex').substring(0, 6);
  }
  links[code] = { url, clicks: 0, lastClicked: null };
  res.json({ success: true, code });
});

// Stats page file route
app.get('/code/:code', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'code.html'));
});

// Stats API for one link
app.get('/api/links/:code', (req, res) => {
  const item = links[req.params.code];
  if (!item) return res.status(404).json({ success: false, message: "Code not found" });
  res.json({ code: req.params.code, ...item });
});

// Delete link
app.delete('/api/links/:code', (req, res) => {
  if (!links[req.params.code]) return res.status(404).json({ success: false, message: "Code not found" });
  delete links[req.params.code];
  res.json({ success: true });
});

// Redirect + track click
app.get('/:code', (req, res) => {
  const item = links[req.params.code];
  if (!item) return res.status(404).send("Not found");
  item.clicks++;
  item.lastClicked = new Date();
  res.redirect(item.url);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
