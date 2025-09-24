import React, { createContext, useContext, ReactNode, useState } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { id: string; email: string } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isDemo: boolean; // Helper to determine if we're in demo mode
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // For now, we'll simulate authentication state
  // In a real implementation, this would check localStorage, JWT tokens, etc.
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);

  const login = async (email: string, password: string) => {
    // Simulated login - in real implementation, this would call your auth API
    console.log('🔐 Attempting login for:', email);
    
    // For demo purposes, simulate a successful login
    setIsAuthenticated(true);
    setUser({ id: '1', email });
    
    console.log('✅ Login successful');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    console.log('👋 Logged out');
  };

  const isDemo = !isAuthenticated;

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        user, 
        login, 
        logout, 
        isDemo 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
