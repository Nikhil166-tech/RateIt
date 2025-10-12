// Placeholder for admin functions
exports.getDashboard = async (req, res) => {
    try {
        // Get database from app
        const db = req.app.get('db');
        
        // Get admin dashboard statistics
        const userCount = await new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as count FROM Users', (err, row) => {
                if (err) reject(err);
                else resolve(row.count);
            });
        });

        const storeCount = await new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as count FROM Stores', (err, row) => {
                if (err) reject(err);
                else resolve(row.count);
            });
        });

        const ratingCount = await new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as count FROM Ratings', (err, row) => {
                if (err) reject(err);
                else resolve(row.count);
            });
        });

        const recentUsers = await new Promise((resolve, reject) => {
            db.all(`
                SELECT id, name, email, role, created_at 
                FROM Users 
                ORDER BY created_at DESC 
                LIMIT 5
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        const topRatedStores = await new Promise((resolve, reject) => {
            db.all(`
                SELECT id, name, address, average_rating, rating_count
                FROM Stores 
                ORDER BY average_rating DESC 
                LIMIT 5
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        res.json({
            success: true,
            data: {
                stats: {
                    totalUsers: userCount,
                    totalStores: storeCount,
                    totalRatings: ratingCount
                },
                recentUsers,
                topRatedStores,
                message: 'Admin dashboard loaded successfully'
            }
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error loading admin dashboard'
        });
    }
};

// Add more admin functions as needed
exports.getAllUsers = async (req, res) => {
    try {
        const db = req.app.get('db');
        
        const users = await new Promise((resolve, reject) => {
            db.all(`
                SELECT id, name, email, role, created_at 
                FROM Users 
                ORDER BY created_at DESC
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching users'
        });
    }
};

exports.getAllStores = async (req, res) => {
    try {
        const db = req.app.get('db');
        
        const stores = await new Promise((resolve, reject) => {
            db.all(`
                SELECT id, name, address, average_rating, rating_count, created_at 
                FROM Stores 
                ORDER BY created_at DESC
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        res.json({
            success: true,
            data: stores
        });
    } catch (error) {
        console.error('Get all stores error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching stores'
        });
    }
};

exports.createStore = async (req, res) => {
    try {
        const { name, address } = req.body;
        const db = req.app.get('db');

        if (!name || !address) {
            return res.status(400).json({
                success: false,
                message: 'Store name and address are required'
            });
        }

        const result = await new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO Stores (name, address) 
                VALUES (?, ?)
            `, [name, address], function(err) {
                if (err) reject(err);
                else resolve(this);
            });
        });

        res.status(201).json({
            success: true,
            message: 'Store created successfully',
            data: {
                id: result.lastID,
                name,
                address,
                average_rating: 0,
                rating_count: 0
            }
        });
    } catch (error) {
        console.error('Create store error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating store'
        });
    }
};