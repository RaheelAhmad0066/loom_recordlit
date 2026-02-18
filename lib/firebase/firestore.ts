import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    updateDoc,
    deleteDoc,
    Timestamp,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { Recording } from '@/types';

// Save user profile
export async function saveUserProfile(
    userId: string,
    email: string | null,
    displayName: string | null,
    photoURL: string | null
): Promise<void> {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
        await setDoc(userRef, {
            email,
            displayName,
            photoURL,
            createdAt: serverTimestamp(),
        });
    }
}

// Save recording metadata
export async function saveRecording(
    userId: string,
    title: string,
    driveLink: string,
    driveFileId: string,
    duration: number,
    thumbnailUrl?: string
): Promise<string> {
    const recordingRef = doc(collection(db, 'recordings'));
    await setDoc(recordingRef, {
        userId,
        title,
        driveLink,
        driveFileId,
        duration,
        thumbnailUrl: thumbnailUrl || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return recordingRef.id;
}

// Get user's recordings
export async function getUserRecordings(userId: string): Promise<Recording[]> {
    const recordingsRef = collection(db, 'recordings');
    const q = query(
        recordingsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Recording[];
}

// Update recording
export async function updateRecording(
    recordingId: string,
    updates: Partial<Omit<Recording, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
    const recordingRef = doc(db, 'recordings', recordingId);
    await updateDoc(recordingRef, {
        ...updates,
        updatedAt: serverTimestamp(),
    });
}

// Delete recording
export async function deleteRecording(recordingId: string): Promise<void> {
    const recordingRef = doc(db, 'recordings', recordingId);
    await deleteDoc(recordingRef);
}
