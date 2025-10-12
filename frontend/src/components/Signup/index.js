import React, { useState } from 'react';
import { Mail, Lock, User, Home, Eye, EyeOff } from 'lucide-react';
import './index.css';

/**
 * Renders the Signup Form component.
 */
export const SignupForm = ({ onSignup, switchToLogin }) => {
    const [formData, setFormData] = useState({
        name: '', email: '', address: '', password: '', confirmPassword: '',
    });
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        const { name, email, password, confirmPassword, address } = formData;
        
        // Validation checks (Name, Address, Email, Password, Confirm Password)
        if (name.length < 20 || name.length > 60) {
            setMessage('Name must be between 20 and 60 characters.');
            return false;
        }
        if (address.length > 400) {
            setMessage('Address cannot exceed 400 characters.');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setMessage('Please enter a valid email address.');
            return false;
        }
        const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,16}$)/;
        if (!passwordRegex.test(password)) {
            setMessage('Password must be 8-16 characters long and include at least one uppercase letter and one special character (!@#$%^&*).');
            return false;
        }
        if (password !== confirmPassword) {
            setMessage('Passwords do not match.');
            return false;
        }

        setMessage('');
        return true;
    };

    const handleSignup = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Simulated signup success (Normal User role is assumed)
            onSignup({ ...formData, role: 'Normal User' });
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-card">
                <div className="signup-header">
                    <h1 className="signup-title">Normal User Registration</h1>
                    <p className="signup-subtitle">
                        Sign up here to start rating stores. Only Normal Users can register accounts.
                    </p>
                </div>
                
                <form onSubmit={handleSignup} className="signup-form">
                    {/* Name Input */}
                    <div className="input-group">
                        <User className="input-icon" size={20} />
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name (20-60 chars)"
                            value={formData.name}
                            onChange={handleChange}
                            className="input-field"
                            minLength={20}
                            maxLength={60}
                            required
                        />
                    </div>

                    {/* Email Input */}
                    <div className="input-group">
                        <Mail className="input-icon" size={20} />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            className="input-field"
                            required
                        />
                    </div>
                    
                    {/* Address Input */}
                    <div className="input-group">
                        <Home className="input-icon" size={20} />
                        <textarea
                            name="address"
                            placeholder="Address (Max 400 chars)"
                            value={formData.address}
                            onChange={handleChange}
                            className="input-field textarea-field"
                            maxLength={400}
                            required
                        />
                    </div>

                    {/* Password Input with Toggle */}
                    <div className="input-group">
                        <Lock className="input-icon" size={20} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Password (8-16 chars, Uppercase, Special Char)"
                            value={formData.password}
                            onChange={handleChange}
                            className="input-field password-field"
                            required
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

                    {/* Confirm Password Input with Toggle */}
                    <div className="input-group">
                        <Lock className="input-icon" size={20} />
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="input-field password-field"
                            required
                        />
                         <button 
                            type="button" 
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                            className="password-toggle"
                            aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {/* Message Display */}
                    {message && <div className="error-message">{message}</div>}

                    <button type="submit" className="signup-button">
                        SIGN UP
                    </button>
                </form>

                <div className="signup-footer">
                    <p>Already have an account?</p>
                    <button onClick={switchToLogin} className="switch-button">
                        Log In
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignupForm;