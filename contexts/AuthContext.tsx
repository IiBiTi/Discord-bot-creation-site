import React, { createContext, useContext, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, pass: string) => boolean;
    signup: (name: string, email: string, pass: string) => boolean;
    logout: () => void;
    loginWithProvider: (provider: 'discord' | 'google' | 'github') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This is a mock provider that effectively disables the entire authentication system.
// It always reports that no user is logged in and that loading is complete.
// The functions are stubs and do nothing, ensuring no part of the app can log a user in.
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    
    const value: AuthContextType = { 
        user: null, // Always no user
        loading: false, // Always finished loading
        login: () => false,
        signup: () => false,
        logout: () => {},
        loginWithProvider: () => {}
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};