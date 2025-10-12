const db = require('../config/database');

exports.getDashboard = async (req, res) => {
    try {
        const ownerId = req.user.id;

        // Get owner's store
        const store = await db.get(`
            SELECT 
                s.id, s.name, s.address, s.email,
                COALESCE(AVG(r.rating), 0) as average_rating,
                COUNT(r.id) as rating_count
            FROM Stores s
            LEFT JOIN Ratings r ON s.id = r.store_id
            WHERE s.owner_id = ? AND s.is_active = 1
            GROUP BY s.id
        `, [ownerId]);

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'No store found for this owner'
            });
        }

        // Get raters (users who rated this store)
        const raters = await db.all(`
            SELECT 
                u.name, u.email, r.rating, r.created_at as rated_at
            FROM Ratings r
            JOIN Users u ON r.user_id = u.id
            WHERE r.store_id = ?
            ORDER BY r.created_at DESC
        `, [store.id]);

        res.json({
            success: true,
            data: {
                store: {
                    id: store.id,
                    name: store.name,
                    address: store.address,
                    email: store.email,
                    average_rating: parseFloat(store.average_rating).toFixed(2),
                    rating_count: store.rating_count
                },
                raters
            }
        });
    } catch (error) {
        console.error('Owner dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching owner dashboard'
        });
    }
};