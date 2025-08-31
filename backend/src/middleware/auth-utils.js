const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { pool } = require('../config/database');

// Rate limiting configuration
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many login attempts, please try again later.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests, please try again later.'
  }
});

// Secure token generation
const generateSecureToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const generateTokenHash = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// JWT token creation with secure payload
const createAccessToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    issuer: 'bharat-pashudhan',
    audience: 'bharat-pashudhan-app'
  });
};

const createRefreshToken = () => {
  return generateSecureToken();
};

// Middleware to verify JWT tokens
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'bharat-pashudhan',
      audience: 'bharat-pashudhan-app'
    });

    // Check if session exists and is valid
    const sessionQuery = `
      SELECT s.*, u.id, u.email, u.name, u.role, u.is_active
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.user_id = $1 AND s.expires_at > NOW() AND u.is_active = true
    `;
    
    const sessionResult = await pool.query(sessionQuery, [decoded.userId]);
    
    if (sessionResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session'
      });
    }

    // Update last used timestamp
    await pool.query(
      'UPDATE user_sessions SET last_used = NOW() WHERE user_id = $1',
      [decoded.userId]
    );

    req.user = sessionResult.rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

// Role-based authorization middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Account lockout protection
const checkAccountLockout = async (email) => {
  const result = await pool.query(
    'SELECT failed_login_attempts, locked_until FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    return { isLocked: false };
  }

  const user = result.rows[0];
  const now = new Date();
  
  if (user.locked_until && new Date(user.locked_until) > now) {
    return {
      isLocked: true,
      lockedUntil: user.locked_until
    };
  }

  return { isLocked: false };
};

// Update failed login attempts
const updateFailedAttempts = async (email, success = false) => {
  if (success) {
    await pool.query(
      'UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE email = $1',
      [email]
    );
  } else {
    const result = await pool.query(
      'UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE email = $1 RETURNING failed_login_attempts',
      [email]
    );

    const attempts = result.rows[0]?.failed_login_attempts || 0;
    
    // Lock account after 5 failed attempts
    if (attempts >= 5) {
      const lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      await pool.query(
        'UPDATE users SET locked_until = $1 WHERE email = $2',
        [lockUntil, email]
      );
    }
  }
};

// Audit logging middleware
const auditLog = (action) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id || null;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      await pool.query(
        'INSERT INTO audit_logs (user_id, action, details, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5)',
        [userId, action, JSON.stringify(req.body), ipAddress, userAgent]
      );
    } catch (error) {
      console.error('Audit logging error:', error);
    }
    next();
  };
};

// Session cleanup (remove expired sessions)
const cleanupExpiredSessions = async () => {
  try {
    await pool.query('DELETE FROM user_sessions WHERE expires_at < NOW()');
  } catch (error) {
    console.error('Session cleanup error:', error);
  }
};

// Run cleanup every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);

module.exports = {
  loginLimiter,
  generalLimiter,
  generateSecureToken,
  generateTokenHash,
  createAccessToken,
  createRefreshToken,
  authenticateToken,
  requireRole,
  checkAccountLockout,
  updateFailedAttempts,
  auditLog,
  cleanupExpiredSessions
};
