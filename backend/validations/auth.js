const { body } = require('express-validator');

const signupValidation = [
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
    
    body('address')
        .optional()
        .isLength({ max: 400 })
        .withMessage('Address cannot exceed 400 characters')
];

const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

const updatePasswordValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    
    body('newPassword')
        .isLength({ min: 8, max: 16 })
        .withMessage('New password must be between 8 and 16 characters')
        .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/)
        .withMessage('New password must contain at least one uppercase letter and one special character')
];

module.exports = {
    signupValidation,
    loginValidation,
    updatePasswordValidation
};