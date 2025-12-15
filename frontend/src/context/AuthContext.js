import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Mock authentication - in production, this would call the backend API
    
    // Test users for easy login
    const testUsers = [
      {
        id: 1,
        name: 'John Doe',
        email: 'test@test.com',
        password: 'password',
        country: 'Nigeria',
        phone: '+234 801 234 5678',
        avatar: 'J'
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'demo@demo.com',
        password: 'demo123',
        country: 'Kenya',
        phone: '+254 712 345 678',
        avatar: 'J'
      },
      {
        id: 3,
        name: 'Admin User',
        email: 'admin@admin.com',
        password: 'admin123',
        country: 'South Africa',
        phone: '+27 82 123 4567',
        avatar: 'A'
      }
    ];

    // Check if credentials match any test user
    const foundUser = testUsers.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      return { success: true, user: userWithoutPassword };
    }

    // If no match, accept any email/password (for flexibility)
    const mockUser = {
      id: Date.now(),
      name: email.split('@')[0],
      email: email,
      avatar: email.charAt(0).toUpperCase()
    };

    setUser(mockUser);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(mockUser));
    return { success: true, user: mockUser };
  };

  const register = (name, email, password, country, phone) => {
    // Mock registration - in production, this would call the backend API
    const mockUser = {
      id: Date.now(),
      name: name,
      email: email,
      country: country,
      phone: phone,
      avatar: name.charAt(0).toUpperCase()
    };

    setUser(mockUser);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(mockUser));
    return { success: true, user: mockUser };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
