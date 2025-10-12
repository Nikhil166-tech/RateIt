const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const dbPath = path.join(__dirname, '../database/store_rater.db');

// Create database directory if it doesn't exist
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

const initDatabase = async () => {
    try {
        console.log('Initializing database...');

        // Users table
        await new Promise((resolve, reject) => {
            db.run(`
                CREATE TABLE IF NOT EXISTS Users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL CHECK(length(name) >= 2 AND length(name) <= 60),
                    email TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    address TEXT CHECK(length(address) <= 400),
                    role TEXT NOT NULL CHECK(role IN ('admin', 'user', 'owner')),
                    is_active BOOLEAN DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) reject(err);
                else {
                    console.log('✓ Users table created/verified');
                    resolve();
                }
            });
        });

        // Stores table with consistent structure
        await new Promise((resolve, reject) => {
            db.run(`
                CREATE TABLE IF NOT EXISTS Stores (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL CHECK(length(name) >= 2 AND length(name) <= 100),
                    description TEXT NOT NULL CHECK(length(description) <= 500),
                    address TEXT CHECK(length(address) <= 400),
                    average_rating REAL DEFAULT 0,
                    rating_count INTEGER DEFAULT 0,
                    total_rating_value REAL DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) reject(err);
                else {
                    console.log('✓ Stores table created/verified');
                    resolve();
                }
            });
        });

        // Ratings table
        await new Promise((resolve, reject) => {
            db.run(`
                CREATE TABLE IF NOT EXISTS Ratings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    store_id INTEGER NOT NULL,
                    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
                    FOREIGN KEY (store_id) REFERENCES Stores(id) ON DELETE CASCADE,
                    UNIQUE(user_id, store_id)
                )
            `, (err) => {
                if (err) reject(err);
                else {
                    console.log('✓ Ratings table created/verified');
                    resolve();
                }
            });
        });

        // Create indexes
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_users_email ON Users(email)',
            'CREATE INDEX IF NOT EXISTS idx_stores_name ON Stores(name)',
            'CREATE INDEX IF NOT EXISTS idx_ratings_store ON Ratings(store_id)',
            'CREATE INDEX IF NOT EXISTS idx_ratings_user ON Ratings(user_id)'
        ];

        for (const indexSql of indexes) {
            await new Promise((resolve, reject) => {
                db.run(indexSql, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }
        console.log('✓ All indexes created/verified');

        // Insert default users (admin, owner, user)
        const defaultUsers = [
            {
                name: 'System Administrator', 
                email: 'admin@test.com', 
                password: 'Admin123!',
                address: 'Admin Headquarters',
                role: 'admin'
            },
            {
                name: 'Store Owner', 
                email: 'owner@test.com', 
                password: 'Owner123!',
                address: 'Store Owner Address',
                role: 'owner'
            },
            {
                name: 'Normal User', 
                email: 'user@test.com', 
                password: 'User123!',
                address: 'User Home Address',
                role: 'user'
            }
        ];

        for (const userData of defaultUsers) {
            const hashedPassword = await bcrypt.hash(userData.password, 12);
            await new Promise((resolve, reject) => {
                db.run(`
                    INSERT OR IGNORE INTO Users (name, email, password, address, role) 
                    VALUES (?, ?, ?, ?, ?)
                `, [userData.name, userData.email, hashedPassword, userData.address, userData.role], (err) => {
                    if (err) reject(err);
                    else {
                        console.log(`✓ Default ${userData.role} user created/verified: ${userData.email}`);
                        resolve();
                    }
                });
            });
        }

        // Insert sample stores (only if no stores exist)
        const storeCount = await new Promise((resolve, reject) => {
            db.get(`SELECT COUNT(*) as count FROM Stores`, (err, row) => {
                if (err) reject(err);
                else resolve(row.count);
            });
        });

        if (storeCount === 0) {
            console.log('Creating sample stores...');
            const sampleStores = [
                {
                    name: "Tech Store",
                    description: "Latest gadgets and electronics",
                    address: "123 Tech Street, Silicon Valley",
                    average_rating: 4.5,
                    rating_count: 10,
                    total_rating_value: 45
                },
                {
                    name: "Book Haven", 
                    description: "Wide collection of books",
                    address: "456 Library Road, Knowledge City",
                    average_rating: 4.2,
                    rating_count: 8,
                    total_rating_value: 33.6
                },
                {
                    name: "Coffee Shop",
                    description: "Fresh coffee and snacks", 
                    address: "789 Brew Street, Morning Town",
                    average_rating: 4.7,
                    rating_count: 15,
                    total_rating_value: 70.5
                },
                {
                    name: "Fashion Boutique",
                    description: "Trendy clothes and accessories",
                    address: "321 Style Avenue, Fashion District",
                    average_rating: 4.3,
                    rating_count: 12,
                    total_rating_value: 51.6
                },
                {
                    name: "Sports Equipment",
                    description: "All your sports gear needs",
                    address: "654 Fitness Road, Active City",
                    average_rating: 4.1,
                    rating_count: 9,
                    total_rating_value: 36.9
                }
            ];

            let storesInserted = 0;
            for (const store of sampleStores) {
                await new Promise((resolve, reject) => {
                    db.run(`
                        INSERT INTO Stores (name, description, address, average_rating, rating_count, total_rating_value) 
                        VALUES (?, ?, ?, ?, ?, ?)
                    `, [store.name, store.description, store.address, store.average_rating, store.rating_count, store.total_rating_value], (err) => {
                        if (err) reject(err);
                        else {
                            storesInserted++;
                            resolve();
                        }
                    });
                });
            }
            console.log(`✓ ${storesInserted} sample stores created`);
        } else {
            console.log(`✓ ${storeCount} stores already exist in database`);
        }

        console.log('\n🎉 Database initialized successfully!');
        console.log('Default credentials:');
        console.log('👑 Admin: admin@test.com / Admin123!');
        console.log('🏪 Owner: owner@test.com / Owner123!'); 
        console.log('👤 User: user@test.com / User123!');
        console.log('\nRun: npm run dev to start the server');

    } catch (error) {
        console.error('❌ Database initialization failed:', error);
    } finally {
        db.close();
    }
};

initDatabase();