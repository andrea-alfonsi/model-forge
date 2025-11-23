import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  username: string,
  email: string,
  token: string
}

const AuthContext = createContext<{user: User, isAuthenticated: boolean, isLoading: boolean} | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null as unknown as User);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('DEV Mode: Automatically setting up a mock user.');
      
      // Define a mock user object
      const mockUser: User = {
        username: 'dev.tester',
        email: 'dev@example.com',
        token: 'mock-token'
      };

      setUser(mockUser);
      setIsAuthenticated(true);
      setIsLoading(false);
      return; // Stop further production logic in DEV mode
    }

    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setTimeout(() => {
        const prodUser: User = { username: 'real.user', email: 'real@example.com', token: storedToken}; // TODO
        setUser(prodUser);
        setIsAuthenticated(true);
        setIsLoading(false);
      }, 100);
    } else {
      setIsLoading(false);
    }
  }, []);
  
  const contextValue = {
    user,
    isAuthenticated,
    isLoading
  };

  if (isLoading) {
      return <div>Loading authentication state...</div>;
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};