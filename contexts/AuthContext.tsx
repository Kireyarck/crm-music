import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';
import * as authService from '../services/authService';

interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password: string) => Promise<User | null>;
  logout: () => void;
  signUp: (username: string, password: string, recoveryPassword: string) => Promise<boolean>;
  recoverPassword: (username: string, recoveryPassword: string, newPassword: string) => Promise<boolean>;
  hasUser: () => boolean;
  loading: boolean;
  updateProfilePicture: (newPicture: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for an existing session on initial load
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const user = await authService.login(username, password);
      if (user) {
        setCurrentUser(user);
      }
      return user;
    } catch (error) {
      console.error("Login failed", error);
      return null;
    } finally {
        setLoading(false);
    }
  };

  const logout = () => {
    authService.signOut();
    setCurrentUser(null);
  };

  const signUp = async (username: string, password: string, recoveryPassword: string) => {
    return authService.signUp(username, password, recoveryPassword);
  };
  
  const recoverPassword = async (username: string, recoveryPassword: string, newPassword: string) => {
     return authService.recoverPassword(username, recoveryPassword, newPassword);
  };
  
  const hasUser = () => {
    return authService.hasUser();
  };

  const updateProfilePicture = async (newPicture: string) => {
    const updatedUser = await authService.updateProfilePicture(newPicture);
    if (updatedUser) {
      setCurrentUser(updatedUser);
    }
  };

  const value = {
    currentUser,
    login,
    logout,
    signUp,
    recoverPassword,
    hasUser,
    loading,
    updateProfilePicture,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};