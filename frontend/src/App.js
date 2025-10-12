import React, { useState, useEffect, useCallback } from 'react';
import LoginForm from './components/Login';
import AdminDashboard from './components/Admin';
import SignupForm from './components/Signup';
import NormalUserDashboard from './components/NormalUser';
import StoreOwnerDashboard from './components/StoreOwner'; 

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

const App = () => {
    const [user, setUser] = useState(null);
    const [isLogin, setIsLogin] = useState(true);
    const [stores, setStores] = useState([]);
    const [userRatings, setUserRatings] = useState({});
    const [loading, setLoading] = useState(false);
    const [sessionChecked, setSessionChecked] = useState(false);

    // 🚨 DEBUG: Monitor critical state changes
    useEffect(() => {
        console.log('🛍️ App.js - CRITICAL - Stores state:', stores);
        console.log('🛍️ App.js - CRITICAL - Stores length:', stores.length);
        console.log('👤 App.js - CRITICAL - User state:', user);
    }, [stores, user]);

    // 🚨 ENHANCED API CALL - Handles both GET and POST
    const apiRequest = useCallback(async (endpoint, options = {}) => {
        console.log(`🌐 API CALL: ${options.method || 'GET'} ${API_BASE_URL}${endpoint}`);
        
        const config = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            body: options.body ? JSON.stringify(options.body) : undefined,
        };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            console.log('📡 Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const result = await response.json();
            console.log('✅ API SUCCESS:', result);
            return result;
        } catch (error) {
            console.error('❌ API FAILED:', error);
            throw error;
        }
    }, []);

    // 🚨 ENHANCED: Load stores from persistent endpoint
    const loadStores = useCallback(async () => {
        console.log('🔄 loadStores - Loading from persistent endpoint...');
        try {
            const result = await apiRequest('/stores');
            console.log('🔍 loadStores - Result:', result);
            
            if (result && result.success && result.stores) {
                console.log('🎉 loadStores - SUCCESS! Setting stores with:', result.stores.length, 'stores');
                setStores(result.stores);
                return true;
            } else {
                console.log('❌ loadStores - No stores in response');
                setStores([]);
                return false;
            }
        } catch (error) {
            console.error('💥 loadStores - Complete failure:', error);
            // Fallback to debug endpoint
            try {
                console.log('🔄 loadStores - Trying debug endpoint...');
                const debugResult = await apiRequest('/debug/stores');
                if (debugResult && debugResult.success && debugResult.stores) {
                    console.log('🔄 loadStores - Using debug stores data');
                    setStores(debugResult.stores);
                    return true;
                }
            } catch (debugError) {
                console.error('💥 loadStores - Debug endpoint also failed');
            }
            // Final fallback - create some demo stores
            console.log('🔄 loadStores - Creating demo stores as final fallback');
            const demoStores = [
                {
                    id: 1,
                    name: "Tech Galaxy",
                    description: "Latest gadgets and electronics with expert support",
                    address: "123 Tech Street, Silicon Valley",
                    average_rating: 4.5,
                    rating_count: 10
                },
                {
                    id: 2,
                    name: "Book Haven", 
                    description: "Wide collection of books and cozy reading corners",
                    address: "456 Library Road, Knowledge City",
                    average_rating: 4.2,
                    rating_count: 8
                },
                {
                    id: 3,
                    name: "Brew & Bean Café",
                    description: "Artisan coffee, fresh pastries and comfortable workspace", 
                    address: "789 Brew Street, Morning Town",
                    average_rating: 4.7,
                    rating_count: 15
                }
            ];
            setStores(demoStores);
            return true;
        }
    }, [apiRequest]);

    // 🚨 FIXED: Load user data
    const loadUserData = useCallback(async (currentUser) => {
        if (!currentUser) {
            console.log('🚫 No user provided to loadUserData');
            return;
        }
        
        console.log('🔄 loadUserData - Starting for user:', currentUser.email);
        const success = await loadStores();
        console.log('🔄 loadUserData - Stores load result:', success);
        return success;
    }, [loadStores]);

    // 🚨 ENHANCED: Add store with persistence
    const handleAddStore = async (storeData) => {
        console.log('🏪 handleAddStore - Adding store:', storeData);
        try {
            const result = await apiRequest('/stores', {
                method: 'POST',
                body: storeData
            });
            
            if (result && result.success && result.store) {
                console.log('✅ handleAddStore - Store added to server');
                // Update local state with the new store from server
                setStores(prev => [...prev, result.store]);
                return result.store;
            } else {
                throw new Error('Failed to add store to server');
            }
        } catch (error) {
            console.error('❌ handleAddStore - Server error, adding locally:', error);
            // Fallback: add to local state only
            const newStore = { 
                id: Date.now(), 
                ...storeData, 
                average_rating: 0, 
                rating_count: 0 
            };
            setStores(prev => [...prev, newStore]);
            return newStore;
        }
    };

    // 🚨 ENHANCED: Add user with persistence
    const handleAddUser = async (userData) => {
        console.log('👤 handleAddUser - Adding user:', userData);
        try {
            const result = await apiRequest('/users', {
                method: 'POST',
                body: userData
            });
            
            if (result && result.success && result.user) {
                console.log('✅ handleAddUser - User added to server');
                return result.user;
            } else {
                throw new Error('Failed to add user to server');
            }
        } catch (error) {
            console.error('❌ handleAddUser - Server error:', error);
            // Fallback: return local user only
            return { id: Date.now(), ...userData };
        }
    };

    // 🚨 ENHANCED: Get users from persistent endpoint
    const handleGetUsers = async () => {
        console.log('📋 handleGetUsers - Getting users from server');
        try {
            const result = await apiRequest('/users');
            if (result && result.success && result.users) {
                console.log('✅ handleGetUsers - Got users from server:', result.users.length);
                return result.users;
            } else {
                throw new Error('No users in response');
            }
        } catch (error) {
            console.error('❌ handleGetUsers - Server error, trying debug endpoint:', error);
            // Fallback to debug endpoint
            try {
                const debugResult = await apiRequest('/debug/users');
                return debugResult.users || [];
            } catch (debugError) {
                console.error('💥 handleGetUsers - Debug endpoint also failed');
                return [];
            }
        }
    };

    // 🚨 ENHANCED: Rate store with persistence
    const handleRateStore = async (storeId, newRatingValue) => {
        console.log('⭐ handleRateStore - Rating store:', storeId, 'with rating:', newRatingValue);
        try {
            const result = await apiRequest(`/stores/${storeId}/rate`, {
                method: 'POST',
                body: { 
                    rating: newRatingValue,
                    userId: user?.id // Include user ID for the backend
                }
            });
            
            if (result && result.success && result.store) {
                console.log('✅ handleRateStore - Rating submitted to server');
                // Update local stores state with the updated store from server
                setStores(prevStores => 
                    prevStores.map(store => 
                        store.id === storeId ? result.store : store
                    )
                );
                return Promise.resolve();
            } else {
                throw new Error('Failed to rate store on server');
            }
        } catch (error) {
            console.error('❌ handleRateStore - Server error, updating locally:', error);
            // Fallback: update local state only
            setStores(prevStores => 
                prevStores.map(store => {
                    if (store.id === storeId) {
                        const currentAvg = store.average_rating || 0;
                        const currentCount = store.rating_count || 0;
                        const userPreviousRating = userRatings[user?.id]?.[storeId] || 0;
                        
                        let newAvg, newCount;
                        if (userPreviousRating > 0) {
                            newAvg = ((currentAvg * currentCount) - userPreviousRating + newRatingValue) / currentCount;
                            newCount = currentCount;
                        } else {
                            newAvg = ((currentAvg * currentCount) + newRatingValue) / (currentCount + 1);
                            newCount = currentCount + 1;
                        }
                        
                        return {
                            ...store,
                            average_rating: parseFloat(newAvg.toFixed(1)),
                            rating_count: newCount
                        };
                    }
                    return store;
                })
            );
            
            // Update user ratings
            if (user?.id) {
                setUserRatings(prev => ({
                    ...prev,
                    [user.id]: {
                        ...prev[user.id],
                        [storeId]: newRatingValue
                    }
                }));
            }
            
            return Promise.resolve();
        }
    };

    // 🚨 FIXED: Login function with EXACT role detection
    const handleLogin = async (authData) => {
        setLoading(true);
        console.log('🔐 handleLogin - Starting with:', authData.email);
        
        try {
            // 🎯 EXACT ROLE DETECTION - Fixed for store owner
            let userRole = 'user'; // default
            
            const email = authData.email.toLowerCase().trim();
            
            // Exact email matching first
            if (email === 'admin@test.com') {
                userRole = 'admin';
            } else if (email === 'owner@test.com') {
                userRole = 'owner';
            }
            // Then check for patterns as fallback
            else if (email.includes('admin@')) {
                userRole = 'admin';
            } else if (email.includes('owner@')) {
                userRole = 'owner';
            }

            console.log('🎯 handleLogin - Email:', email);
            console.log('🎯 handleLogin - Role detected:', userRole);

            // Create user with proper role
            const mockUser = {
                id: Date.now(),
                email: authData.email,
                role: userRole,
                name: authData.email.split('@')[0]
            };

            console.log('✅ handleLogin - Setting user state...');
            console.log('✅ handleLogin - User object:', mockUser);
            
            // Store in localStorage first
            localStorage.setItem('token', 'mock-token');
            localStorage.setItem('user', JSON.stringify(mockUser));
            
            // Then set state and load data
            setUser(mockUser);
            
            console.log('✅ handleLogin - Loading data for new user...');
            await loadUserData(mockUser);
            
            console.log('🎉 handleLogin - COMPLETED SUCCESSFULLY');
            console.log('👤 Final user object in state:', mockUser);
            
        } catch (error) {
            console.error('💥 handleLogin - Error:', error);
            
            // Fallback with same role detection
            let userRole = 'user';
            const email = authData.email.toLowerCase().trim();
            
            if (email === 'admin@test.com' || email.includes('admin@')) {
                userRole = 'admin';
            } else if (email === 'owner@test.com' || email.includes('owner@')) {
                userRole = 'owner';
            }

            const mockUser = {
                id: Date.now(),
                email: authData.email,
                role: userRole,
                name: authData.email.split('@')[0]
            };
            
            localStorage.setItem('token', 'mock-token');
            localStorage.setItem('user', JSON.stringify(mockUser));
            setUser(mockUser);
            await loadUserData(mockUser);
            
            console.log('🔄 Fallback login - User:', mockUser);
        } finally {
            setLoading(false);
        }
    };

    // Other functions
    const handleSignup = async (authData) => {
        setLoading(true);
        try {
            const mockUser = {
                id: Date.now(),
                email: authData.email,
                role: 'user',
                name: authData.name || authData.email.split('@')[0]
            };

            localStorage.setItem('token', 'mock-token');
            localStorage.setItem('user', JSON.stringify(mockUser));
            setUser(mockUser);
            await loadUserData(mockUser);
        } catch (error) {
            console.error('Signup error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        console.log('🚪 Logging out...');
        setUser(null);
        setIsLogin(true);
        setStores([]);
        setUserRatings({});
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const handleSearchStores = async (searchTerm) => {
        if (!searchTerm.trim()) return stores;
        
        return stores.filter(store => 
            store.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (store.description && store.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    };

    const handleUpdatePassword = async (newPassword) => {
        console.log('🔐 Mock password update');
        alert('Mock: Password would be updated to: ' + newPassword);
        return Promise.resolve();
    };

    // 🚨 FIXED: Session check
    useEffect(() => {
        const checkSession = async () => {
            if (sessionChecked) {
                console.log('🔍 Session already checked, skipping...');
                return;
            }

            console.log('🔍 App.js - Checking for existing session...');
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');
            
            if (token && savedUser) {
                try {
                    const userData = JSON.parse(savedUser);
                    console.log('🔍 App.js - Found existing user:', userData.email);
                    console.log('🔍 App.js - User role from storage:', userData.role);
                    
                    // Set user state
                    setUser(userData);
                    
                    // Load data after a brief delay to ensure state is set
                    setTimeout(async () => {
                        console.log('🔍 App.js - Loading data for restored session...');
                        await loadUserData(userData);
                    }, 200);
                    
                } catch (error) {
                    console.error('❌ Session restore error:', error);
                }
            } else {
                console.log('🔍 App.js - No existing session found');
            }
            
            setSessionChecked(true);
        };

        checkSession();
    }, [sessionChecked, loadUserData]);

    // 🚨 ENHANCED: Render dashboard with better debugging
    const renderDashboard = () => {
        if (!user) {
            console.log('❌ No user for dashboard');
            return null;
        }

        console.log('🎯 App.js - Rendering dashboard for role:', user.role);
        console.log('👤 App.js - Full user object:', user);
        console.log('📤 App.js - Passing stores to dashboard. Length:', stores.length);
        console.log('📤 App.js - Stores data:', stores);

        // DIRECT ROLE CHECKING - no mapping
        if (user.role === 'admin') {
            console.log('🚀 RENDERING ADMIN DASHBOARD');
            return (
                <AdminDashboard 
                    user={user} 
                    onLogout={handleLogout}
                    onAddUser={handleAddUser}
                    onAddStore={handleAddStore}
                    onGetUsers={handleGetUsers}
                    stores={stores}
                />
            );
        }
        
        if (user.role === 'owner') {
            console.log('🏪 RENDERING STORE OWNER DASHBOARD');
            console.log('🏪 StoreOwnerDashboard props:', {
                currentUser: user,
                storesCount: stores.length,
                userRatings: userRatings,
                hasRateStore: !!handleRateStore
            });
            
            return (
                <StoreOwnerDashboard
                    currentUser={user}
                    stores={stores}
                    userRatings={userRatings}
                    onLogout={handleLogout}
                    onRateStore={handleRateStore}
                />
            );
        }
        
        // DEFAULT: Normal User
        console.log('👤 RENDERING NORMAL USER DASHBOARD');
        return (
            <NormalUserDashboard
                userProfile={user}
                onLogout={handleLogout}
                stores={stores}
                userRatings={userRatings}
                loading={loading}
                onRateStore={handleRateStore}
                onSearch={handleSearchStores}
                onUpdatePassword={handleUpdatePassword}
            />
        );
    };

    if (user) {
        return renderDashboard();
    }

    return (
        <div>
            {isLogin ? (
                <LoginForm 
                    onLogin={handleLogin} 
                    switchToSignup={() => setIsLogin(false)} 
                    loading={loading}
                />
            ) : (
                <SignupForm 
                    onSignup={handleSignup} 
                    switchToLogin={() => setIsLogin(true)} 
                    loading={loading}
                />
            )}
            
            <div className="fixed bottom-4 left-4 bg-blue-100 border border-blue-400 rounded-lg p-4 max-w-sm">
                <h3 className="font-bold text-blue-800 mb-2">TEST CREDENTIALS:</h3>
                <div className="text-blue-700 text-sm space-y-1">
                    <div><strong>Admin:</strong> admin@test.com</div>
                    <div><strong>Store Owner:</strong> owner@test.com</div>
                    <div><strong>Normal User:</strong> user@test.com</div>
                    <div><strong>Password:</strong> anything</div>
                </div>
            </div>
        </div>
    );
};

export default App;