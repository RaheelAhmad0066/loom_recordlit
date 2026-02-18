'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged } from '@/lib/firebase/auth';
import { saveUserProfile } from '@/lib/firebase/firestore';
import { auth } from '@/lib/firebase/config';
import { User } from '@/types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
});

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // If Firebase is not configured (auth is null), just set loading to false
        if (!auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
            try {
                if (firebaseUser) {
                    const userData: User = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        photoURL: firebaseUser.photoURL,
                    };
                    setUser(userData);

                    // Save user profile to Firestore (don't block the UI loading)
                    saveUserProfile(
                        firebaseUser.uid,
                        firebaseUser.email,
                        firebaseUser.displayName,
                        firebaseUser.photoURL
                    ).catch(err => console.error('Error saving user profile:', err));
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Auth state change error:', error);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
