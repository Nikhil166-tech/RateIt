require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

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

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Store Rater Backend is running!',
        timestamp: new Date().toISOString(),
        database: 'SQLite'
    });
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
                res.json({
                    success: true,
                    tables: tables.map(t => t.name),
                    storeCount: storeCount ? storeCount.count : 0,
                    userCount: userCount ? userCount.count : 0,
                    database: dbPath
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
    console.log(`📦 Stores: https://rateit-backend.onrender.com/api/stores`);
    console.log(`👥 Users: https://rateit-backend.onrender.com/api/users`);
    console.log(`🔍 Debug: https://rateit-backend.onrender.com/api/debug/db`);
});