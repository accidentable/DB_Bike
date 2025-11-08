// src/api/auth.routes.js
//  (로그인, 회원가입, 로그아웃)

const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');

/**
 * POST /api/auth/login
 * 로그인 API
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/auth/signup
 * 회원가입 API
 */
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, phone, studentId } = req.body;
    const newUser = await authService.signup(username, email, password, phone, studentId);
    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;