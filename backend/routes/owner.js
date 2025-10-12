const express = require('express');
const { authMiddleware, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware, authorize('owner'));

router.get('/dashboard', (req, res) => {
    res.json({
        success: true,
        message: 'Owner dashboard works (temporary)'
    });
});

module.exports = router;