import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { login as authLogin, logout as authLogout, isAuthenticated as checkIsAuthenticated, initializeAuth } from "./auth";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
    setIsAuthenticated(checkIsAuthenticated());
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    const result = await authLogin(username, password);

    if (result.success) {
      setIsAuthenticated(true);
      setError(null);
      setIsLoading(false);
      return true;
    } else {
      setError(result.error || "Login failed");
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    authLogout();
    setIsAuthenticated(false);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
