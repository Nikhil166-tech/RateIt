import React, { useState, useEffect } from 'react';
import './index.css';

// Login Screen Component
export const LoginScreen = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await onLogin(email, password);
        } catch (err) {
            setError('Invalid email or password. Try admin@example.com / password123 or user@example.com / password123');
        } finally {
            setLoading(false);
        }
    };

    const fillDemoCredentials = (type) => {
        if (type === 'admin') {
            setEmail('admin@example.com');
            setPassword('password123');
        } else {
            setEmail('user@example.com');
            setPassword('password123');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1 className="login-title">Welcome Back!</h1>
                    <p className="login-subtitle">
                        Sign in to access your dashboard as a System Administrator, Store Owner, or Normal User.
                    </p>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="login-form">
                    <div className="input-group">
                        <label htmlFor="email" className="input-label">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="input-field"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password" className="input-label">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="input-field"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="login-button"
                    >
                        {loading ? 'Signing In...' : 'LOG IN'}
                    </button>
                </form>

                <div className="demo-credentials">
                    <p className="demo-title">Quick Login:</p>
                    <div className="demo-buttons">
                        <button
                            type="button"
                            onClick={() => fillDemoCredentials('admin')}
                            className="demo-button"
                        >
                            Login as Admin
                        </button>
                        <button
                            type="button"
                            onClick={() => fillDemoCredentials('user')}
                            className="demo-button user-demo"
                        >
                            Login as Normal User
                        </button>
                    </div>
                </div>

                <div className="login-footer">
                    <p>New Norms! User? [Game.Makeout]</p>
                </div>
            </div>
        </div>
    );
};

// Custom Modal for Messages
const Modal = ({ title, message, isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <h3 className="modal-title">{title}</h3>
                <p className="modal-message">{message}</p>
                <div className="modal-actions">
                    <button
                        onClick={onClose}
                        className="modal-close-button"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// Store Card Component - COMPLETELY INDEPENDENT VERSION
const StoreCard = ({ store, userRating, onRateStore }) => {
    const [submitting, setSubmitting] = useState(false);
    const [localRating, setLocalRating] = useState(userRating || 0);
    const [hoverRating, setHoverRating] = useState(0);
    
    const isRated = localRating > 0;
    const avgRating = store.average_rating || store.averageRating || 0;
    const ratingCount = store.rating_count || store.ratingCount || 0;

    // Reset local rating when userRating prop changes to 0 (when user hasn't rated)
    useEffect(() => {
        if (userRating === 0) {
            setLocalRating(0);
        }
    }, [userRating]);

    const handleRate = async (rating) => {
        if (submitting) return;
        
        console.log(`⭐ Rating store ${store.id} with ${rating} stars`);
        setSubmitting(true);
        
        // Store the previous rating in case we need to revert
        const previousRating = localRating;
        
        // Update local state immediately for instant feedback
        setLocalRating(rating);
        
        try {
            await onRateStore(store.id.toString(), rating);
            // Success - local rating is already updated
        } catch (error) {
            console.error('❌ Rating failed:', error);
            // Revert on error - only if the error is not from the parent
            setLocalRating(previousRating);
        } finally {
            setSubmitting(false);
        }
    };

    const handleStarHover = (rating) => {
        if (!submitting) {
            setHoverRating(rating);
        }
    };

    const handleStarLeave = () => {
        setHoverRating(0);
    };

    // Separate function for display stars (non-editable)
    const renderDisplayStars = (rating) => {
        return (
            <div className="stars-container">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                        key={star} 
                        className={`star-static ${star <= rating ? 'star-filled' : 'star-empty'}`}
                    >
                        {star <= rating ? '★' : '☆'}
                    </span>
                ))}
            </div>
        );
    };

    // Separate function for editable stars
    const renderEditableStars = () => {
        const displayRating = hoverRating || localRating;
        
        return (
            <div className="stars-container">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                        key={star}
                        onClick={() => handleRate(star)}
                        onMouseEnter={() => handleStarHover(star)}
                        onMouseLeave={handleStarLeave}
                        aria-label={`Rate ${star} stars`} 
                        className={`star-button ${star <= displayRating ? 'star-filled' : 'star-empty'} ${submitting ? 'star-disabled' : ''}`}
                        disabled={submitting}
                        type="button"
                    >
                        <span className="star-icon">
                            {star <= displayRating ? '★' : '☆'}
                        </span>
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="store-card">
            <h3 className="store-name">{store.name}</h3>
            <p className="store-address">{store.address}</p>
            
            <div className="store-ratings-info">
                <div className="rating-section">
                    <p className="rating-label">Community Rating</p>
                    <div className="rating-display">
                        <span className="average-rating">{avgRating.toFixed(1)}</span>
                        <span className="rating-scale">/ 5</span>
                        {renderDisplayStars(avgRating)}
                        <p className="rating-count">({ratingCount} votes)</p>
                    </div>
                </div>
                
                <div className="rating-section">
                    <p className="rating-label">Your Rating</p>
                    <div className="user-rating-display">
                        {isRated ? (
                            <div className="user-rating-stars">
                                {renderDisplayStars(localRating)}
                                <span className="user-rating-value">({localRating}/5)</span>
                            </div>
                        ) : (
                            <span className="not-rated">Not Rated</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="rating-actions">
                <p className="rating-prompt">
                    {isRated ? 'Modify Your Rating' : 'Submit a Rating'} (1-5)
                    {submitting && <span className="submitting-text"> (Submitting...)</span>}
                </p>
                <div 
                    className="editable-stars"
                    onMouseLeave={handleStarLeave}
                >
                    {renderEditableStars()}
                </div>
            </div>
        </div>
    );
};

// Store List Screen Component - UPDATED WITH BETTER STATE MANAGEMENT
export const StoreListScreen = ({ 
    userProfile, 
    stores, 
    userRatings, 
    loading, 
    onRateStore,
    onSearch 
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });
    const [localUserRatings, setLocalUserRatings] = useState({});

    // Initialize local ratings from props
    useEffect(() => {
        if (userRatings && userProfile?.id) {
            setLocalUserRatings(userRatings[userProfile.id] || {});
        }
    }, [userRatings, userProfile]);

    const handleSearch = (term) => {
        setSearchTerm(term);
        if (onSearch) {
            onSearch(term);
        }
    };

    const handleRateStore = async (storeId, rating) => {
        try {
            console.log('🔄 StoreListScreen - Rating store:', storeId, rating);
            
            // Update local state immediately for better UX
            setLocalUserRatings(prev => ({
                ...prev,
                [storeId]: rating
            }));
            
            if (onRateStore) {
                await onRateStore(storeId, rating);
                setModal({ 
                    isOpen: true, 
                    title: 'Success', 
                    message: 'Your rating has been submitted successfully!' 
                });
            }
        } catch (error) {
            console.error('❌ StoreListScreen - Rating error:', error);
            // Revert local state on error
            setLocalUserRatings(prev => {
                const newRatings = { ...prev };
                delete newRatings[storeId];
                return newRatings;
            });
            setModal({ 
                isOpen: true, 
                title: 'Error', 
                message: 'Failed to submit rating. Please try again.' 
            });
        }
    };

    // Get user's rating for a specific store from local state
    const getUserRating = (storeId) => {
        return localUserRatings[storeId] || localUserRatings[storeId.toString()] || 0;
    };

    // Filter stores based on search term
    const filteredStores = stores.filter(store => {
        if (!searchTerm) return true;
        
        const searchLower = searchTerm.toLowerCase();
        return (
            store.name?.toLowerCase().includes(searchLower) ||
            store.address?.toLowerCase().includes(searchLower)
        );
    });

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <span className="loading-text">Loading stores...</span>
            </div>
        );
    }

    return (
        <div className="store-list-container">
            <Modal {...modal} onClose={() => setModal({ ...modal, isOpen: false })} />
            
            <header className="store-list-header">
                <h1 className="welcome-title">Welcome, {userProfile?.name || 'User'}!</h1>
                <p className="welcome-subtitle">View and rate registered stores.</p>
            </header>

            {/* Search Bar */}
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search by Store Name or Address..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="search-input"
                />
            </div>
            
            {/* Store Grid */}
            <div className="stores-grid">
                {filteredStores.length > 0 ? (
                    filteredStores.map(store => {
                        const storeId = store.id || store._id;
                        const userRating = getUserRating(storeId);
                        
                        return (
                            <StoreCard 
                                key={storeId} 
                                store={store} 
                                userRating={userRating}
                                onRateStore={handleRateStore}
                            />
                        );
                    })
                ) : (
                    <div className="empty-state">
                        <p className="empty-state-text">
                            {searchTerm ? 'No stores match your search criteria.' : 'No stores registered yet.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Password Update Screen Component
export const PasswordUpdateScreen = ({ onUpdatePassword, onDone }) => {
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });

    const handleUpdate = async () => {
        if (!newPassword || newPassword.length < 6) {
             setModal({ isOpen: true, title: 'Error', message: 'Password must be at least 6 characters long.' });
             return;
        }

        setLoading(true);
        try {
            if (onUpdatePassword) {
                await onUpdatePassword(newPassword);
                setModal({ isOpen: true, title: 'Success', message: 'Your password has been successfully updated.' });
                setNewPassword('');
            }
        } catch (error) {
            setModal({ isOpen: true, title: 'Error', message: error.message || 'Failed to update password.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="password-update-container">
            <Modal {...modal} onClose={() => setModal({ ...modal, isOpen: false })} />
            <h2 className="password-update-title">Update Password</h2>
            <p className="password-update-warning">
                Note: Updating the password often requires a *recent* log-in for security reasons.
            </p>
            
            <input 
                type="password"
                placeholder="Enter New Password (min 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="password-input"
            />
            
            <div className="password-actions">
                <button
                    onClick={onDone}
                    className="cancel-button"
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    onClick={handleUpdate}
                    className="update-button"
                    disabled={loading || newPassword.length < 6}
                >
                    {loading ? 'Updating...' : 'Update Password'}
                </button>
            </div>
        </div>
    );
};

// Main Normal User Dashboard Component
export const NormalUserDashboard = ({ 
    userProfile, 
    onLogout,
    // Store List Props
    stores = [],
    userRatings = {},
    loading = false,
    onRateStore,
    onSearch,
    // Password Update Props
    onUpdatePassword
}) => {
    const [currentView, setCurrentView] = useState('list'); // 'list', 'update_password'

    const navigationItems = [
        { 
            id: 'list', 
            label: 'Store List', 
            icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM4 6v12h16V6H4zM16 11H8v2h8v-2z' 
        },
        { 
            id: 'update_password', 
            label: 'Update Password', 
            icon: 'M12 1v2h-1c-.55 0-1 .45-1 1v1h4v-1c0-.55-.45-1-1-1h-1V1zM4 7h16v12c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V7z' 
        },
    ];

    const renderContent = () => {
        switch (currentView) {
            case 'update_password':
                return (
                    <PasswordUpdateScreen 
                        onUpdatePassword={onUpdatePassword}
                        onDone={() => setCurrentView('list')} 
                    />
                );
            case 'list':
            default:
                return (
                    <StoreListScreen 
                        userProfile={userProfile}
                        stores={stores}
                        userRatings={userRatings}
                        loading={loading}
                        onRateStore={onRateStore}
                        onSearch={onSearch}
                    />
                );
        }
    };

    return (
        <div className="normal-user-dashboard">
            <header className="dashboard-header">
                <div className="header-content">
                    <h1 className="app-title">Store Rater</h1>
                    <nav className="navigation">
                        {navigationItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setCurrentView(item.id)}
                                className={`nav-button ${currentView === item.id ? 'nav-button-active' : 'nav-button-inactive'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                                </svg>
                                {item.label}
                            </button>
                        ))}
                        <button 
                            onClick={onLogout}
                            className="logout-button"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="logout-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Log Out
                        </button>
                    </nav>
                </div>
            </header>
            
            <main className="dashboard-main">
                {renderContent()}
            </main>

            <footer className="dashboard-footer">
                <p>Welcome, {userProfile?.name || 'User'}!</p>
            </footer>
        </div>
    );
};

export default NormalUserDashboard;