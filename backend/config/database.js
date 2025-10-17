const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../database/store_rater.db');

// Create database directory if it doesn't exist
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('📁 Created database directory:', dbDir);
}

const db = new sqlite3.Database(dbPath);

const initDatabase = async () => {
    try {
        console.log('🔄 Initializing database...');

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
                    console.log('✅ Users table created/verified');
                    resolve();
                }
            });
        });

        // Stores table
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
                    console.log('✅ Stores table created/verified');
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
                    console.log('✅ Ratings table created/verified');
                    resolve();
                }
            });
        });

        // Insert default users
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
                        console.log(`✅ Default ${userData.role} user: ${userData.email}`);
                        resolve();
                    }
                });
            });
        }

        // Insert sample stores
        const storeCount = await new Promise((resolve, reject) => {
            db.get(`SELECT COUNT(*) as count FROM Stores`, (err, row) => {
                if (err) reject(err);
                else resolve(row.count);
            });
        });

        if (storeCount === 0) {
            console.log('📝 Creating sample stores...');
            const sampleStores = [
                ['Tech Galaxy', 'Latest gadgets and electronics', '123 Tech Street, Silicon Valley'],
                ['Book Haven', 'Wide collection of books', '456 Library Road, Knowledge City'],
                ['Coffee Shop', 'Fresh coffee and snacks', '789 Brew Street, Morning Town']
            ];
            
            for (const store of sampleStores) {
                await new Promise((resolve, reject) => {
                    db.run(
                        'INSERT INTO Stores (name, description, address) VALUES (?, ?, ?)',
                        store,
                        (err) => {
                            if (err) reject(err);
                            else {
                                console.log(`✅ Added store: ${store[0]}`);
                                resolve();
                            }
                        }
                    );
                });
            }
        } else {
            console.log(`✅ ${storeCount} stores already exist`);
        }

        console.log('\n🎉 Database initialized successfully!');
        console.log('Default credentials:');
        console.log('👑 Admin: admin@test.com / Admin123!');
        console.log('🏪 Owner: owner@test.com / Owner123!'); 
        console.log('👤 User: user@test.com / User123!');

    } catch (error) {
        console.error('❌ Database initialization failed:', error);
    } finally {
        db.close();
    }
};

initDatabase();