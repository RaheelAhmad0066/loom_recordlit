import { UploadProgress } from '@/types';

declare const gapi: any;

const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let isGapiInitialized = false;
let isGapiLoaded = false;

// Load gapi script
export function loadGapi(): Promise<void> {
    if (isGapiLoaded) return Promise.resolve();

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => {
            isGapiLoaded = true;
            resolve();
        };
        script.onerror = reject;
        document.body.appendChild(script);
    });
}

// Initialize Drive client
export async function initializeDriveClient(): Promise<void> {
    if (isGapiInitialized) return;

    await loadGapi();

    return new Promise((resolve, reject) => {
        gapi.load('client:auth2', async () => {
            try {
                await gapi.client.init({
                    apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
                    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                    discoveryDocs: DISCOVERY_DOCS,
                    scope: SCOPES,
                });
                isGapiInitialized = true;
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    });
}

// Sign in to Google Drive
export async function signInToDrive(): Promise<void> {
    await initializeDriveClient();

    const authInstance = gapi.auth2.getAuthInstance();
    if (!authInstance.isSignedIn.get()) {
        await authInstance.signIn();
    }
}

// Get or create "Screen Recordings" folder
export async function getOrCreateFolder(): Promise<string> {
    await signInToDrive();

    const folderName = 'Screen Recordings';

    // Search for existing folder
    const response = await gapi.client.drive.files.list({
        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
    });

    if (response.result.files && response.result.files.length > 0) {
        return response.result.files[0].id;
    }

    // Create folder if it doesn't exist
    const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
    };

    const folder = await gapi.client.drive.files.create({
        resource: folderMetadata,
        fields: 'id',
    });

    return folder.result.id;
}

// Upload video to Drive
export async function uploadVideo(
    file: Blob,
    title: string,
    onProgress?: (progress: UploadProgress) => void
): Promise<{ fileId: string; webViewLink: string }> {
    await signInToDrive();

    const folderId = await getOrCreateFolder();

    const metadata = {
        name: `${title}.webm`,
        mimeType: 'video/webm',
        parents: [folderId],
    };

    const formData = new FormData();
    formData.append(
        'metadata',
        new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    formData.append('file', file);

    const accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink');
        xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);

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
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                resolve({
                    fileId: response.id,
                    webViewLink: response.webViewLink,
                });
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
            }
        };

        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.send(formData);
    });
}

// Make file publicly accessible
export async function makePublic(fileId: string): Promise<void> {
    await gapi.client.drive.permissions.create({
        fileId: fileId,
        resource: {
            role: 'reader',
            type: 'anyone',
        },
    });
}

// Get shareable link
export async function getShareableLink(fileId: string): Promise<string> {
    await makePublic(fileId);
    const response = await gapi.client.drive.files.get({
        fileId: fileId,
        fields: 'webViewLink',
    });
    return response.result.webViewLink;
}
