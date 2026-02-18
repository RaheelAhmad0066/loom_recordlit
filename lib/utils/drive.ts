import { UploadProgress } from '@/types';

/**
 * Uploads a video blob to Google Drive
 * @param blob The video blob to upload
 * @param fileName The name for the file in Drive
 * @param token The OAuth2 access token
 * @param duration Duration of the recording in seconds
 * @param onProgress Callback for upload progress
 * @returns Promise with the file metadata including webViewLink
 */
export async function uploadToDrive(
    blob: Blob,
    fileName: string,
    token: string,
    duration: number,
    onProgress?: (progress: UploadProgress) => void
): Promise<{ id: string; link: string; name: string }> {
    if (!token) {
        throw new Error('No Google access token found. Please sign in again.');
    }

    // 1. Create the file metadata with appProperties for custom data
    const metadata = {
        name: fileName,
        mimeType: 'video/webm',
        appProperties: {
            duration: duration.toString(),
            type: 'recording'
        }
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        // We use uploadType=multipart to include metadata and file in one request
        xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,appProperties,createdTime');
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable && onProgress) {
                onProgress({
                    loaded: e.loaded,
                    total: e.total,
                    percentage: Math.round((e.loaded / e.total) * 100),
                });
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                const response = JSON.parse(xhr.responseText);

                // 2. Make the file public so it can be viewed in an iframe and shared
                makeFilePublic(response.id, token).catch(err =>
                    console.error('Failed to make file public:', err)
                );

                resolve({
                    id: response.id,
                    link: response.webViewLink,
                    name: response.name,
                });
            } else {
                try {
                    const error = JSON.parse(xhr.responseText);
                    console.error('Drive upload error:', error);
                    reject(new Error(error.error?.message || `Upload failed with status ${xhr.status}`));
                } catch {
                    reject(new Error(`Upload failed with status ${xhr.status}`));
                }
            }
        };

        xhr.onerror = () => {
            console.error('XHR network error during Drive upload');
            reject(new Error('Network error during upload to Google Drive'));
        };

        xhr.send(form);
    });
}

/**
 * Makes a Google Drive file public (anyone with link can view)
 * @param fileId The ID of the file to make public
 * @param token The OAuth2 access token
 */
export async function makeFilePublic(fileId: string, token: string): Promise<void> {
    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                role: 'reader',
                type: 'anyone',
            }),
        }
    );

    if (!response.ok) {
        const error = await response.json();
        console.error('Error making file public:', error);
        // We don't throw here to avoid failing the whole process if only permissions fail
    }
}

/**
 * Lists recordings from Google Drive
 * @param token The OAuth2 access token
 * @returns Promise with list of recordings
 */
export async function listDriveRecordings(token: string): Promise<any[]> {
    if (!token) throw new Error('Auth token missing');

    const response = await fetch(
        'https://www.googleapis.com/drive/v3/files?q=appProperties has { key="type" and value="recording" } and trashed=false&fields=files(id,name,webViewLink,thumbnailLink,appProperties,createdTime)&orderBy=createdTime desc',
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error('Failed to fetch recordings from Drive');
    }

    const data = await response.json();
    return (data.files || []).map((file: any) => ({
        id: file.id,
        title: file.name,
        videoUrl: file.webViewLink,
        thumbnailUrl: file.thumbnailLink,
        duration: parseInt(file.appProperties?.duration || '0'),
        createdAt: new Date(file.createdTime),
    }));
}
