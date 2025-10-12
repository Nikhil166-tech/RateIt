const express = require('express');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Temporary route - remove later
router.get('/stores', (req, res) => {
    const db = req.app.get('db');
    
    db.all('SELECT id, name, address, average_rating, rating_count FROM Stores ORDER BY id', [], (err, rows) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }
        
        res.json({
            success: true,
            stores: rows
        });
    });
});

// Temporary route - remove later
router.post('/stores/:storeId/rate', (req, res) => {
    const { storeId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;
    const db = req.app.get('db');

    res.json({
        success: true,
        message: 'Rating endpoint works (temporary)',
        storeId,
        rating,
        userId
    });
});

module.exports = router;