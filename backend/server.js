require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();

// Database connection
const dbPath = path.join(__dirname, 'database', 'store_rater.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Connected to SQLite database');
        // Enable foreign keys and performance optimizations
        db.run("PRAGMA foreign_keys = ON");
        db.run("PRAGMA journal_mode = WAL");
        db.run("PRAGMA synchronous = NORMAL");
    }
});

// Make db available to all routes
app.set('db', db);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/user', require('./routes/user'));
app.use('/api/owner', require('./routes/owner'));
app.use('/api/debug', require('./routes/debug'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Store Rater Backend is running!',
        timestamp: new Date().toISOString(),
        database: 'SQLite'
    });
});

// 🆕 ENHANCED PERSISTENT DATA ENDPOINTS WITH SQLITE DATABASE

// Get all stores (persistent from database)
app.get('/api/stores', (req, res) => {
    const db = req.app.get('db');
    
    const sql = `
        SELECT s.*, 
               GROUP_CONCAT(DISTINCT sc.name) as categories,
               COUNT(DISTINCT r.id) as total_ratings
        FROM Stores s
        LEFT JOIN StoreCategoryMap scm ON s.id = scm.store_id
        LEFT JOIN StoreCategories sc ON scm.category_id = sc.id
        LEFT JOIN Ratings r ON s.id = r.store_id
        WHERE s.is_active = 1
        GROUP BY s.id
        ORDER BY s.average_rating DESC, s.rating_count DESC
    `;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('❌ Database error fetching stores:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch stores from database'
            });
        }
        
        console.log('📦 Getting persistent stores from database:', rows.length);
        
        // Format the stores properly for frontend
        const stores = rows.map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            address: row.address,
            phone: row.phone,
            website: row.website,
            average_rating: row.average_rating,
            rating_count: row.rating_count,
            featured: Boolean(row.featured),
            categories: row.categories ? row.categories.split(',') : [],
            created_at: row.created_at
        }));
        
        res.json({
            success: true,
            stores: stores
        });
    });
});

// Get store by ID
app.get('/api/stores/:id', (req, res) => {
    const db = req.app.get('db');
    const storeId = parseInt(req.params.id);
    
    const sql = `
        SELECT s.*, 
               GROUP_CONCAT(DISTINCT sc.name) as categories
        FROM Stores s
        LEFT JOIN StoreCategoryMap scm ON s.id = scm.store_id
        LEFT JOIN StoreCategories sc ON scm.category_id = sc.id
        WHERE s.id = ? AND s.is_active = 1
        GROUP BY s.id
    `;
    
    db.get(sql, [storeId], (err, row) => {
        if (err) {
            console.error('❌ Database error fetching store:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch store from database'
            });
        }
        
        if (!row) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }
        
        const store = {
            id: row.id,
            name: row.name,
            description: row.description,
            address: row.address,
            phone: row.phone,
            website: row.website,
            average_rating: row.average_rating,
            rating_count: row.rating_count,
            featured: Boolean(row.featured),
            categories: row.categories ? row.categories.split(',') : [],
            created_at: row.created_at
        };
        
        res.json({
            success: true,
            store: store
        });
    });
});

// Add new store (persistent to database)
app.post('/api/stores', (req, res) => {
    try {
        const { name, description, address = '', phone = '', website = '', categories = [], featured = false } = req.body;
        const db = req.app.get('db');
        
        console.log('🆕 Adding new store to database:', { name, description, address, categories });
        
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: 'Store name and description are required'
            });
        }
        
        db.serialize(() => {
            // Insert the store
            const storeSql = `INSERT INTO Stores (name, description, address, phone, website, featured) 
                             VALUES (?, ?, ?, ?, ?, ?)`;
            
            db.run(storeSql, [name, description, address, phone, website, featured ? 1 : 0], function(err) {
                if (err) {
                    console.error('❌ Database error adding store:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to add store to database'
                    });
                }
                
                const storeId = this.lastID;
                
                // Add categories if provided
                if (categories && categories.length > 0) {
                    categories.forEach(categoryName => {
                        // Get or create category
                        db.get('SELECT id FROM StoreCategories WHERE name = ?', [categoryName], (err, category) => {
                            if (err) {
                                console.error('❌ Error finding category:', err);
                                return;
                            }
                            
                            if (category) {
                                db.run('INSERT OR IGNORE INTO StoreCategoryMap (store_id, category_id) VALUES (?, ?)', 
                                    [storeId, category.id]);
                            }
                        });
                    });
                }
                
                // Get the complete store data
                const getStoreSql = `
                    SELECT s.*, GROUP_CONCAT(DISTINCT sc.name) as categories
                    FROM Stores s
                    LEFT JOIN StoreCategoryMap scm ON s.id = scm.store_id
                    LEFT JOIN StoreCategories sc ON scm.category_id = sc.id
                    WHERE s.id = ?
                    GROUP BY s.id
                `;
                
                db.get(getStoreSql, [storeId], (err, row) => {
                    if (err) {
                        console.error('❌ Error fetching new store:', err);
                        return res.status(500).json({
                            success: false,
                            message: 'Store added but failed to retrieve details'
                        });
                    }
                    
                    const newStore = {
                        id: row.id,
                        name: row.name,
                        description: row.description,
                        address: row.address,
                        phone: row.phone,
                        website: row.website,
                        average_rating: row.average_rating,
                        rating_count: row.rating_count,
                        featured: Boolean(row.featured),
                        categories: row.categories ? row.categories.split(',') : [],
                        created_at: row.created_at
                    };
                
                    console.log('✅ Store added to database successfully. ID:', storeId);
                    res.json({
                        success: true,
                        store: newStore,
                        message: 'Store added successfully'
                    });
                });
            });
        });
        
    } catch (error) {
        console.error('❌ Error adding store:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add store'
        });
    }
});

// Update store (persistent)
app.put('/api/stores/:id', (req, res) => {
    try {
        const storeId = parseInt(req.params.id);
        const { name, description, address, phone, website, featured, categories } = req.body;
        const db = req.app.get('db');
        
        console.log('✏️ Updating store:', storeId, { name, description });
        
        // First check if store exists
        db.get('SELECT id FROM Stores WHERE id = ? AND is_active = 1', [storeId], (err, store) => {
            if (err) {
                console.error('❌ Database error checking store:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Database error'
                });
            }
            
            if (!store) {
                return res.status(404).json({
                    success: false,
                    message: 'Store not found'
                });
            }
            
            // Update store
            const updateSql = `
                UPDATE Stores 
                SET name = COALESCE(?, name),
                    description = COALESCE(?, description),
                    address = COALESCE(?, address),
                    phone = COALESCE(?, phone),
                    website = COALESCE(?, website),
                    featured = COALESCE(?, featured),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            
            db.run(updateSql, [name, description, address, phone, website, featured, storeId], function(err) {
                if (err) {
                    console.error('❌ Database error updating store:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to update store'
                    });
                }
                
                // Get updated store
                const getStoreSql = `
                    SELECT s.*, GROUP_CONCAT(DISTINCT sc.name) as categories
                    FROM Stores s
                    LEFT JOIN StoreCategoryMap scm ON s.id = scm.store_id
                    LEFT JOIN StoreCategories sc ON scm.category_id = sc.id
                    WHERE s.id = ?
                    GROUP BY s.id
                `;
                
                db.get(getStoreSql, [storeId], (err, row) => {
                    if (err) {
                        console.error('❌ Error fetching updated store:', err);
                        return res.status(500).json({
                            success: false,
                            message: 'Store updated but failed to retrieve details'
                        });
                    }
                    
                    const updatedStore = {
                        id: row.id,
                        name: row.name,
                        description: row.description,
                        address: row.address,
                        phone: row.phone,
                        website: row.website,
                        average_rating: row.average_rating,
                        rating_count: row.rating_count,
                        featured: Boolean(row.featured),
                        categories: row.categories ? row.categories.split(',') : [],
                        created_at: row.created_at
                    };
                    
                    console.log('✅ Store updated successfully');
                    res.json({
                        success: true,
                        store: updatedStore,
                        message: 'Store updated successfully'
                    });
                });
            });
        });
        
    } catch (error) {
        console.error('❌ Error updating store:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update store'
        });
    }
});

// Delete store (persistent - soft delete)
app.delete('/api/stores/:id', (req, res) => {
    try {
        const storeId = parseInt(req.params.id);
        const db = req.app.get('db');
        
        console.log('🗑️ Soft deleting store:', storeId);
        
        db.run('UPDATE Stores SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [storeId], function(err) {
            if (err) {
                console.error('❌ Database error deleting store:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to delete store'
                });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Store not found'
                });
            }
            
            console.log('✅ Store soft deleted successfully');
            res.json({
                success: true,
                message: 'Store deleted successfully'
            });
        });
        
    } catch (error) {
        console.error('❌ Error deleting store:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete store'
        });
    }
});

// Get all users (persistent from database)
app.get('/api/users', (req, res) => {
    const db = req.app.get('db');
    
    db.all('SELECT id, name, email, role, address, created_at, last_login FROM Users WHERE is_active = 1 ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            console.error('❌ Database error fetching users:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch users from database'
            });
        }
        
        console.log('👥 Getting persistent users from database:', rows.length);
        
        res.json({
            success: true,
            users: rows
        });
    });
});

// Add new user (persistent to database)
app.post('/api/users', (req, res) => {
    try {
        const { name, email, role = 'user', address = '' } = req.body;
        const db = req.app.get('db');
        
        console.log('🆕 Adding new user to database:', { name, email, role, address });
        
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Name and email are required'
            });
        }
        
        // Check if user already exists
        db.get('SELECT id FROM Users WHERE email = ?', [email], (err, row) => {
            if (err) {
                console.error('❌ Database error checking user:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Database error'
                });
            }
            
            if (row) {
                return res.status(400).json({
                    success: false,
                    message: 'User already exists'
                });
            }
            
            // Insert new user with temporary password
            const sql = `INSERT INTO Users (name, email, role, address, password) 
                         VALUES (?, ?, ?, ?, ?)`;
            
            const tempPassword = 'Temp123!';
            bcrypt.hash(tempPassword, 12, (err, hashedPassword) => {
                if (err) {
                    console.error('❌ Error hashing password:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to create user'
                    });
                }
                
                db.run(sql, [name, email, role, address, hashedPassword], function(err) {
                    if (err) {
                        console.error('❌ Database error adding user:', err);
                        return res.status(500).json({
                            success: false,
                            message: 'Failed to add user to database'
                        });
                    }
                    
                    const newUser = {
                        id: this.lastID,
                        name,
                        email,
                        role,
                        address,
                        created_at: new Date().toISOString()
                    };
                    
                    console.log('✅ User added to database successfully. ID:', this.lastID);
                    res.json({
                        success: true,
                        user: newUser,
                        message: 'User added successfully with temporary password'
                    });
                });
            });
        });
        
    } catch (error) {
        console.error('❌ Error adding user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add user'
        });
    }
});

// Update user (persistent)
app.put('/api/users/:id', (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { name, email, role, address } = req.body;
        const db = req.app.get('db');
        
        console.log('✏️ Updating user:', userId, { name, email, role });
        
        db.get('SELECT id FROM Users WHERE id = ? AND is_active = 1', [userId], (err, user) => {
            if (err) {
                console.error('❌ Database error checking user:', err);
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
            
            // Check if email is being changed and if it already exists
            if (email) {
                db.get('SELECT id FROM Users WHERE email = ? AND id != ?', [email, userId], (err, existingUser) => {
                    if (err) {
                        console.error('❌ Database error checking email:', err);
                        return res.status(500).json({
                            success: false,
                            message: 'Database error'
                        });
                    }
                    
                    if (existingUser) {
                        return res.status(400).json({
                            success: false,
                            message: 'Email already exists'
                        });
                    }
                    
                    updateUser();
                });
            } else {
                updateUser();
            }
            
            function updateUser() {
                const updateSql = `
                    UPDATE Users 
                    SET name = COALESCE(?, name),
                        email = COALESCE(?, email),
                        role = COALESCE(?, role),
                        address = COALESCE(?, address),
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `;
                
                db.run(updateSql, [name, email, role, address, userId], function(err) {
                    if (err) {
                        console.error('❌ Database error updating user:', err);
                        return res.status(500).json({
                            success: false,
                            message: 'Failed to update user'
                        });
                    }
                    
                    // Get updated user
                    db.get('SELECT id, name, email, role, address, created_at FROM Users WHERE id = ?', [userId], (err, row) => {
                        if (err) {
                            console.error('❌ Error fetching updated user:', err);
                            return res.status(500).json({
                                success: false,
                                message: 'User updated but failed to retrieve details'
                            });
                        }
                        
                        console.log('✅ User updated successfully');
                        res.json({
                            success: true,
                            user: row,
                            message: 'User updated successfully'
                        });
                    });
                });
            }
        });
        
    } catch (error) {
        console.error('❌ Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user'
        });
    }
});

// Delete user (persistent - soft delete)
app.delete('/api/users/:id', (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const db = req.app.get('db');
        
        console.log('🗑️ Soft deleting user:', userId);
        
        // Prevent deleting default admin users
        db.get('SELECT email FROM Users WHERE id = ?', [userId], (err, user) => {
            if (err) {
                console.error('❌ Database error checking user:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Database error'
                });
            }
            
            if (user && user.email === 'admin@test.com') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete default admin user'
                });
            }
            
            db.run('UPDATE Users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [userId], function(err) {
                if (err) {
                    console.error('❌ Database error deleting user:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to delete user'
                    });
                }
                
                if (this.changes === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'User not found'
                    });
                }
                
                console.log('✅ User soft deleted successfully');
                res.json({
                    success: true,
                    message: 'User deleted successfully'
                });
            });
        });
        
    } catch (error) {
        console.error('❌ Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user'
        });
    }
});

// 🆕 ENHANCED RATING ENDPOINTS

// Rate a store with proper database integration
app.post('/api/stores/:id/rate', (req, res) => {
    try {
        const storeId = parseInt(req.params.id);
        const { rating, userId, reviewText } = req.body;
        const db = req.app.get('db');
        
        console.log('⭐ Rating store in database:', { storeId, rating, userId, reviewText });
        
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }
        
        // Start transaction for data consistency
        db.serialize(() => {
            // Check if user already rated this store
            db.get('SELECT id, rating FROM Ratings WHERE user_id = ? AND store_id = ?', [userId, storeId], (err, existingRating) => {
                if (err) {
                    console.error('❌ Database error checking existing rating:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Database error'
                    });
                }
                
                const updateStoreRating = (oldRating = null) => {
                    // Get current store data
                    db.get('SELECT * FROM Stores WHERE id = ? AND is_active = 1', [storeId], (err, store) => {
                        if (err) {
                            console.error('❌ Database error fetching store:', err);
                            return res.status(500).json({
                                success: false,
                                message: 'Database error'
                            });
                        }
                        
                        if (!store) {
                            return res.status(404).json({
                                success: false,
                                message: 'Store not found'
                            });
                        }
                        
                        let newCount, newTotal, newAverage;
                        
                        if (oldRating !== null) {
                            // Update existing rating
                            newCount = store.rating_count;
                            newTotal = store.total_rating_value - oldRating + rating;
                            newAverage = newTotal / newCount;
                        } else {
                            // New rating
                            newCount = store.rating_count + 1;
                            newTotal = store.total_rating_value + rating;
                            newAverage = newTotal / newCount;
                        }
                        
                        // Update the store
                        db.run(
                            'UPDATE Stores SET average_rating = ?, rating_count = ?, total_rating_value = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                            [parseFloat(newAverage.toFixed(1)), newCount, newTotal, storeId],
                            function(err) {
                                if (err) {
                                    console.error('❌ Database error updating store:', err);
                                    return res.status(500).json({
                                        success: false,
                                        message: 'Failed to update store rating'
                                    });
                                }
                                
                                // Get updated store with categories
                                const getStoreSql = `
                                    SELECT s.*, GROUP_CONCAT(DISTINCT sc.name) as categories
                                    FROM Stores s
                                    LEFT JOIN StoreCategoryMap scm ON s.id = scm.store_id
                                    LEFT JOIN StoreCategories sc ON scm.category_id = sc.id
                                    WHERE s.id = ?
                                    GROUP BY s.id
                                `;
                                
                                db.get(getStoreSql, [storeId], (err, updatedStoreRow) => {
                                    if (err) {
                                        console.error('❌ Error fetching updated store:', err);
                                        return res.status(500).json({
                                            success: false,
                                            message: 'Rating submitted but failed to retrieve store details'
                                        });
                                    }
                                    
                                    const updatedStore = {
                                        id: updatedStoreRow.id,
                                        name: updatedStoreRow.name,
                                        description: updatedStoreRow.description,
                                        address: updatedStoreRow.address,
                                        phone: updatedStoreRow.phone,
                                        website: updatedStoreRow.website,
                                        average_rating: updatedStoreRow.average_rating,
                                        rating_count: updatedStoreRow.rating_count,
                                        featured: Boolean(updatedStoreRow.featured),
                                        categories: updatedStoreRow.categories ? updatedStoreRow.categories.split(',') : [],
                                        created_at: updatedStoreRow.created_at
                                    };
                                    
                                    console.log('✅ Store rated successfully. New average:', updatedStore.average_rating);
                                    res.json({
                                        success: true,
                                        store: updatedStore,
                                        message: 'Store rated successfully'
                                    });
                                });
                            }
                        );
                    });
                };
                
                if (existingRating) {
                    // Update existing rating
                    db.run(
                        'UPDATE Ratings SET rating = ?, review_text = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                        [rating, reviewText, existingRating.id],
                        function(err) {
                            if (err) {
                                console.error('❌ Database error updating rating:', err);
                                return res.status(500).json({
                                    success: false,
                                    message: 'Failed to update rating'
                                });
                            }
                            updateStoreRating(existingRating.rating);
                        }
                    );
                } else {
                    // Insert new rating
                    db.run(
                        'INSERT INTO Ratings (user_id, store_id, rating, review_text) VALUES (?, ?, ?, ?)',
                        [userId, storeId, rating, reviewText],
                        function(err) {
                            if (err) {
                                console.error('❌ Database error inserting rating:', err);
                                return res.status(500).json({
                                    success: false,
                                    message: 'Failed to add rating'
                                });
                            }
                            updateStoreRating();
                        }
                    );
                }
            });
        });
        
    } catch (error) {
        console.error('❌ Error rating store:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to rate store'
        });
    }
});

// Get store categories
app.get('/api/categories', (req, res) => {
    const db = req.app.get('db');
    
    db.all('SELECT * FROM StoreCategories ORDER BY name', [], (err, rows) => {
        if (err) {
            console.error('❌ Database error fetching categories:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch categories'
            });
        }
        
        res.json({
            success: true,
            categories: rows
        });
    });
});

// Get featured stores
app.get('/api/stores/featured', (req, res) => {
    const db = req.app.get('db');
    
    const sql = `
        SELECT s.*, GROUP_CONCAT(DISTINCT sc.name) as categories
        FROM Stores s
        LEFT JOIN StoreCategoryMap scm ON s.id = scm.store_id
        LEFT JOIN StoreCategories sc ON scm.category_id = sc.id
        WHERE s.featured = 1 AND s.is_active = 1
        GROUP BY s.id
        ORDER BY s.average_rating DESC
        LIMIT 6
    `;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('❌ Database error fetching featured stores:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch featured stores'
            });
        }
        
        const stores = rows.map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            address: row.address,
            phone: row.phone,
            website: row.website,
            average_rating: row.average_rating,
            rating_count: row.rating_count,
            featured: Boolean(row.featured),
            categories: row.categories ? row.categories.split(',') : [],
            created_at: row.created_at
        }));
        
        res.json({
            success: true,
            stores: stores
        });
    });
});

// 404 handler
app.use('*', (req, res) => {
    console.log('❌ 404 - Route not found:', req.originalUrl);
    res.status(404).json({
        success: false,
        message: 'Route not found',
        requestedUrl: req.originalUrl
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('✅ Database connection closed');
        }
        process.exit(0);
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔐 Auth routes: http://localhost:${PORT}/api/auth`);
    console.log(`👤 User routes: http://localhost:${PORT}/api/user`);
    console.log(`🏪 Owner routes: http://localhost:${PORT}/api/owner`);
    console.log(`⚡ Admin routes: http://localhost:${PORT}/api/admin`);
    console.log(`🔍 DEBUG routes: http://localhost:${PORT}/api/debug`);
    console.log(`🆕 ENHANCED PERSISTENT routes:`);
    console.log(`   📦 Stores: http://localhost:${PORT}/api/stores`);
    console.log(`   🌟 Featured: http://localhost:${PORT}/api/stores/featured`);
    console.log(`   👥 Users: http://localhost:${PORT}/api/users`);
    console.log(`   ⭐ Ratings: http://localhost:${PORT}/api/stores/:id/rate`);
    console.log(`   📁 Categories: http://localhost:${PORT}/api/categories`);
    console.log(`\n💾 Database: SQLite (${dbPath})`);
});