require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

pool.query(`CREATE TABLE IF NOT EXISTS links (
  code VARCHAR(8) PRIMARY KEY,
  url TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  lastClicked TIMESTAMP
)`);

function validCode(code) { return /^[A-Za-z0-9]{6,8}$/.test(code); }

app.get('/healthz', (req, res) => {
  res.status(200).json({ ok: true, version: "1.0" });
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/links', async (req, res) => {
  const { url, code } = req.body;
  let linkCode = code;
  if (!url) return res.status(400).json({ success: false, message: "URL required" });
  if (code && !validCode(code)) return res.status(400).json({ success:false, message: "Code invalid" });
  if (!linkCode) linkCode = crypto.randomBytes(4).toString('hex');
  try {
    const ret = await pool.query(
      'INSERT INTO links (code, url) VALUES ($1, $2) ON CONFLICT (code) DO NOTHING RETURNING code',
      [linkCode, url]
    );
    if (!ret.rows.length) return res.status(409).json({ success:false, message:"Custom code already exists!" });
    return res.json({ success:true, code: linkCode });
  } catch (e) {
    return res.status(500).json({ success:false, message:"Database error" });
  }
});

app.get('/api/links', async (req, res) => {
  const result = await pool.query('SELECT code, url, clicks, lastClicked FROM links ORDER BY code');
  // Normalise camelCase for frontend
  const links = result.rows.map(link => ({
    ...link,
    lastClicked: link.lastclicked || link.lastClicked
  }));
  res.json(links);
});

app.get('/api/links/:code', async (req, res) => {
  const { code } = req.params;
  const ret = await pool.query('SELECT * FROM links WHERE code=$1', [code]);
  if (!ret.rows.length) return res.status(404).json({ error: "Not found" });
  const link = ret.rows[0];
  res.json({
    ...link,
    lastClicked: link.lastclicked || link.lastClicked
  });
});

app.delete('/api/links/:code', async (req, res) => {
  await pool.query('DELETE FROM links WHERE code=$1', [req.params.code]);
  res.json({ success:true });
});

app.get('/:code', async (req, res, next) => {
  if (req.path.startsWith('/code/')) return next();
  const { code } = req.params;
  const ret = await pool.query('SELECT url FROM links WHERE code=$1', [code]);
  if (!ret.rows.length) return res.status(404).send("Not found");
  await pool.query('UPDATE links SET clicks = clicks + 1, lastClicked = NOW() WHERE code = $1', [code]);
  res.redirect(ret.rows[0].url);
});

app.get('/code/:code', async (req, res) => {
  const { code } = req.params;
  const ret = await pool.query('SELECT * FROM links WHERE code=$1', [code]);
  let html;
  if (!ret.rows.length) {
    html = `
      <title>TinyLink Stats</title>
      <body style="font-family:sans-serif;background:linear-gradient(120deg, #8A2387 0%, #E94057 60%, #F27121 100%);">
        <div style="background:#fff;border-radius:1rem;padding:2rem;text-align:center;margin-top:5em;max-width:430px;margin-left:auto;margin-right:auto;">
          <h1 style="color:#d72660;">TinyLink Stats</h1>
          <p style="color:#ee7300;">Code <b>${code}</b> not found or deleted.</p>
          <a href="/" style="display:inline-block;margin-top:2em;background:#d72660;padding:.5em 1em;color:#fff;border-radius:.5em;text-decoration:none;">← Back to Dashboard</a>
        </div>
      </body>
    `;
  } else {
    const link = ret.rows[0];
    const lastClicked = link.lastclicked || link.lastClicked;
    html = `
      <title>TinyLink Stats</title>
      <body style="font-family:sans-serif;background:linear-gradient(120deg, #8A2387 0%, #E94057 60%, #F27121 100%);">
        <div style="background:#fff;border-radius:1rem;padding:2.2rem;text-align:center;margin-top:5em;max-width:430px;margin-left:auto;margin-right:auto;">
          <h1 style="color:#d72660;">TinyLink Stats</h1>
          <div style="margin-top:1em;"><b style="color:#ee7300;">Code:</b> ${link.code}</div>
          <div style="margin-top:1em;"><b style="color:#ee7300;">Original URL:</b> <a href="${link.url}" style="color:#5f27cd;" target="_blank">${link.url}</a></div>
          <div style="margin-top:1em;"><b style="color:#ee7300;">Clicks:</b> ${link.clicks}</div>
          <div style="margin-top:1em;"><b style="color:#ee7300;">Last Clicked:</b> ${lastClicked ? new Date(lastClicked).toLocaleString() : '-'}</div>
          <a href="/" style="display:inline-block;margin-top:2em;background:#d72660;padding:.5em 1em;color:#fff;border-radius:.5em;text-decoration:none;">← Back to Dashboard</a>
        </div>
      </body>
    `;
  }
  res.send(html);
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));
