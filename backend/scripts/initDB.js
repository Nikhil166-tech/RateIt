const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

// Use simple relative path for Render compatibility
const dbPath = './store_rater.db';

console.log('🔄 Initializing database at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    }
    console.log('✅ Connected to SQLite database');
});

const initDatabase = async () => {
    try {
        console.log('🔄 Initializing database with enhanced dummy data...');

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
                    last_login DATETIME,
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

        // Stores table with all required columns - DROP AND RECREATE
        await new Promise((resolve, reject) => {
            db.run(`DROP TABLE IF EXISTS Stores`, (err) => {
                if (err) reject(err);
                else {
                    console.log('✅ Old Stores table dropped');
                    db.run(`
                        CREATE TABLE Stores (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            name TEXT NOT NULL CHECK(length(name) >= 2 AND length(name) <= 100),
                            description TEXT NOT NULL CHECK(length(description) <= 500),
                            address TEXT CHECK(length(address) <= 400),
                            phone TEXT,
                            website TEXT,
                            average_rating REAL DEFAULT 0,
                            rating_count INTEGER DEFAULT 0,
                            total_rating_value REAL DEFAULT 0,
                            featured BOOLEAN DEFAULT 0,
                            is_active BOOLEAN DEFAULT 1,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                        )
                    `, (err) => {
                        if (err) reject(err);
                        else {
                            console.log('✅ New Stores table created with all columns');
                            resolve();
                        }
                    });
                }
            });
        });

        // Ratings table - DROP AND RECREATE
        await new Promise((resolve, reject) => {
            db.run(`DROP TABLE IF EXISTS Ratings`, (err) => {
                if (err) reject(err);
                else {
                    console.log('✅ Old Ratings table dropped');
                    db.run(`
                        CREATE TABLE Ratings (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            user_id INTEGER NOT NULL,
                            store_id INTEGER NOT NULL,
                            rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
                            review_text TEXT,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
                            FOREIGN KEY (store_id) REFERENCES Stores(id) ON DELETE CASCADE,
                            UNIQUE(user_id, store_id)
                        )
                    `, (err) => {
                        if (err) reject(err);
                        else {
                            console.log('✅ New Ratings table created with review_text');
                            resolve();
                        }
                    });
                }
            });
        });

        // Create indexes
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_users_email ON Users(email)',
            'CREATE INDEX IF NOT EXISTS idx_stores_name ON Stores(name)',
            'CREATE INDEX IF NOT EXISTS idx_stores_featured ON Stores(featured)',
            'CREATE INDEX IF NOT EXISTS idx_stores_active ON Stores(is_active)',
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
        console.log('✅ All indexes created/verified');

        // Insert comprehensive default users
        const defaultUsers = [
            // Admins
            {
                name: 'System Administrator', 
                email: 'admin@test.com', 
                password: 'Admin123!',
                address: '123 Admin Street, Tech City, CA 94025',
                role: 'admin'
            },
            {
                name: 'Sarah Johnson', 
                email: 'sarah.admin@test.com', 
                password: 'Admin123!',
                address: '456 Management Ave, Business District, NY 10001',
                role: 'admin'
            },

            // Store Owners
            {
                name: 'Store Owner John', 
                email: 'owner@test.com', 
                password: 'Owner123!',
                address: '789 Business Road, Commerce City, TX 75001',
                role: 'owner'
            },
            {
                name: 'Maria Garcia', 
                email: 'maria.owner@test.com', 
                password: 'Owner123!',
                address: '321 Entrepreneur Lane, Startup Valley, CA 90210',
                role: 'owner'
            },
            {
                name: 'David Kim', 
                email: 'david.owner@test.com', 
                password: 'Owner123!',
                address: '654 Retail Street, Shopping District, IL 60601',
                role: 'owner'
            },

            // Regular Users
            {
                name: 'Sarah Wilson', 
                email: 'user@test.com', 
                password: 'User123!',
                address: '987 Residential Lane, Home Town, WA 98101',
                role: 'user'
            },
            {
                name: 'Mike Johnson',
                email: 'mike.johnson@email.com',
                password: 'Password123!',
                address: '741 Oak Street, Springfield, OH 45501',
                role: 'user'
            },
            {
                name: 'Emma Davis',
                email: 'emma.davis@email.com', 
                password: 'Password123!',
                address: '852 Pine Road, Riverside, FL 33101',
                role: 'user'
            },
            {
                name: 'Alex Chen',
                email: 'alex.chen@email.com',
                password: 'Password123!',
                address: '963 Maple Drive, Lakeside, CO 80202',
                role: 'user'
            },
            {
                name: 'Lisa Thompson',
                email: 'lisa.thompson@email.com',
                password: 'Password123!',
                address: '159 Willow Lane, Mountain View, CA 94041',
                role: 'user'
            },
            {
                name: 'James Wilson',
                email: 'james.wilson@email.com',
                password: 'Password123!',
                address: '753 Cedar Street, Brookside, MA 02101',
                role: 'user'
            },
            {
                name: 'Priya Patel',
                email: 'priya.patel@email.com',
                password: 'Password123!',
                address: '486 Elm Avenue, Greenfield, NJ 07001',
                role: 'user'
            },
            {
                name: 'Carlos Rodriguez',
                email: 'carlos.rodriguez@email.com',
                password: 'Password123!',
                address: '624 Birch Road, Oakwood, AZ 85001',
                role: 'user'
            },
            {
                name: 'Jennifer Lee',
                email: 'jennifer.lee@email.com',
                password: 'Password123!',
                address: '837 Spruce Court, Hillcrest, GA 30301',
                role: 'user'
            },
            {
                name: 'Robert Brown',
                email: 'robert.brown@email.com',
                password: 'Password123!',
                address: '295 Magnolia Street, Parkview, NC 27601',
                role: 'user'
            },
            {
                name: 'Amanda Taylor',
                email: 'amanda.taylor@email.com',
                password: 'Password123!',
                address: '418 Redwood Drive, Lakeshore, MI 48201',
                role: 'user'
            },
            {
                name: 'Kevin Martinez',
                email: 'kevin.martinez@email.com',
                password: 'Password123!',
                address: '572 Cypress Lane, Valley Stream, PA 19001',
                role: 'user'
            },
            {
                name: 'Michelle Clark',
                email: 'michelle.clark@email.com',
                password: 'Password123!',
                address: '684 Walnut Street, Highland Park, VA 23201',
                role: 'user'
            },
            {
                name: 'Daniel White',
                email: 'daniel.white@email.com',
                password: 'Password123!',
                address: '927 Aspen Way, Forest Hills, MO 63101',
                role: 'user'
            },
            {
                name: 'Sophia Anderson',
                email: 'sophia.anderson@email.com',
                password: 'Password123!',
                address: '153 Poplar Circle, Meadowbrook, MN 55401',
                role: 'user'
            },
            {
                name: 'Thomas Harris',
                email: 'thomas.harris@email.com',
                password: 'Password123!',
                address: '386 Sycamore Road, Crestview, LA 70112',
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
                        console.log(`✅ User created: ${userData.email} (${userData.role})`);
                        resolve();
                    }
                });
            });
        }

        // Insert comprehensive sample stores
        const sampleStores = [
            {
                name: "Tech Galaxy",
                description: "Latest smartphones, laptops, and gadgets with expert technical support and warranty services",
                address: "123 Tech Street, Silicon Valley, CA 94025",
                phone: "+1-555-0101",
                website: "https://techgalaxy.example.com",
                featured: 1,
                average_rating: 4.5,
                rating_count: 47,
                total_rating_value: 211.5
            },
            {
                name: "Book Haven", 
                description: "Independent bookstore with cozy reading corners, author events, and rare book collections",
                address: "456 Library Road, Knowledge City, NY 10001",
                phone: "+1-555-0102",
                website: "https://bookhaven.example.com",
                featured: 1,
                average_rating: 4.7,
                rating_count: 89,
                total_rating_value: 418.3
            },
            {
                name: "Brew & Bean Café",
                description: "Artisan coffee roastery with fresh pastries, free WiFi, and comfortable workspace", 
                address: "789 Brew Street, Morning Town, WA 98101",
                phone: "+1-555-0103",
                website: "https://brewnbean.example.com",
                featured: 1,
                average_rating: 4.6,
                rating_count: 156,
                total_rating_value: 717.6
            },
            {
                name: "Urban Fashion Boutique",
                description: "Trendy clothing and accessories for modern urban lifestyle with personal styling services",
                address: "321 Style Avenue, Fashion District, CA 90210",
                phone: "+1-555-0104",
                website: "https://urbanfashion.example.com",
                featured: 1,
                average_rating: 4.3,
                rating_count: 72,
                total_rating_value: 309.6
            },
            {
                name: "Fresh Market Grocers",
                description: "Organic produce, local farm products, and gourmet foods with daily fresh deliveries",
                address: "654 Green Road, Health District, CO 80202",
                phone: "+1-555-0105",
                website: "https://freshmarket.example.com",
                featured: 0,
                average_rating: 4.4,
                rating_count: 134,
                total_rating_value: 589.6
            },
            {
                name: "Fitness Gear Pro",
                description: "Professional sports equipment, workout gear, and certified personal training services",
                address: "987 Athletic Boulevard, Sports Complex, TX 75001",
                phone: "+1-555-0106",
                website: "https://fitnessgear.example.com",
                featured: 1,
                average_rating: 4.2,
                rating_count: 68,
                total_rating_value: 285.6
            },
            {
                name: "Home Decor Emporium",
                description: "Modern furniture, home accessories, and interior design consultation services",
                address: "147 Design Street, Creative Quarter, IL 60601",
                phone: "+1-555-0107",
                website: "https://homedecor.example.com",
                featured: 0,
                average_rating: 4.1,
                rating_count: 45,
                total_rating_value: 184.5
            },
            {
                name: "Pet Paradise Store",
                description: "Premium pet food, toys, grooming services, and veterinary care products",
                address: "258 Animal Avenue, Pet Friendly Zone, FL 33101",
                phone: "+1-555-0108",
                website: "https://petparadise.example.com",
                featured: 0,
                average_rating: 4.8,
                rating_count: 203,
                total_rating_value: 974.4
            },
            {
                name: "Electronics Hub",
                description: "Home appliances, smart devices, and electronics with installation services",
                address: "369 Gadget Lane, Tech Park, GA 30301",
                phone: "+1-555-0109",
                website: "https://electronicshub.example.com",
                featured: 1,
                average_rating: 4.0,
                rating_count: 91,
                total_rating_value: 364.0
            },
            {
                name: "Beauty & Wellness Center",
                description: "Skincare products, cosmetics, and wellness supplements with expert consultations",
                address: "741 Glow Street, Beauty District, NV 89101",
                phone: "+1-555-0110",
                website: "https://beautywellness.example.com",
                featured: 0,
                average_rating: 4.5,
                rating_count: 127,
                total_rating_value: 571.5
            },
            {
                name: "Sports Arena Outlet",
                description: "Team sports equipment, outdoor gear, and sports apparel for all ages",
                address: "852 Champion Road, Athletic Zone, MA 02101",
                phone: "+1-555-0111",
                website: "https://sportsarena.example.com",
                featured: 0,
                average_rating: 4.3,
                rating_count: 84,
                total_rating_value: 361.2
            },
            {
                name: "Gourmet Food Market",
                description: "International cuisine ingredients, specialty foods, and cooking classes",
                address: "963 Culinary Street, Foodie District, OR 97201",
                phone: "+1-555-0112",
                website: "https://gourmetmarket.example.com",
                featured: 1,
                average_rating: 4.7,
                rating_count: 178,
                total_rating_value: 836.6
            }
        ];

        let storesInserted = 0;
        for (const store of sampleStores) {
            await new Promise((resolve, reject) => {
                db.run(`
                    INSERT INTO Stores (name, description, address, phone, website, featured, average_rating, rating_count, total_rating_value) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    store.name, 
                    store.description, 
                    store.address, 
                    store.phone, 
                    store.website, 
                    store.featured,
                    store.average_rating, 
                    store.rating_count, 
                    store.total_rating_value
                ], function(err) {
                    if (err) reject(err);
                    else {
                        storesInserted++;
                        console.log(`✅ Added store: ${store.name} (Rating: ${store.average_rating})`);
                        resolve();
                    }
                });
            });
        }
        console.log(`✅ ${storesInserted} sample stores created`);

        // Insert realistic sample ratings
        console.log('⭐ Adding sample ratings...');
        const sampleRatings = [
            // User 3 (Sarah) ratings
            { user_id: 3, store_id: 1, rating: 5, review_text: "Great tech products and excellent customer service!" },
            { user_id: 3, store_id: 2, rating: 4, review_text: "Love the cozy atmosphere and book selection" },
            { user_id: 3, store_id: 3, rating: 5, review_text: "Best coffee in town and friendly staff" },
            { user_id: 3, store_id: 6, rating: 4, review_text: "Good quality fitness equipment" },
            
            // User 4 (Mike) ratings
            { user_id: 4, store_id: 1, rating: 4, review_text: "Good prices but limited stock sometimes" },
            { user_id: 4, store_id: 4, rating: 5, review_text: "Fashionable clothes and great styling advice" },
            { user_id: 4, store_id: 8, rating: 5, review_text: "My dog loves their products!" },
            { user_id: 4, store_id: 12, rating: 4, review_text: "Amazing international food selection" },
            
            // User 5 (Emma) ratings
            { user_id: 5, store_id: 3, rating: 5, review_text: "Perfect spot for remote work and meetings" },
            { user_id: 5, store_id: 5, rating: 4, review_text: "Fresh organic produce every time" },
            { user_id: 5, store_id: 7, rating: 3, review_text: "Nice furniture but a bit expensive" },
            { user_id: 5, store_id: 10, rating: 5, review_text: "Professional beauty consultations" },
            
            // User 6 (Alex) ratings
            { user_id: 6, store_id: 2, rating: 5, review_text: "Best bookstore with rare collections" },
            { user_id: 6, store_id: 9, rating: 4, review_text: "Good electronics with warranty" },
            { user_id: 6, store_id: 11, rating: 4, review_text: "Complete sports gear for our team" },
            { user_id: 6, store_id: 12, rating: 5, review_text: "Cooking classes are fantastic!" }
        ];

        for (const rating of sampleRatings) {
            await new Promise((resolve, reject) => {
                db.run(`
                    INSERT INTO Ratings (user_id, store_id, rating, review_text)
                    VALUES (?, ?, ?, ?)
                `, [rating.user_id, rating.store_id, rating.rating, rating.review_text], (err) => {
                    if (err) reject(err);
                    else {
                        console.log(`✅ Added rating: User ${rating.user_id} → Store ${rating.store_id} (${rating.rating}⭐)`);
                        resolve();
                    }
                });
            });
        }

        console.log('\n🎉 Database initialized successfully with comprehensive data!');
        console.log('📊 Summary:');
        console.log(`   👥 ${defaultUsers.length} users created`);
        console.log(`   🏪 ${sampleStores.length} stores created`);
        console.log(`   ⭐ ${sampleRatings.length} ratings added`);
        console.log('\n🔑 Default credentials:');
        console.log('   👑 Admins: admin@test.com / Admin123!');
        console.log('   🏪 Store Owners: owner@test.com / Owner123!'); 
        console.log('   👤 Regular Users: user@test.com / User123!');
        console.log('\n🚀 Your application is ready with realistic data!');

    } catch (error) {
        console.error('❌ Database initialization failed:', error);
    } finally {
        db.close();
    }
};

initDatabase();