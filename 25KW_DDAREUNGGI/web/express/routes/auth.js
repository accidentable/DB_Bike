const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db/pg');

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body || {};
    if (!username || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    const hashed = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO members (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING member_id, username, email, role',
      [username, email, hashed, 'user']
    );
    const member = result.rows[0];
    const token = jwt.sign({ memberId: member.member_id }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
    return res.json({ token, member });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ message: 'Username or email already exists' });
    return res.status(500).json({ message: 'Signup failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ message: 'Missing fields' });
    const result = await query('SELECT member_id, username, email, password, role FROM members WHERE username = $1', [username]);
    if (result.rowCount === 0) return res.status(401).json({ message: 'Invalid credentials' });
    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ memberId: user.member_id }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
    delete user.password;
    return res.json({ token, member: user });
  } catch (e) {
    return res.status(500).json({ message: 'Login failed' });
  }
});

module.exports = router;


