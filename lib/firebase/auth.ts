import {
    GoogleAuthProvider,
    OAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged as firebaseOnAuthStateChanged,
    User as FirebaseUser,
} from 'firebase/auth';
import { auth } from './config';

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');

export async function signInWithGoogle(): Promise<{ user: FirebaseUser; accessToken: string | undefined }> {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const accessToken = credential?.accessToken;

        // Persist token for the session (Drive API needs it)
        if (accessToken) {
            localStorage.setItem('google_access_token', accessToken);
        }

        return { user: result.user, accessToken };
    } catch (error: any) {
        console.error('Error signing in with Google:', error);
        throw new Error(error.message || 'Failed to sign in with Google');
    }
}

export async function signInWithApple(): Promise<{ user: FirebaseUser }> {
    const appleProvider = new OAuthProvider('apple.com');
    // Apple often requires these scopes for display name and email
    appleProvider.addScope('email');
    appleProvider.addScope('name');

    try {
        const result = await signInWithPopup(auth, appleProvider);
        return { user: result.user };
    } catch (error: any) {
        console.error('Error signing in with Apple:', error);
        throw new Error(error.message || 'Failed to sign in with Apple');
    }
}

export async function signOut(): Promise<void> {
    try {
        await firebaseSignOut(auth);
    } catch (error: any) {
        console.error('Error signing out:', error);
        throw new Error(error.message || 'Failed to sign out');
    }
}

export function onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return firebaseOnAuthStateChanged(auth, callback);
}

export function getStoredAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('google_access_token');
}
