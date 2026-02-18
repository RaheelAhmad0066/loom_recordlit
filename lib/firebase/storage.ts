import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

/**
 * Uploads a video blob to Firebase Storage
 * @param blob The video blob to upload
 * @param userId The ID of the user who made the recording
 * @returns Promise with download URL and path
 */
export async function uploadRecording(blob: Blob, userId: string): Promise<{ url: string; path: string }> {
    const timestamp = Date.now();
    const fileName = `recordings/${userId}/${timestamp}.webm`;
    const storageRef = ref(storage, fileName);

    // Upload the blob
    const snapshot = await uploadBytes(storageRef, blob, {
        contentType: 'video/webm',
    });

    // Get the download URL
    const url = await getDownloadURL(snapshot.ref);

    return {
        url,
        path: fileName,
    };
}
