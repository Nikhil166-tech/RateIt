const { body, query } = require('express-validator');

const createUserValidation = [
    body('name')
        .isLength({ min: 2, max: 60 })
        .withMessage('Name must be between 2 and 60 characters'),
    
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    
    body('password')
        .isLength({ min: 8, max: 16 })
        .withMessage('Password must be between 8 and 16 characters')
        .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/)
        .withMessage('Password must contain at least one uppercase letter and one special character'),
    
    body('role')
        .isIn(['admin', 'user', 'owner'])
        .withMessage('Role must be admin, user, or owner'),
    
    body('address')
        .optional()
        .isLength({ max: 400 })
        .withMessage('Address cannot exceed 400 characters')
];

const createStoreValidation = [
    body('name')
        .isLength({ min: 2, max: 60 })
        .withMessage('Store name must be between 2 and 60 characters'),
    
    body('email')
        .isEmail()
        .withMessage('Please provide a valid store email')
        .normalizeEmail(),
    
    body('address')
        .isLength({ max: 400 })
        .withMessage('Store address cannot exceed 400 characters'),
    
    body('owner_id')
        .isInt({ min: 1 })
        .withMessage('Valid owner ID is required')
];

const queryValidation = [
    query('name').optional().isString(),
    query('email').optional().isEmail(),
    query('role').optional().isIn(['admin', 'user', 'owner']),
    query('sort').optional().isString(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
];

module.exports = {
    createUserValidation,
    createStoreValidation,
    queryValidation
};