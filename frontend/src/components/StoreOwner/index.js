// components/StoreOwnerDashboard.js
import React, { useState, useEffect } from 'react';
import "./index.css"

const StoreOwnerDashboard = ({ currentUser, stores, userRatings, onLogout, onUpdatePassword, onRateStore }) => {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showAddStoreModal, setShowAddStoreModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [newStoreData, setNewStoreData] = useState({
        name: '',
        description: '',
        address: '',
        category: 'Electronics'
    });
    const [passwordError, setPasswordError] = useState('');
    const [storeError, setStoreError] = useState('');

    // Enhanced sample data with store owner specific data
    const sampleStores = [
        {
            id: 1,
            name: "Tech Galaxy",
            description: "Latest gadgets and electronics with expert support",
            address: "123 Tech Street, Silicon Valley",
            category: "Electronics",
            average_rating: 4.5,
            rating_count: 10,
            revenue: 12500,
            visits: 342,
            ratings: [
                { id: 1, userName: "John Doe", rating: 5, comment: "Excellent service and product quality!", date: "2024-01-15" },
                { id: 2, userName: "Jane Smith", rating: 4, comment: "Good products but could improve customer service", date: "2024-01-14" },
                { id: 3, userName: "Mike Johnson", rating: 3, comment: "Average experience, products are okay", date: "2024-01-13" }
            ]
        },
        {
            id: 2,
            name: "Book Haven", 
            description: "Wide collection of books and cozy reading corners",
            address: "456 Library Road, Knowledge City",
            category: "Books",
            average_rating: 4.2,
            rating_count: 8,
            revenue: 8900,
            visits: 215,
            ratings: [
                { id: 1, userName: "Alice Brown", rating: 5, comment: "Amazing book selection and friendly staff!", date: "2024-01-15" },
                { id: 2, userName: "Bob Wilson", rating: 4, comment: "Great atmosphere for reading", date: "2024-01-14" }
            ]
        }
    ];

    const sampleUsers = [
        { id: 1, name: "John Doe", email: "john@example.com", rating: 5, store: "Tech Galaxy", date: "2024-01-15" },
        { id: 2, name: "Jane Smith", email: "jane@example.com", rating: 4, store: "Tech Galaxy", date: "2024-01-14" },
        { id: 3, name: "Mike Johnson", email: "mike@example.com", rating: 3, store: "Tech Galaxy", date: "2024-01-13" },
        { id: 4, name: "Alice Brown", email: "alice@example.com", rating: 5, store: "Book Haven", date: "2024-01-15" },
        { id: 5, name: "Bob Wilson", email: "bob@example.com", rating: 4, store: "Book Haven", date: "2024-01-14" }
    ];

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);
        
        return () => clearTimeout(timer);
    }, []);

    // Safe data handling functions
    const getOwnerStores = () => {
        if (!stores || stores.length === 0) return sampleStores;
        return Array.isArray(stores) ? stores : [];
    };

    const getRatingUsers = () => {
        // Convert userRatings object to array format for display
        if (!userRatings || Object.keys(userRatings).length === 0) return sampleUsers;
        
        // Transform the userRatings object into an array for table display
        const usersArray = [];
        Object.keys(userRatings).forEach(userId => {
            const userRatingsData = userRatings[userId];
            Object.keys(userRatingsData).forEach(storeId => {
                const store = getOwnerStores().find(s => s.id == storeId);
                if (store) {
                    usersArray.push({
                        id: `${userId}-${storeId}`,
                        name: `User ${userId}`,
                        email: `user${userId}@example.com`,
                        rating: userRatingsData[storeId],
                        store: store.name,
                        date: new Date().toISOString().split('T')[0]
                    });
                }
            });
        });
        
        return usersArray.length > 0 ? usersArray : sampleUsers;
    };

    const getAllRatings = () => {
        const stores = getOwnerStores();
        let allRatings = [];
        stores.forEach(store => {
            if (store.ratings && Array.isArray(store.ratings)) {
                allRatings = [...allRatings, ...store.ratings.map(rating => ({
                    ...rating,
                    storeName: store.name
                }))];
            }
        });
        return allRatings;
    };

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        if (onLogout) {
            onLogout();
        }
        setShowLogoutConfirm(false);
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    const handlePasswordChange = () => {
        setShowPasswordModal(true);
    };

    const handleAddStore = () => {
        setShowAddStoreModal(true);
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        
        // Validation
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError("New passwords don't match");
            return;
        }
        
        if (passwordData.newPassword.length < 6) {
            setPasswordError("Password must be at least 6 characters long");
            return;
        }

        // Call the update password function
        if (onUpdatePassword) {
            onUpdatePassword(passwordData.currentPassword, passwordData.newPassword);
        }
        
        // Reset form
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setPasswordError('');
        setShowPasswordModal(false);
    };

    const handleAddStoreSubmit = (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!newStoreData.name.trim() || !newStoreData.description.trim() || !newStoreData.address.trim()) {
            setStoreError("All fields are required");
            return;
        }

        // Here you would typically make an API call to add the store
        console.log("Adding new store:", newStoreData);
        
        // For now, we'll just close the modal and reset the form
        setNewStoreData({
            name: '',
            description: '',
            address: '',
            category: 'Electronics'
        });
        setStoreError('');
        setShowAddStoreModal(false);
        
        // Show success message
        alert('Store added successfully! (This is a demo - in real app, it would save to database)');
    };

    const handlePasswordInputChange = (field, value) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: value
        }));
        setPasswordError('');
    };

    const handleStoreInputChange = (field, value) => {
        setNewStoreData(prev => ({
            ...prev,
            [field]: value
        }));
        setStoreError('');
    };

    const getRatingColor = (rating) => {
        if (rating >= 4.5) return 'rating-excellent';
        if (rating >= 4.0) return 'rating-good';
        if (rating >= 3.0) return 'rating-average';
        return 'rating-poor';
    };

    const getRatingStars = (rating) => {
        const numericRating = typeof rating === 'number' ? rating : parseFloat(rating) || 0;
        return (
            <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                        key={star}
                        className={`star ${star <= numericRating ? 'star-filled' : 'star-empty'}`}
                    >
                        {star <= numericRating ? '★' : '☆'}
                    </span>
                ))}
                <span className="rating-value">{numericRating.toFixed(1)}</span>
            </div>
        );
    };

    // Calculate statistics safely
    const calculateStats = () => {
        const ownerStores = getOwnerStores();
        const totalRatings = ownerStores.reduce((sum, store) => sum + (parseInt(store.rating_count) || 0), 0);
        const averageRating = ownerStores.length > 0 
            ? (ownerStores.reduce((sum, store) => sum + (parseFloat(store.average_rating) || 0), 0) / ownerStores.length).toFixed(1)
            : '0.0';
        const totalRevenue = ownerStores.reduce((sum, store) => sum + (parseInt(store.revenue) || 0), 0);
        const totalVisits = ownerStores.reduce((sum, store) => sum + (parseInt(store.visits) || 0), 0);

        return {
            totalStores: ownerStores.length,
            totalRatings,
            averageRating,
            totalRevenue,
            totalVisits
        };
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <h2>Loading Your Dashboard</h2>
                <p>Getting your stores ready...</p>
            </div>
        );
    }

    // Use safe data getters
    const ownerStores = getOwnerStores();
    const ratingUsers = getRatingUsers();
    const allRatings = getAllRatings();
    const stats = calculateStats();

    return (
        <div className="store-owner-dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-main">
                        <div className="header-icon">
                            <i className="fas fa-store"></i>
                        </div>
                        <div className="header-info">
                            <h1>Store Owner Dashboard</h1>
                            <p className="welcome-text">
                                Welcome back, <span className="owner-name">{currentUser?.name || 'Store Owner'}</span>
                            </p>
                        </div>
                    </div>
                    <div className="header-actions">
                        <button className="header-btn add-store-btn" onClick={handleAddStore}>
                            <i className="fas fa-plus"></i>
                            Add Store
                        </button>
                        <button className="header-btn password-btn" onClick={handlePasswordChange}>
                            <i className="fas fa-key"></i>
                            Change Password
                        </button>
                        <button className="header-btn logout-btn" onClick={handleLogout}>
                            <i className="fas fa-sign-out-alt"></i>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="dashboard-nav">
                <div className="nav-tabs">
                    {[
                        { id: 'overview', icon: 'chart-pie', label: 'Overview' },
                        { id: 'stores', icon: 'store', label: 'My Stores' },
                        { id: 'ratings', icon: 'star', label: 'Customer Ratings' },
                        { id: 'analytics', icon: 'chart-bar', label: 'Analytics' },
                        { id: 'users', icon: 'users', label: 'Rating Users' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                        >
                            <i className={`fas fa-${tab.icon}`}></i>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="dashboard-content">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="tab-content">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon total-stores">
                                    <i className="fas fa-store"></i>
                                </div>
                                <div className="stat-content">
                                    <h3 className="stat-value">{stats.totalStores}</h3>
                                    <p className="stat-label">Total Stores</p>
                                    <p className="stat-description">Active stores in your portfolio</p>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon average-rating">
                                    <i className="fas fa-star"></i>
                                </div>
                                <div className="stat-content">
                                    <h3 className={`stat-value ${getRatingColor(stats.averageRating)}`}>
                                        {stats.averageRating}
                                    </h3>
                                    <p className="stat-label">Average Rating</p>
                                    <p className="stat-description">Across all your stores</p>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon total-ratings">
                                    <i className="fas fa-comments"></i>
                                </div>
                                <div className="stat-content">
                                    <h3 className="stat-value">{stats.totalRatings}</h3>
                                    <p className="stat-label">Total Ratings</p>
                                    <p className="stat-description">Customer feedback received</p>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon revenue">
                                    <i className="fas fa-dollar-sign"></i>
                                </div>
                                <div className="stat-content">
                                    <h3 className="stat-value">${stats.totalRevenue.toLocaleString()}</h3>
                                    <p className="stat-label">Total Revenue</p>
                                    <p className="stat-description">From all stores</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="recent-activity">
                            <div className="section-header">
                                <h2>Recent Activity</h2>
                                <span className="view-all">View All</span>
                            </div>
                            <div className="activity-list">
                                {ratingUsers.slice(0, 5).map(user => (
                                    <div key={user.id} className="activity-item">
                                        <div className="activity-avatar">
                                            <i className="fas fa-user"></i>
                                        </div>
                                        <div className="activity-content">
                                            <p>
                                                <strong>{user.name}</strong> rated <strong>{user.store}</strong> 
                                                <span className={`rating-badge ${getRatingColor(user.rating)}`}>
                                                    {user.rating}/5
                                                </span>
                                            </p>
                                            <span className="activity-date">{user.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="quick-actions">
                            <h2>Quick Actions</h2>
                            <div className="action-buttons">
                                <button className="action-btn primary" onClick={handleAddStore}>
                                    <i className="fas fa-plus"></i>
                                    Add New Store
                                </button>
                                <button className="action-btn secondary" onClick={() => setActiveTab('analytics')}>
                                    <i className="fas fa-chart-bar"></i>
                                    View Analytics
                                </button>
                                <button className="action-btn secondary" onClick={() => setActiveTab('ratings')}>
                                    <i className="fas fa-star"></i>
                                    Check Ratings
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stores Tab */}
                {activeTab === 'stores' && (
                    <div className="tab-content">
                        <div className="section-header">
                            <div>
                                <h2>Your Stores</h2>
                                <p className="section-subtitle">Manage and view all your stores</p>
                            </div>
                            <div className="section-actions">
                                <span className="store-count">{ownerStores.length} stores</span>
                                <button className="btn-primary" onClick={handleAddStore}>
                                    <i className="fas fa-plus"></i>
                                    Add Store
                                </button>
                            </div>
                        </div>

                        <div className="stores-grid">
                            {ownerStores.map((store) => (
                                <div key={store.id} className="store-card">
                                    <div className="store-header">
                                        <div className="store-icon">
                                            <i className={`fas fa-${store.category === 'Books' ? 'book' : store.category === 'Food' ? 'utensils' : 'laptop'}`}></i>
                                        </div>
                                        <div className="store-info">
                                            <h3 className="store-name">{store.name}</h3>
                                            <p className="store-description">{store.description}</p>
                                            <div className="store-address">
                                                <i className="fas fa-map-marker-alt"></i>
                                                {store.address}
                                            </div>
                                        </div>
                                        <div className="store-rating">
                                            {getRatingStars(store.average_rating)}
                                            <p className="review-count">{store.rating_count} reviews</p>
                                        </div>
                                    </div>
                                    
                                    <div className="store-stats">
                                        <div className="store-stat">
                                            <span className="stat-value">${store.revenue?.toLocaleString() || '0'}</span>
                                            <span className="stat-label">Revenue</span>
                                        </div>
                                        <div className="store-stat">
                                            <span className="stat-value">{store.visits || '0'}</span>
                                            <span className="stat-label">Visits</span>
                                        </div>
                                        <div className="store-stat">
                                            <span className="stat-value">{store.rating_count || '0'}</span>
                                            <span className="stat-label">Ratings</span>
                                        </div>
                                    </div>

                                    <div className="store-actions">
                                        <button className="btn-outline">
                                            <i className="fas fa-edit"></i>
                                            Edit
                                        </button>
                                        <button className="btn-outline">
                                            <i className="fas fa-chart-line"></i>
                                            Analytics
                                        </button>
                                        <button className="btn-outline">
                                            <i className="fas fa-trash"></i>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Ratings Tab */}
                {activeTab === 'ratings' && (
                    <div className="tab-content">
                        <div className="section-header">
                            <div>
                                <h2>Customer Ratings & Feedback</h2>
                                <p className="section-subtitle">What customers are saying about your stores</p>
                            </div>
                            <span className="total-count">{stats.totalRatings} total ratings</span>
                        </div>

                        <div className="ratings-list">
                            {ownerStores.map(store => (
                                <div key={store.id} className="store-ratings-section">
                                    <div className="store-ratings-header">
                                        <h3 className="store-ratings-title">
                                            {store.name} - {getRatingStars(store.average_rating)}
                                        </h3>
                                        <span className="store-rating-count">{store.rating_count} ratings</span>
                                    </div>
                                    <div className="ratings-grid">
                                        {(store.ratings || []).map(rating => (
                                            <div key={rating.id} className="rating-card">
                                                <div className="rating-header">
                                                    <div className="user-avatar">
                                                        <i className="fas fa-user"></i>
                                                    </div>
                                                    <div className="user-info">
                                                        <h4>{rating.userName}</h4>
                                                        <span className="rating-date">{rating.date}</span>
                                                    </div>
                                                    <div className={`rating-score ${getRatingColor(rating.rating)}`}>
                                                        {getRatingStars(rating.rating)}
                                                    </div>
                                                </div>
                                                <p className="rating-comment">{rating.comment}</p>
                                                <div className="rating-actions">
                                                    <button className="btn-sm">
                                                        <i className="fas fa-reply"></i>
                                                        Reply
                                                    </button>
                                                    <button className="btn-sm">
                                                        <i className="fas fa-flag"></i>
                                                        Report
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="tab-content">
                        <div className="section-header">
                            <h2>Store Analytics</h2>
                            <p className="section-subtitle">Performance insights across all your stores</p>
                        </div>

                        <div className="analytics-grid">
                            <div className="analytics-card">
                                <h3>Rating Distribution</h3>
                                <div className="rating-distribution">
                                    {[5, 4, 3, 2, 1].map(stars => (
                                        <div key={stars} className="distribution-row">
                                            <span className="stars">{stars} ★</span>
                                            <div className="distribution-bar">
                                                <div 
                                                    className="distribution-fill"
                                                    style={{ width: `${(stars / 5) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="distribution-count">
                                                {Math.round((stars / 5) * stats.totalRatings)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="analytics-card">
                                <h3>Store Performance</h3>
                                <div className="performance-stats">
                                    {ownerStores.map(store => (
                                        <div key={store.id} className="performance-item">
                                            <span className="store-name">{store.name}</span>
                                            <div className="performance-bar">
                                                <div 
                                                    className="performance-fill"
                                                    style={{ width: `${(store.average_rating / 5) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="performance-rating">
                                                {store.average_rating}/5
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="tab-content">
                        <div className="section-header">
                            <div>
                                <h2>Users Who Submitted Ratings</h2>
                                <p className="section-subtitle">Customers who have rated your stores</p>
                            </div>
                            <span className="total-count">{ratingUsers.length} users</span>
                        </div>

                        <div className="users-table-container">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Email</th>
                                        <th>Store Rated</th>
                                        <th>Rating</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ratingUsers.map(user => (
                                        <tr key={user.id}>
                                            <td>
                                                <div className="user-cell">
                                                    <div className="user-avatar-small">
                                                        <i className="fas fa-user"></i>
                                                    </div>
                                                    <div>
                                                        <div className="user-name">{user.name}</div>
                                                        <div className="user-id">ID: {user.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className="store-badge">{user.store}</span>
                                            </td>
                                            <td>
                                                <span className={`rating-badge ${getRatingColor(user.rating)}`}>
                                                    {user.rating}/5
                                                </span>
                                            </td>
                                            <td>{user.date}</td>
                                            <td>
                                                <div className="action-buttons-small">
                                                    <button className="btn-icon" title="View Profile">
                                                        <i className="fas fa-eye"></i>
                                                    </button>
                                                    <button className="btn-icon" title="Send Message">
                                                        <i className="fas fa-envelope"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Confirm Logout</h3>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to logout?</p>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={cancelLogout}>
                                Cancel
                            </button>
                            <button className="btn-primary logout-confirm" onClick={confirmLogout}>
                                Yes, Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Change Password</h3>
                            <button className="modal-close" onClick={() => setShowPasswordModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handlePasswordSubmit}>
                            <div className="modal-body">
                                {passwordError && (
                                    <div className="error-message">
                                        <i className="fas fa-exclamation-circle"></i>
                                        {passwordError}
                                    </div>
                                )}
                                <div className="form-group">
                                    <label>Current Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowPasswordModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Store Modal */}
            {showAddStoreModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Add New Store</h3>
                            <button className="modal-close" onClick={() => setShowAddStoreModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleAddStoreSubmit}>
                            <div className="modal-body">
                                {storeError && (
                                    <div className="error-message">
                                        <i className="fas fa-exclamation-circle"></i>
                                        {storeError}
                                    </div>
                                )}
                                <div className="form-group">
                                    <label>Store Name</label>
                                    <input
                                        type="text"
                                        value={newStoreData.name}
                                        onChange={(e) => handleStoreInputChange('name', e.target.value)}
                                        placeholder="Enter store name"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        value={newStoreData.description}
                                        onChange={(e) => handleStoreInputChange('description', e.target.value)}
                                        placeholder="Describe your store"
                                        rows="3"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Address</label>
                                    <textarea
                                        value={newStoreData.address}
                                        onChange={(e) => handleStoreInputChange('address', e.target.value)}
                                        placeholder="Store address"
                                        rows="2"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        value={newStoreData.category}
                                        onChange={(e) => handleStoreInputChange('category', e.target.value)}
                                    >
                                        <option value="Electronics">Electronics</option>
                                        <option value="Books">Books</option>
                                        <option value="Food">Food & Beverage</option>
                                        <option value="Fashion">Fashion</option>
                                        <option value="Home">Home & Garden</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowAddStoreModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Add Store
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoreOwnerDashboard;