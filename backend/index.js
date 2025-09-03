require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let booksCol;
let usersCol;
let _client;
let _server;

function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'missing token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

app.get('/', (req, res) => {
  res.send('📚 Book Tracker API is running. Try GET /api/books');
});

app.get('/api/books', auth, async (req, res) => {
  try {
    const books = await booksCol.find({ userId: req.user.userId }).toArray();
    res.json(books.map(b => ({ ...b, _id: b._id.toString() })));
  } catch (err) {
    console.error('GET /api/books error:', err);
    res.status(500).json({ error: 'internal server error' });
  }
});

app.post('/api/books', auth, async (req, res) => {
  try {
    const { title, author, genre, rating, notes } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'title is required' });
    }
    const newBook = {
      title: title.trim(),
      author: author || '',
      genre: genre || '',
      rating: rating ?? null,
      notes: notes || '',
      userId: req.user.userId
    };
    const r = await booksCol.insertOne(newBook);
    res.status(201).json({ _id: r.insertedId.toString(), ...newBook });
  } catch (err) {
    console.error('POST /api/books error:', err);
    res.status(500).json({ error: 'internal server error' });
  }
});

app.put('/api/books/:id', auth, async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'invalid id' });

    const { title, author, genre, rating, notes } = req.body;
    const update = {};
    if (title !== undefined) update.title = String(title).trim();
    if (author !== undefined) update.author = author;
    if (genre !== undefined) update.genre = genre;
    if (rating !== undefined) {
      const r = Number(rating);
      if (r < 1 || r > 5) return res.status(400).json({ error: 'rating must be 1-5' });
      update.rating = r;
    }
    if (notes !== undefined) update.notes = notes;

    const result = await booksCol.updateOne(
      { _id: new ObjectId(id), userId: req.user.userId },
      { $set: update }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'not found' });
    }

    const b = await booksCol.findOne({ _id: new ObjectId(id) });
    res.json({ ...b, _id: b._id.toString() });
  } catch (e) {
    console.error('PUT /api/books/:id error:', e);
    res.status(500).json({ error: 'internal server error' });
  }
});


app.delete('/api/books/:id', auth, async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'invalid id' });
    }
    const r = await booksCol.deleteOne({ _id: new ObjectId(id), userId: req.user.userId });
    if (r.deletedCount === 0) {
      return res.status(404).json({ error: 'not found' });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/books/:id error:', err);
    res.status(500).json({ error: 'internal server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email, password required' });
    }
    const exists = await usersCol.findOne({ $or: [{ username }, { email }] });
    if (exists) return res.status(409).json({ error: 'user exists' });

    const hash = await bcrypt.hash(password, 10);
    const r = await usersCol.insertOne({ username, email, passwordHash: hash });
    const userId = r.insertedId.toString();
    const token = jwt.sign({ userId, username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { _id: userId, username, email } });
  } catch (e) {
    console.error('register error:', e);
    res.status(500).json({ error: 'internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email, password required' });

    const user = await usersCol.findOne({ email });
    if (!user) return res.status(401).json({ error: 'invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    const token = jwt.sign({ userId: user._id.toString(), username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { _id: user._id.toString(), username: user.username, email: user.email } });
  } catch (e) {
    console.error('login error:', e);
    res.status(500).json({ error: 'internal server error' });
  }
});


async function start() {
  _client = new MongoClient(process.env.MONGO_URI);
  await _client.connect();
  const db = _client.db(process.env.DB_NAME || 'booktracker');
  booksCol = db.collection('books');
  usersCol = db.collection('users');
  if (process.env.NODE_ENV !== 'test') {
    _server = app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
    });
  }
  return { client: _client, server: _server };
}

async function stop() {
  if (_server) {
    await new Promise((res) => _server.close(res));
    _server = null;
  }
  if (_client) {
    await _client.close();
    _client = null;
  }
}

if (process.env.NODE_ENV !== 'test') {
  start().catch(err => console.error(err));
}

module.exports = { app, start, stop };
