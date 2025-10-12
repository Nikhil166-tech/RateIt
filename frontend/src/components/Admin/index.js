import React, { useState, useEffect, useMemo } from 'react';
import './index.css';

const AdminDashboard = ({ user, onLogout, stores, onAddStore, onGetUsers, onAddUser }) => {
    const [userList, setUserList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentView, setCurrentView] = useState('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [ratingsCount, setRatingsCount] = useState(0);

    // 🚨 DEBUG: Check what stores we're receiving from backend
    console.log('🛍️ AdminDashboard - Stores prop from backend:', stores);
    console.log('🛍️ AdminDashboard - Stores length:', stores?.length);

    // ✅ Use only backend stores data - no dummy data
    const displayStores = useMemo(() => {
        console.log('🔄 Processing stores data from backend:', stores);
        
        // If stores is undefined, null, or empty array, return empty array
        if (!stores || !Array.isArray(stores) || stores.length === 0) {
            console.log('⚠️ No stores data available from backend');
            return [];
        }
        
        console.log('✅ Using backend stores data:', stores.length, 'stores');
        return stores;
    }, [stores]);

    // Load users when user-list is active
    useEffect(() => {
        const loadUsersIfNeeded = async () => {
            if ((currentView === 'user-list' || currentView === 'dashboard') && userList.length === 0) {
                setLoading(true);
                try {
                    console.log('👤 Loading users from backend...');
                    const users = await onGetUsers();
                    setUserList(users);
                    
                    // Calculate total ratings count from backend stores
                    const totalRatings = displayStores.reduce((sum, store) => sum + (store.rating_count || 0), 0);
                    setRatingsCount(totalRatings);
                } catch (error) {
                    console.error('Error loading users:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        loadUsersIfNeeded();
    }, [currentView, userList.length, onGetUsers, displayStores]);

    // Filter stores based on search - using only backend data
    const filteredStores = useMemo(() => {
        if (!displayStores || displayStores.length === 0) return [];
        
        return displayStores.filter(store => 
            store.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            store.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            store.address?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [displayStores, searchTerm]);

    // Filter users based on search and role
    const filteredUsers = useMemo(() => {
        return userList.filter(user => 
            (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             user.address?.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (filterRole === 'all' || user.role === filterRole)
        );
    }, [userList, searchTerm, filterRole]);

    const handleAddStore = async (storeData) => {
        try {
            await onAddStore(storeData);
        } catch (error) {
            console.error('Error adding store:', error);
        }
    };

    const handleAddUser = async (userData) => {
        try {
            const newUser = await onAddUser(userData);
            setUserList(prev => [...prev, newUser]);
            return newUser;
        } catch (error) {
            console.error('Error adding user:', error);
            throw error;
        }
    };

    const handleLogout = () => {
        onLogout();
    };

    // Enhanced Dashboard with all required stats
    const Dashboard = () => (
        <div className="dashboard-grid">
            <div className="stat-card">
                <h3>Total Users</h3>
                <p className="stat-number">{userList.length}</p>
            </div>
            <div className="stat-card">
                <h3>Total Stores</h3>
                <p className="stat-number">{displayStores.length}</p>
            </div>
            <div className="stat-card">
                <h3>Total Ratings</h3>
                <p className="stat-number">{ratingsCount}</p>
            </div>
            <div className="stat-card">
                <h3>System Status</h3>
                <p className="stat-number status-online">Online</p>
            </div>
        </div>
    );

    // Enhanced Store List Component - Now using only backend data
    const StoreList = () => {
        console.log('🛍️ StoreList - Display stores from backend:', displayStores);
        console.log('🛍️ StoreList - Filtered stores:', filteredStores);

        return (
            <div className="content-card store-list-container">
                <div className="listing-header">
                    <div className="header-content">
                        <h3 className="content-title">Store Directory</h3>
                        <p className="content-subtitle">Manage and view all stores in the system</p>
                    </div>
                    
                    {/* Search Control */}
                    <div className="filter-controls">
                        <div className="search-wrapper">
                            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.3-4.3"></path>
                            </svg>
                            <input
                                type="text"
                                placeholder="Search stores by name, email, or address..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                    </div>
                </div>
                
                {filteredStores.length > 0 ? (
                    <div className="table-container">
                        <div className="table-responsive">
                            <table className="data-table stores-table">
                                <thead className="table-header">
                                    <tr>
                                        <th className="table-header-cell name-header">Store Name</th>
                                        <th className="table-header-cell email-header">Email</th>
                                        <th className="table-header-cell address-header">Address</th>
                                        <th className="table-header-cell rating-header">Rating</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body">
                                    {filteredStores.map((store, index) => (
                                        <tr key={store.id || index} className="table-row store-row">
                                            <td className="table-cell name-cell">
                                                <div className="store-name-wrapper">
                                                    <div className="store-avatar">
                                                        {store.name?.charAt(0) || 'S'}
                                                    </div>
                                                    <div className="store-info">
                                                        <div className="store-name">{store.name || 'N/A'}</div>
                                                        {store.description && (
                                                            <div className="store-description">{store.description}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="table-cell email-cell">
                                                <div className="email-wrapper">
                                                    <svg className="email-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                                        <polyline points="22,6 12,13 2,6"></polyline>
                                                    </svg>
                                                    <span className="email-text">{store.email || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="table-cell address-cell">
                                                <div className="address-wrapper">
                                                    <svg className="address-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                                        <circle cx="12" cy="10" r="3"></circle>
                                                    </svg>
                                                    <span className="address-text">{store.address || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="table-cell rating-cell">
                                                <div className="rating-display">
                                                    {store.average_rating ? (
                                                        <div className="rating-content">
                                                            <div className="stars">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <span
                                                                        key={star}
                                                                        className={`star ${star <= Math.floor(store.average_rating) ? 'filled' : ''} ${store.average_rating % 1 !== 0 && star === Math.ceil(store.average_rating) ? 'half-filled' : ''}`}
                                                                    >
                                                                        ⭐
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            <div className="rating-details">
                                                                <span className="rating-value">{store.average_rating}/5</span>
                                                                <span className="rating-count">({store.rating_count || 0} reviews)</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="no-ratings">
                                                            <span className="rating-na">No ratings yet</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">🏪</div>
                        <h4>No stores found</h4>
                        <p>
                            {searchTerm ? `No results for "${searchTerm}"` : 'No stores available from backend'}
                        </p>
                        <div className="debug-info">
                            <p><strong>Backend Data Status:</strong></p>
                            <p>Stores from backend: {stores?.length || 0}</p>
                            <p>Display stores: {displayStores.length}</p>
                            <p>Filtered stores: {filteredStores.length}</p>
                        </div>
                        <button className="add-first-store-btn" onClick={() => setCurrentView('add-store')}>
                            Add Your First Store
                        </button>
                    </div>
                )}
                
                {/* Results count */}
                <div className="results-count">
                    <div className="results-info">
                        Showing <strong>{filteredStores.length}</strong> of <strong>{displayStores.length}</strong> stores
                        {searchTerm && (
                            <span className="search-term"> for "<strong>{searchTerm}</strong>"</span>
                        )}
                    </div>
                    {displayStores.length > 0 && (
                        <div className="table-actions">
                            <button className="export-btn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                Export
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // User Card Component
    const UserCard = ({ user }) => {
        const storeOwnerRating = user.role === 'owner' ? 
            (displayStores.find(store => store.owner_id === user.id)?.average_rating || null) : 
            null;

        return (
            <div className="data-card user-card">
                <div className="card-header">
                    <h4 className="card-title">{user.name || user.email}</h4>
                    <div className={`role-badge role-${user.role}`}>
                        {user.role || 'user'}
                    </div>
                </div>
                <div className="card-content">
                    <div className="card-field">
                        <span className="field-label">Email:</span>
                        <span className="field-value">{user.email}</span>
                    </div>
                    <div className="card-field">
                        <span className="field-label">Address:</span>
                        <span className="field-value">{user.address || 'N/A'}</span>
                    </div>
                    <div className="card-field">
                        <span className="field-label">Role:</span>
                        <span className="field-value">{user.role || 'user'}</span>
                    </div>
                    {storeOwnerRating && (
                        <div className="card-field">
                            <span className="field-label">Store Rating:</span>
                            <span className="field-value rating-value">⭐ {storeOwnerRating}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // User List Component
    const UserList = () => {
        return (
            <div className="content-card">
                <div className="listing-header">
                    <h3 className="content-title">User List ({userList.length} users)</h3>
                    
                    {/* Search and Filter Controls */}
                    <div className="filter-controls">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="role-filter"
                        >
                            <option value="all">All Roles</option>
                            <option value="user">Normal User</option>
                            <option value="owner">Store Owner</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
                
                {filteredUsers.length > 0 ? (
                    <div className="cards-grid">
                        {filteredUsers.map((user, index) => (
                            <UserCard key={user.id || index} user={user} />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">👤</div>
                        <h4>No users found</h4>
                        <p>
                            {searchTerm ? `No results for "${searchTerm}"` : 'No users available from backend'}
                            {filterRole !== 'all' && ` in ${filterRole} role`}
                        </p>
                    </div>
                )}
                
                {/* Results count */}
                <div className="results-count">
                    Showing {filteredUsers.length} users
                    {searchTerm && ` for "${searchTerm}"`}
                    {filterRole !== 'all' && ` in ${filterRole} role`}
                </div>
            </div>
        );
    };

    // Enhanced navigation
    const navigation = [
        { id: 'dashboard', label: 'Dashboard', icon: 'M12 2l10 5-10 5-10-5 10-5zM2 12l10 5 10-5M12 22v-10' },
        { id: 'add-user', label: 'Add User', icon: 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' },
        { id: 'add-store', label: 'Add Store', icon: 'M12 5v14M5 12h14' },
        { id: 'user-list', label: 'User List', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M16 3.13a9 9 0 1 1-14.85 9.07' },
        { id: 'store-list', label: 'Store List', icon: 'M10 20l-7 1V3l7 1 7-1 7 1V3l-7 1z' },
    ];

    const renderContent = () => {
        if (loading && currentView !== 'dashboard') {
            return <div className="loading-state">Loading...</div>;
        }

        switch (currentView) {
            case 'dashboard':
                return <Dashboard />;
            case 'add-user':
                return <AddUser onAddUser={handleAddUser} />;
            case 'add-store':
                return <AddStore onAddStore={handleAddStore} />;
            case 'user-list':
                return <UserList />;
            case 'store-list':
                return <StoreList />;
            default:
                return <div>Select a view</div>;
        }
    };

    return (
        <div className="admin-layout">
            <div className="sidebar">
                <h1 className="sidebar-title">
                    <svg xmlns="http://www.w3.org/2000/svg" className="sidebar-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2l10 5-10 5-10-5 10-5zM2 12l10 5 10-5M12 22v-10"/>
                    </svg>
                    <span>Admin Control</span>
                </h1>
                
                <nav className="sidebar-nav">
                    {navigation.map(item => (
                        <button 
                            key={item.id}
                            onClick={() => {
                                setCurrentView(item.id);
                                setSearchTerm(''); // Reset search when changing views
                                setFilterRole('all'); // Reset filter when changing views
                            }}
                            className={`nav-button ${currentView === item.id ? 'nav-button-active' : ''}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d={item.icon} />
                            </svg>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    ))}
                </nav>
                
                <div className="sidebar-footer">
                    <p className="user-status-label">Logged in as:</p>
                    <p className="user-display">{user?.email} (Admin)</p>
                    <button onClick={handleLogout} className="logout-button">Log Out</button>
                </div>
            </div>

            <div className="main-content">
                <header className="content-header">
                    <h2 className="content-title">
                        {navigation.find(n => n.id === currentView)?.label || 'Admin Dashboard'}
                    </h2>
                    <p className="content-subtitle">System Administrator Panel</p>
                </header>
                {renderContent()}
            </div>
        </div>
    );
};

// AddStore Component
const AddStore = ({ onAddStore }) => {
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleStoreSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        
        const storeData = {
            name: formData.get('name'),
            email: formData.get('email'),
            address: formData.get('address')
        };

        try {
            await onAddStore(storeData);
            e.target.reset();
            showMessage('Store created successfully!', 'success');
        } catch (error) {
            showMessage('Failed to create store: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="content-card">
            <h3 className="content-title">Add New Store</h3>
            {message && (
                <p className={`message-alert ${message.type === 'success' ? 'message-success' : 'message-error'}`}>
                    {message.text}
                </p>
            )}
            <form onSubmit={handleStoreSubmit} className="form-container">
                <input type="text" name="name" placeholder="Store Name" required className="form-input" />
                <input type="email" name="email" placeholder="Store Email" className="form-input" />
                <textarea name="address" placeholder="Store Address" required className="form-textarea"></textarea>
                <button type="submit" className="form-submit-button" disabled={loading}>
                    {loading ? 'Creating Store...' : 'Add New Store'}
                </button>
            </form>
        </div>
    );
};

// AddUser Component
const AddUser = ({ onAddUser }) => {
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            address: formData.get('address'),
            role: formData.get('role')
        };

        try {
            await onAddUser(userData);
            e.target.reset();
            showMessage('User created successfully!', 'success');
        } catch (error) {
            showMessage('Failed to create user: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="content-card">
            <h3 className="content-title">Add New User</h3>
            {message && (
                <p className={`message-alert ${message.type === 'success' ? 'message-success' : 'message-error'}`}>
                    {message.text}
                </p>
            )}
            <form onSubmit={handleUserSubmit} className="form-container">
                <input type="text" name="name" placeholder="Full Name" required className="form-input" />
                <input type="email" name="email" placeholder="Email Address" required className="form-input" />
                <input type="password" name="password" placeholder="Password" required className="form-input" />
                <textarea name="address" placeholder="Address" required className="form-textarea"></textarea>
                <select name="role" required className="form-input">
                    <option value="">Select Role</option>
                    <option value="user">Normal User</option>
                    <option value="owner">Store Owner</option>
                    <option value="admin">Admin</option>
                </select>
                <button type="submit" className="form-submit-button" disabled={loading}>
                    {loading ? 'Creating User...' : 'Add New User'}
                </button>
            </form>
        </div>
    );
};

export default AdminDashboard;