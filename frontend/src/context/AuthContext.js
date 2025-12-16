import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

// Detect account type based on email domain
const detectAccountType = (email) => {
  const personalDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com', 'protonmail.com', 'icloud.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (personalDomains.includes(domain)) {
    return 'personal';
  }
  return 'enterprise';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Ensure account_type is always set (default to 'personal' for backward compatibility)
        if (!parsedUser.account_type) {
          parsedUser.account_type = detectAccountType(parsedUser.email);
          localStorage.setItem('user', JSON.stringify(parsedUser));
          console.log('Updated stored user with account_type:', parsedUser);
        }
        setUser(parsedUser);
        setIsAuthenticated(true);
        console.log('Loaded user from localStorage:', parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
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
        avatar: 'J',
        account_type: 'enterprise'
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@gmail.com',
        password: 'demo123',
        country: 'Kenya',
        phone: '+254 712 345 678',
        avatar: 'J',
        account_type: 'personal'
      },
      {
        id: 3,
        name: 'Admin User',
        email: 'admin@company.com',
        password: 'admin123',
        country: 'South Africa',
        phone: '+27 82 123 4567',
        avatar: 'A',
        account_type: 'enterprise'
      },
      {
        id: 4,
        name: 'Admin',
        email: 'admin@admin.com',
        password: 'admin',
        country: 'United States',
        phone: '+1 555 000 0000',
        avatar: 'A',
        account_type: 'personal'
      },
      {
        id: 5,
        name: 'Enterprise Admin',
        email: 'admin@atonixcapital.com',
        password: 'enterprise123',
        country: 'Nigeria',
        phone: '+234 702 345 6789',
        avatar: 'E',
        account_type: 'enterprise'
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
    const accountType = detectAccountType(email);
    const mockUser = {
      id: Date.now(),
      name: email.split('@')[0],
      email: email,
      avatar: email.charAt(0).toUpperCase(),
      account_type: accountType
    };

    setUser(mockUser);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(mockUser));
    return { success: true, user: mockUser };
  };

  const register = (name, email, password, country, phone, account_type) => {
    // Mock registration - in production, this would call the backend API
    const mockUser = {
      id: Date.now(),
      name: name,
      email: email,
      country: country,
      phone: phone,
      avatar: name.charAt(0).toUpperCase(),
      account_type: account_type || detectAccountType(email)
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
