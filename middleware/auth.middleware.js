const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // 1. Get token from header
  const authHeader = req.headers['authorization'];
  
  // Debug headers
  console.log('Auth headers received:', req.headers);
  
  // 2. Check if token exists
  if (!authHeader) {
    return res.status(401).json({ 
      success: false,
      message: 'Authorization header is required'
    });
  }

  // 3. Extract token (Bearer <token>)
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Bearer token is required'
    });
  }
  
  console.log('Token received:', token.substring(0, 20) + '...');
  
  // Try to decode the token payload for debugging (without verification)
  try {
    const decoded = jwt.decode(token);
    console.log('Decoded token payload:', decoded);
  } catch (err) {
    console.error('Error decoding token:', err);
  }

  // 4. Verify token
  // Use JWT_SECRET with fallback for development (same as in login function)
  const jwtSecret = process.env.JWT_SECRET || '123xyz';
  console.log('Using JWT secret:', jwtSecret ? '[SECRET AVAILABLE]' : '[SECRET MISSING]');
  
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      console.error('Token verification error:', err);
      
      let message = 'Invalid token';
      
      // More specific error messages
      if (err.name === 'TokenExpiredError') {
        message = 'Token has expired';
      } else if (err.name === 'JsonWebTokenError') {
        message = 'Malformed token';
      }
      
      return res.status(403).json({ 
        success: false,
        message,
        error: err.message
      });
    }

    // 5. Attach decoded user to request
    console.log('Token verified successfully for user:', decoded.id);
    req.user = {
      id: decoded.id,       // Standardized property names
      role: decoded.role    // Always use consistent naming
    };
    
    next();
  });
};

module.exports = { verifyToken };