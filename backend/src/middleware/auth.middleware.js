const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET || 'dev-secret-key';

/**
 * Middleware to verify token (Required)
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'Token is required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

/**
 * Middleware to optionally verify token.
 * If a token exists, it verifies it and attaches the user to the request.
 * If not, it just passes through.
 */
const optionalVerifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(); // No token, just continue
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Valid token, add user to request
  } catch (err) {
    // Token is present but invalid. We can choose to ignore and proceed,
    // or handle it. For now, we'll just log a warning and proceed.
    console.warn("Optional token verification failed:", err.message);
  }
  
  next();
};


/**
 * Middleware to check for admin role.
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin permission required.' });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
  optionalVerifyToken
};