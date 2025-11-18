const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const Database = require('better-sqlite3');
const { nanoid } = require('nanoid');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const PORT = process.env.PORT || 4000;

// uploads dir
const UP = path.join(__dirname, 'uploads');
if (!fs.existsSync(UP)) fs.mkdirSync(UP);

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, UP); },
  filename: function (req, file, cb) {
    const id = nanoid(8);
    const ext = path.extname(file.originalname);
    cb(null, id + ext);
  }
});
const upload = multer({ storage });

// DB
const dbFile = path.join(__dirname, 'data.db');
const db = new Database(dbFile);
db.exec(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE,
  password TEXT
);`);
db.exec(`CREATE TABLE IF NOT EXISTS beats (
  id INTEGER PRIMARY KEY,
  owner INTEGER,
  name TEXT,
  filename TEXT,
  created_at TEXT,
  FOREIGN KEY(owner) REFERENCES users(id)
);`);

// helpers
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({error:'missing token'});
  const token = auth.split(' ')[1];
  try {
    const data = jwt.verify(token, SECRET);
    req.user = data;
    next();
  } catch(e) { return res.status(401).json({error:'invalid token'}); }
}

// routes
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({error:'missing fields'});
  const hashed = await bcrypt.hash(password, 10);
  try {
    const stmt = db.prepare('INSERT INTO users (email,password) VALUES (?,?)');
    const info = stmt.run(email, hashed);
    const token = jwt.sign({id: info.lastInsertRowid, email}, SECRET);
    res.json({token});
  } catch(e) {
    res.status(400).json({error:'user exists or invalid'});
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({error:'missing fields'});
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!row) return res.status(400).json({error:'invalid'});
  const ok = await bcrypt.compare(password, row.password);
  if (!ok) return res.status(400).json({error:'invalid'});
  const token = jwt.sign({id: row.id, email}, SECRET);
  res.json({token});
});

app.post('/api/upload', authMiddleware, upload.single('beat'), (req, res) => {
  const name = req.body.name || req.file.originalname;
  const filename = req.file.filename;
  const owner = req.user.id;
  const stmt = db.prepare('INSERT INTO beats (owner,name,filename,created_at) VALUES (?,?,?,datetime('now'))');
  const info = stmt.run(owner, name, filename);
  res.json({id: info.lastInsertRowid, name, filename});
});

app.get('/api/my-beats', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT id,name,filename,created_at FROM beats WHERE owner = ? ORDER BY id DESC').all(req.user.id);
  res.json(rows);
});

app.get('/uploads/:file', (req,res) => {
  const f = path.join(UP, req.params.file);
  if (fs.existsSync(f)) return res.sendFile(f);
  res.status(404).send('Not found');
});

app.get('/api/beat/:id', (req,res) => {
  const row = db.prepare('SELECT b.id,b.name,b.filename,u.email as owner FROM beats b JOIN users u ON u.id = b.owner WHERE b.id = ?').get(req.params.id);
  if (!row) return res.status(404).json({error:'not found'});
  res.json(row);
});

app.listen(PORT, () => console.log('Server running on', PORT));
