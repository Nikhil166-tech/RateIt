import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './index.css';

/**
 * Professional Login Form component with demo authentication
 */
export const LoginForm = ({ onLogin, switchToSignup }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'Normal User'
    });
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Predefined login credentials for each role
    const roleCredentials = {
        'Normal User': {
            email: 'user@storerater.com',
            password: 'User123!'
        },
        'Store Owner': {
            email: 'owner@storerater.com',
            password: 'Owner123!'
        },
        'System Administrator': {
            email: 'admin@storerater.com',
            password: 'Admin123!'
        }
    };

    // Validation patterns
    const validationPatterns = {
        email: /^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        password: /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/
    };

    // Validation messages
    const validationMessages = {
        email: 'Please enter a valid email address',
        password: 'Password must be 8-16 characters with at least one uppercase letter and one special character (!@#$%^&*)'
    };

    // Handle input changes with validation
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Validate field in real-time
        if (value.trim()) {
            validateField(field, value);
        } else {
            // Clear error if field is empty
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }

        // Clear message when user starts typing
        if (message) setMessage('');
    };

    // Validate individual field
    const validateField = (name, value) => {
        const newErrors = { ...errors };
        
        switch (name) {
            case 'email':
                if (!validationPatterns.email.test(value)) {
                    newErrors.email = validationMessages.email;
                } else {
                    delete newErrors.email;
                }
                break;
                
            case 'password':
                if (!validationPatterns.password.test(value)) {
                    newErrors.password = validationMessages.password;
                } else {
                    delete newErrors.password;
                }
                break;
                
            default:
                break;
        }
        
        setErrors(newErrors);
    };

    // Validate entire form before submission
    const validateForm = () => {
        const newErrors = {};
        
        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validationPatterns.email.test(formData.email)) {
            newErrors.email = validationMessages.email;
        }
        
        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (!validationPatterns.password.test(formData.password)) {
            newErrors.password = validationMessages.password;
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Auto-fill credentials based on selected role
    const handleRoleChange = (role) => {
        const credentials = roleCredentials[role];
        setFormData({
            email: credentials.email,
            password: credentials.password,
            role: role
        });
        
        // Clear any existing errors
        setErrors({});
        setMessage('');
    };

    // Demo authentication - with validation
    const handleDemoLogin = async (e) => {
        e.preventDefault();
        
        // Validate form before submission
        if (!validateForm()) {
            setMessage('Please fix the validation errors before submitting.');
            return;
        }

        setLoading(true);
        setMessage('');

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            // Send the EXACT role to App.js - no mapping needed
            const loginData = {
                email: formData.email,
                password: formData.password,
                role: formData.role // Send the exact role as selected
            };

            console.log('Sending to App.js:', loginData);

            // Call the parent onLogin with the exact role
            if (onLogin && typeof onLogin === 'function') {
                onLogin(loginData);
            } else {
                setMessage('Login successful! But no redirect handler found.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setMessage('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="logo-container">
                        <div className="logo">⭐</div>
                        <h1 className="app-name">StoreRater</h1>
                    </div>
                    <h2 className="login-title">Welcome Back</h2>
                    <p className="login-subtitle">
                        Sign in to your account to continue
                    </p>
                </div>
                
                <form onSubmit={handleDemoLogin} className="login-form" noValidate>
                    {/* Email Input */}
                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <div className="input-wrapper">
                            
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className={`input-field ${errors.email ? 'error' : ''}`}
                            />
                        </div>
                        {errors.email && <span className="field-error">{errors.email}</span>}
                    </div>

                    {/* Password Input */}
                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <div className="input-wrapper">
                          
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                className={`input-field ${errors.password ? 'error' : ''}`}
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)} 
                                className="password-toggle"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && <span className="field-error">{errors.password}</span>}
                    </div>

                    {/* Role Selection */}
                    <div className="input-group">
                        <label className="input-label">Account Type</label>
                        <div className="input-wrapper">
                            
                            <select
                                value={formData.role}
                                onChange={(e) => handleRoleChange(e.target.value)}
                                className="input-field select-field"
                            >
                                <option value="Normal User">Normal User</option>
                                <option value="Store Owner">Store Owner</option>
                                <option value="System Administrator">System Administrator</option>
                            </select>
                        </div>
                    </div>

                    {/* Message Display */}
                    {message && (
                        <div className={`message ${message.includes('successful') ? 'success-message' : 'error-message'}`}>
                            {message}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className={`login-button ${loading ? 'loading' : ''}`}
                        disabled={loading || Object.keys(errors).length > 0}
                    >
                        {loading ? (
                            <>
                                <div className="spinner"></div>
                                Signing In...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Don't have an account? <button onClick={switchToSignup} className="link-button">Sign up</button></p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;