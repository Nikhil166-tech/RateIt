require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const app = express();

// Database connection
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/opt/render/project/src/backend/database/store_rater.db'
  : path.join(__dirname, 'database', 'store_rater.db');

// Create database directory if it doesn't exist
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('📁 Created database directory:', dbDir);
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Connected to SQLite database:', dbPath);
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Base API route
app.get('/api/', (req, res) => {
    res.json({
        success: true,
        message: 'Store Rater API is running!',
        version: '1.0.0',
        endpoints: {
            auth: {
                login: 'POST /api/auth/login',
                register: 'POST /api/auth/register',
                profile: 'GET /api/auth/me/:userId'
            },
            users: 'GET /api/users',
            stores: 'GET /api/stores',
            ratings: 'GET /api/ratings',
            health: 'GET /api/health',
            debug: 'GET /api/debug/db'
        }
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Store Rater Backend is running!',
        timestamp: new Date().toISOString(),
        database: 'SQLite'
    });
});

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required'
        });
    }

    console.log('🔐 Login attempt for:', email);

    try {
        // Find user by email
        db.get(
            'SELECT * FROM Users WHERE email = ? AND is_active = 1',
            [email],
            async (err, user) => {
                if (err) {
                    console.error('❌ Database error in login:', err.message);
                    return res.status(500).json({
                        success: false,
                        message: 'Database error'
                    });
                }

                if (!user) {
                    console.log('❌ User not found:', email);
                    return res.status(401).json({
                        success: false,
                        message: 'Invalid email or password'
                    });
                }

                // Check password
                const isPasswordValid = await bcrypt.compare(password, user.password);
                
                if (!isPasswordValid) {
                    console.log('❌ Invalid password for:', email);
                    return res.status(401).json({
                        success: false,
                        message: 'Invalid email or password'
                    });
                }

                // Update last login
                db.run(
                    'UPDATE Users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
                    [user.id]
                );

                // Return user data (without password)
                const { password: _, ...userWithoutPassword } = user;
                
                console.log('✅ Login successful for:', email, 'Role:', user.role);
                res.json({
                    success: true,
                    message: 'Login successful',
                    user: userWithoutPassword
                });
            }
        );
    } catch (error) {
        console.error('❌ Server error in login:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// User registration route
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, address } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Name, email, and password are required'
        });
    }

    console.log('👤 Registration attempt for:', email);

    try {
        // Check if user already exists
        db.get(
            'SELECT id FROM Users WHERE email = ?',
            [email],
            async (err, existingUser) => {
                if (err) {
                    console.error('❌ Database error in registration:', err.message);
                    return res.status(500).json({
                        success: false,
                        message: 'Database error'
                    });
                }

                if (existingUser) {
                    console.log('❌ User already exists:', email);
                    return res.status(409).json({
                        success: false,
                        message: 'User already exists with this email'
                    });
                }

                // Hash password
                const hashedPassword = await bcrypt.hash(password, 12);

                // Create new user
                db.run(
                    `INSERT INTO Users (name, email, password, address, role) 
                     VALUES (?, ?, ?, ?, 'user')`,
                    [name, email, hashedPassword, address || null],
                    function(err) {
                        if (err) {
                            console.error('❌ Failed to create user:', err.message);
                            return res.status(500).json({
                                success: false,
                                message: 'Failed to create user'
                            });
                        }

                        // Get the created user
                        db.get(
                            'SELECT id, name, email, role, address FROM Users WHERE id = ?',
                            [this.lastID],
                            (err, newUser) => {
                                if (err) {
                                    console.error('❌ Failed to retrieve created user:', err.message);
                                    return res.status(500).json({
                                        success: false,
                                        message: 'Failed to retrieve created user'
                                    });
                                }

                                console.log('✅ User registered successfully:', email);
                                res.status(201).json({
                                    success: true,
                                    message: 'User registered successfully',
                                    user: newUser
                                });
                            }
                        );
                    }
                );
            }
        );
    } catch (error) {
        console.error('❌ Server error in registration:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});

// Get user profile
app.get('/api/auth/me/:userId', (req, res) => {
    const userId = req.params.userId;
    
    db.get(
        'SELECT id, name, email, role, address, last_login, created_at FROM Users WHERE id = ?',
        [userId],
        (err, user) => {
            if (err) {
                console.error('❌ Database error in profile:', err.message);
                return res.status(500).json({
                    success: false,
                    message: 'Database error'
                });
            }

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                user: user
            });
        }
    );
});

// Simple stores endpoint - BASIC QUERY
app.get('/api/stores', (req, res) => {
    console.log('📋 Fetching stores from database...');
    
    const sql = `SELECT * FROM Stores`;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('❌ Database error in /api/stores:', err.message);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch stores: ' + err.message
            });
        }
        
        console.log('✅ Successfully fetched stores:', rows.length);
        
        res.json({
            success: true,
            stores: rows,
            count: rows.length
        });
    });
});

// Simple users endpoint - BASIC QUERY
app.get('/api/users', (req, res) => {
    console.log('👥 Fetching users from database...');
    
    const sql = `SELECT id, name, email, role FROM Users`;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('❌ Database error in /api/users:', err.message);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch users: ' + err.message
            });
        }
        
        console.log('✅ Successfully fetched users:', rows.length);
        
        res.json({
            success: true,
            users: rows,
            count: rows.length
        });
    });
});

// Ratings endpoint
app.get('/api/ratings', (req, res) => {
    console.log('⭐ Fetching ratings from database...');
    
    const sql = `SELECT * FROM Ratings`;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('❌ Database error in /api/ratings:', err.message);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch ratings: ' + err.message
            });
        }
        
        console.log('✅ Successfully fetched ratings:', rows.length);
        
        res.json({
            success: true,
            ratings: rows,
            count: rows.length
        });
    });
});

// Create new rating
app.post('/api/ratings', (req, res) => {
    const { user_id, store_id, rating, review_text } = req.body;
    
    if (!user_id || !store_id || !rating) {
        return res.status(400).json({
            success: false,
            message: 'User ID, Store ID, and rating are required'
        });
    }
    
    console.log('⭐ Creating new rating:', { user_id, store_id, rating });
    
    const sql = `INSERT INTO Ratings (user_id, store_id, rating, review_text) VALUES (?, ?, ?, ?)`;
    
    db.run(sql, [user_id, store_id, rating, review_text || null], function(err) {
        if (err) {
            console.error('❌ Database error creating rating:', err.message);
            return res.status(500).json({
                success: false,
                message: 'Failed to create rating: ' + err.message
            });
        }
        
        console.log('✅ Rating created successfully, ID:', this.lastID);
        
        res.status(201).json({
            success: true,
            message: 'Rating created successfully',
            rating_id: this.lastID
        });
    });
});

// Debug endpoint to check database
app.get('/api/debug/db', (req, res) => {
    console.log('🔍 Checking database...');
    
    // Get all tables
    db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
        if (err) {
            return res.json({ 
                success: false,
                error: err.message 
            });
        }
        
        // Try to count stores
        db.get("SELECT COUNT(*) as count FROM Stores", [], (err, storeCount) => {
            // Try to count users
            db.get("SELECT COUNT(*) as count FROM Users", [], (err, userCount) => {
                // Try to count ratings
                db.get("SELECT COUNT(*) as count FROM Ratings", [], (err, ratingCount) => {
                    res.json({
                        success: true,
                        tables: tables.map(t => t.name),
                        storeCount: storeCount ? storeCount.count : 0,
                        userCount: userCount ? userCount.count : 0,
                        ratingCount: ratingCount ? ratingCount.count : 0,
                        database: dbPath
                    });
                });
            });
        });
    });
});

// 404 handler
app.use('*', (req, res) => {
    console.log('❌ 404 - Route not found:', req.originalUrl);
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`💚 Health: https://rateit-backend.onrender.com/api/health`);
    console.log(`🔐 Auth: https://rateit-backend.onrender.com/api/auth/login`);
    console.log(`📦 Stores: https://rateit-backend.onrender.com/api/stores`);
    console.log(`👥 Users: https://rateit-backend.onrender.com/api/users`);
    console.log(`🔍 Debug: https://rateit-backend.onrender.com/api/debug/db`);
});