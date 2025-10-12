const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', { 
        expiresIn: '7d' 
    });
};

exports.signup = async (req, res) => {
    try {
        const { name, email, password, address } = req.body;
        const db = req.app.get('db');

        // Check if user already exists
        const existingUser = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM Users WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const result = await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO Users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
                [name, email, hashedPassword, address || '', 'user'],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID });
                }
            );
        });

        const token = generateToken(result.id);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            token,
            user: {
                id: result.id,
                name,
                email,
                role: 'user',
                address: address || ''
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during signup'
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const db = req.app.get('db');

        // Find user
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM Users WHERE email = ? AND is_active = 1', [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const token = generateToken(user.id);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                address: user.address
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};