import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged as firebaseOnAuthStateChanged,
    User as FirebaseUser,
} from 'firebase/auth';
import { auth } from './config';

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<FirebaseUser> {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error: any) {
        console.error('Error signing in with Google:', error);
        throw new Error(error.message || 'Failed to sign in with Google');
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
