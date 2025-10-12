const express = require('express');
const router = express.Router();

// Dummy Stores Data
router.get('/stores', (req, res) => {
    const dummyStores = [
        {
            id: 1,
            name: "Tech Gadgets Store",
            email: "contact@techgadgets.com",
            address: "123 Tech Street, Silicon Valley, CA 94025",
            average_rating: 4.5,
            rating_count: 128,
            description: "Latest electronics and gadgets"
        },
        {
            id: 2,
            name: "Fashion Boutique",
            email: "info@fashionboutique.com",
            address: "456 Fashion Ave, New York, NY 10001",
            average_rating: 4.2,
            rating_count: 89,
            description: "Trendy clothing and accessories"
        },
        {
            id: 3,
            name: "Book Haven",
            email: "support@bookhaven.com",
            address: "789 Library Lane, Boston, MA 02108",
            average_rating: 4.8,
            rating_count: 203,
            description: "Wide collection of books and magazines"
        },
        {
            id: 4,
            name: "Sports Equipment Pro",
            email: "sales@sportsequipment.com",
            address: "321 Fitness Road, Denver, CO 80202",
            average_rating: 4.3,
            rating_count: 67,
            description: "Professional sports gear and equipment"
        },
        {
            id: 5,
            name: "Home Decor Plus",
            email: "hello@homedecorplus.com",
            address: "654 Design Blvd, Miami, FL 33101",
            average_rating: 4.6,
            rating_count: 142,
            description: "Modern home furniture and decorations"
        },
        {
            id: 6,
            name: "Gourmet Foods",
            email: "orders@gourmetfoods.com",
            address: "987 Culinary Street, San Francisco, CA 94102",
            average_rating: 4.7,
            rating_count: 178,
            description: "Premium quality food products"
        },
        {
            id: 7,
            name: "Music Instruments Store",
            email: "info@musicinstruments.com",
            address: "159 Melody Lane, Arts District, Creative City 10013",
            average_rating: 4.7,
            rating_count: 18,
            description: "Musical instruments and accessories"
        },
        {
            id: 8,
            name: "Health & Wellness",
            email: "care@healthwellness.com",
            address: "753 Wellness Way, Austin, TX 73301",
            average_rating: 4.4,
            rating_count: 95,
            description: "Health supplements and wellness products"
        },
        {
            id: 9,
            name: "Pet Paradise",
            email: "pets@petparadise.com",
            address: "246 Animal Avenue, Seattle, WA 98101",
            average_rating: 4.9,
            rating_count: 234,
            description: "Everything for your beloved pets"
        },
        {
            id: 10,
            name: "Art Supplies Central",
            email: "art@artsupplies.com",
            address: "852 Creative Corner, Portland, OR 97205",
            average_rating: 4.5,
            rating_count: 76,
            description: "Professional art supplies and materials"
        }
    ];

    console.log('🛍️ Serving dummy stores data from backend:', dummyStores.length, 'stores');
    console.log('📡 Request from:', req.headers.origin || 'Unknown origin');
    
    res.json({
        success: true,
        stores: dummyStores,
        count: dummyStores.length,
        message: "Dummy stores data loaded successfully from backend API"
    });
});

// Dummy Users Data
router.get('/users', (req, res) => {
    const dummyUsers = [
        {
            id: 1,
            name: "John Smith",
            email: "john.smith@example.com",
            address: "123 Main Street, New York, NY 10001",
            role: "user"
        },
        {
            id: 2,
            name: "Sarah Johnson",
            email: "sarah.johnson@example.com",
            address: "456 Oak Avenue, Los Angeles, CA 90210",
            role: "owner"
        },
        {
            id: 3,
            name: "Mike Wilson",
            email: "mike.wilson@example.com",
            address: "789 Pine Road, Chicago, IL 60601",
            role: "admin"
        },
        {
            id: 4,
            name: "Emily Davis",
            email: "emily.davis@example.com",
            address: "321 Elm Street, Houston, TX 77001",
            role: "user"
        },
        {
            id: 5,
            name: "David Brown",
            email: "david.brown@example.com",
            address: "654 Maple Drive, Phoenix, AZ 85001",
            role: "owner"
        },
        {
            id: 6,
            name: "Lisa Garcia",
            email: "lisa.garcia@example.com",
            address: "987 Cedar Lane, Philadelphia, PA 19102",
            role: "user"
        },
        {
            id: 7,
            name: "Robert Miller",
            email: "robert.miller@example.com",
            address: "159 Birch Court, San Antonio, TX 78201",
            role: "owner"
        },
        {
            id: 8,
            name: "Jennifer Taylor",
            email: "jennifer.taylor@example.com",
            address: "753 Walnut Street, San Diego, CA 92101",
            role: "admin"
        },
        {
            id: 9,
            name: "Thomas Anderson",
            email: "thomas.anderson@example.com",
            address: "246 Spruce Avenue, Dallas, TX 75201",
            role: "user"
        },
        {
            id: 10,
            name: "Maria Martinez",
            email: "maria.martinez@example.com",
            address: "852 Willow Way, San Jose, CA 95101",
            role: "owner"
        }
    ];

    console.log('👤 Serving dummy users data from backend:', dummyUsers.length, 'users');
    console.log('📡 Request from:', req.headers.origin || 'Unknown origin');
    
    res.json({
        success: true,
        users: dummyUsers,
        count: dummyUsers.length,
        message: "Dummy users data loaded successfully from backend API"
    });
});

// Test endpoint
router.get('/test', (req, res) => {
    console.log('🔧 Debug test endpoint called');
    res.json({
        success: true,
        message: "Debug routes are working!",
        timestamp: new Date().toISOString(),
        endpoints: {
            stores: '/api/debug/stores',
            users: '/api/debug/users',
            test: '/api/debug/test'
        }
    });
});

// Health check for debug routes
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: "Debug routes are healthy",
        status: "operational",
        timestamp: new Date().toISOString()
    });
});

module.exports = router;