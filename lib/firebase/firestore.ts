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
    addDoc,
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
    videoUrl: string,
    storagePath: string,
    duration: number,
    thumbnailUrl?: string
): Promise<string> {
    const recordingRef = doc(collection(db, 'recordings'));
    await setDoc(recordingRef, {
        userId,
        title,
        videoUrl, // Replaced driveLink
        storagePath, // Replaced driveFileId
        duration,
        thumbnailUrl: thumbnailUrl || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return recordingRef.id;
}

// Get single recording
export async function getRecording(id: string): Promise<Recording | null> {
    const recordingRef = doc(db, 'recordings', id);
    const recordingDoc = await getDoc(recordingRef);
    if (!recordingDoc.exists()) return null;
    const data = recordingDoc.data();
    return {
        id: recordingDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
    } as Recording;
}

// Get user's recordings
export async function getUserRecordings(userId: string): Promise<Recording[]> {
    try {
        const recordingsRef = collection(db, 'recordings');
        const q = query(
            recordingsRef,
            where('userId', '==', userId)
        );
        const querySnapshot = await getDocs(q);

        const recordings = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            };
        }) as Recording[];

        // Sort in memory by createdAt descending
        return recordings.sort((a, b) => {
            const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
            const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
            return dateB - dateA;
        });
    } catch (error: any) {
        console.error('Error in getUserRecordings:', error);
        // If it's an index error, suggest the link in the console
        if (error.message?.includes('index')) {
            console.warn('Firestore index missing! Please click the link in the Firebase error to create it.');
        }
        return [];
    }
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

// FOLDERS

export interface Folder {
    id: string;
    userId: string;
    name: string;
    createdAt: Date;
}

export async function createFolder(userId: string, name: string): Promise<string> {
    const foldersRef = collection(db, 'folders');
    const docRef = await addDoc(foldersRef, {
        userId,
        name,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function getUserFolders(userId: string): Promise<Folder[]> {
    const foldersRef = collection(db, 'folders');
    const q = query(foldersRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const folders = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        };
    }) as Folder[];

    return folders.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        return dateB - dateA;
    });
}

export async function deleteFolder(folderId: string): Promise<void> {
    const folderRef = doc(db, 'folders', folderId);
    await deleteDoc(folderRef);
}

