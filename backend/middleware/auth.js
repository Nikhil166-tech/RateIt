const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Access denied. No token provided.' 
            });
        }

        // Accept demo tokens (temporary fix)
        if (token.startsWith('demo-token-')) {
            const userId = token.replace('demo-token-', '');
            req.user = { id: userId || 1 }; // Default to user 1
            return next();
        }

        // Try JWT token
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
            
            // Get user from database
            const db = req.app.get('db');
            db.get(
                'SELECT id, name, email, role FROM Users WHERE id = ?',
                [decoded.userId],
                (err, user) => {
                    if (err || !user) {
                        return res.status(401).json({ 
                            success: false, 
                            message: 'Invalid token. User not found.' 
                        });
                    }

                    req.user = user;
                    next();
                }
            );
        } catch (jwtError) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token.' 
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ 
            success: false, 
            message: 'Token is not valid.' 
        });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. Insufficient permissions.' 
            });
        }
        next();
    };
};

module.exports = { authMiddleware, authorize };