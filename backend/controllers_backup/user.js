exports.getStores = async (req, res) => {
    try {
        const { search } = req.query;
        const userId = req.user.id;
        const db = req.app.get('db');
        
        let whereClause = '';
        let params = [];

        if (search) {
            whereClause = 'WHERE (name LIKE ? OR address LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        const stores = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    id, 
                    name, 
                    address,
                    average_rating,
                    rating_count
                FROM Stores 
                ${whereClause}
                ORDER BY average_rating DESC
            `, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        res.json({
            success: true,
            stores: stores
        });
    } catch (error) {
        console.error('Get stores error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching stores'
        });
    }
};

exports.updateRating = async (req, res) => {
    try {
        const { storeId } = req.params;
        const { rating } = req.body;
        const userId = req.user.id;
        const db = req.app.get('db');

        // Check if rating exists
        const existingRating = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM Ratings WHERE user_id = ? AND store_id = ?', [userId, storeId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!existingRating) {
            return res.status(404).json({
                success: false,
                message: 'Rating not found'
            });
        }

        // Update rating
        await new Promise((resolve, reject) => {
            db.run('UPDATE Ratings SET rating = ? WHERE id = ?', [rating, existingRating.id], function(err) {
                if (err) reject(err);
                else resolve(this);
            });
        });

        // Update store ratings
        await updateStoreRatings(storeId, db);

        res.json({
            success: true,
            message: 'Rating updated successfully'
        });
    } catch (error) {
        console.error('Update rating error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating rating'
        });
    }
};

// Add the missing helper function
const updateStoreRatings = async (storeId, db) => {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT 
                COUNT(*) as rating_count,
                AVG(rating) as average_rating
            FROM Ratings 
            WHERE store_id = ?
        `, [storeId], (err, row) => {
            if (err) {
                reject(err);
                return;
            }

            db.run(`
                UPDATE Stores 
                SET 
                    rating_count = ?,
                    average_rating = ROUND(?, 2)
                WHERE id = ?
            `, [row.rating_count, row.average_rating || 0, storeId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
};