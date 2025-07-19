import React, { createContext, useContext, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    loginWithProvider: (provider: 'google' | 'github' | 'discord') => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This is a mock provider that effectively disables the entire authentication system.
// It always reports that no user is logged in and that loading is complete.
// The functions are stubs and do nothing.
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    
    const value: AuthContextType = { 
        user: null, // Always no user
        loading: false, // Always finished loading
        loginWithProvider: () => {}, // Does nothing
        logout: async () => {} // Does nothing
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