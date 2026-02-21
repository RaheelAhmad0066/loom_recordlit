import { UploadProgress } from '@/types';

declare const gapi: any;
declare const google: any;

const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let isGapiInitialized = false;
let isGapiLoaded = false;
let isGisLoaded = false;
let accessToken: string | null = null;
let tokenClient: any = null;

// Load gapi and gis scripts
export function loadScripts(): Promise<void> {
    if (isGapiLoaded && isGisLoaded) return Promise.resolve();

    const loadGapi = new Promise<void>((resolve, reject) => {
        if (isGapiLoaded) return resolve();
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => {
            isGapiLoaded = true;
            resolve();
        };
        script.onerror = reject;
        document.body.appendChild(script);
    });

    const loadGis = new Promise<void>((resolve, reject) => {
        if (isGisLoaded) return resolve();
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = () => {
            isGisLoaded = true;
            resolve();
        };
        script.onerror = reject;
        document.body.appendChild(script);
    });

    return Promise.all([loadGapi, loadGis]).then(() => { });
}

// Initialize Drive client
export async function initializeDriveClient(): Promise<void> {
    if (isGapiInitialized) return;

    // Check for placeholders
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

    if (!clientId || clientId.includes('your_google_oauth_client_id') || !apiKey || apiKey.includes('your_google_api_key')) {
        throw new Error('Google Cloud Project not configured. Please follow the setup instructions in the walkthrough to update your .env.local file with real credentials.');
    }

    await loadScripts();

    return new Promise((resolve, reject) => {
        // Load only the GAPI client (NOT auth2)
        gapi.load('client', async () => {
            try {
                console.log('Initializing GAPI client...');
                await gapi.client.init({
                    apiKey: apiKey,
                    discoveryDocs: DISCOVERY_DOCS,
                });

                console.log('Initializing GIS token client...');
                tokenClient = google.accounts.oauth2.initTokenClient({
                    client_id: clientId,
                    scope: SCOPES,
                    callback: (response: any) => {
                        if (response.error !== undefined) {
                            console.error('GIS Error:', response);
                            return;
                        }
                        console.log('Token received successfully');
                        accessToken = response.access_token;
                        // Synchronize token with GAPI client
                        gapi.client.setToken({ access_token: response.access_token });
                        // Use a custom event or promise to notify that token is ready
                        window.dispatchEvent(new CustomEvent('gdrive-token-received', { detail: response.access_token }));
                    },
                });

                console.log('Clients initialized successfully');
                isGapiInitialized = true;
                resolve();
            } catch (error) {
                console.error('Initialization error:', error);
                reject(error);
            }
        });
    });
}

// Sign in to Google Drive
export async function signInToDrive(): Promise<string> {
    await initializeDriveClient();

    if (accessToken) return accessToken;

    return new Promise((resolve, reject) => {
        const handleToken = (event: any) => {
            window.removeEventListener('gdrive-token-received', handleToken);
            resolve(event.detail);
        };
        window.addEventListener('gdrive-token-received', handleToken);

        console.log('Requesting new token via GIS...');
        // Request token (shows the popup if needed)
        tokenClient.requestAccessToken({ prompt: 'consent' });

        // Timeout if no response
        setTimeout(() => {
            window.removeEventListener('gdrive-token-received', handleToken);
            if (!accessToken) reject(new Error('Token request timed out'));
        }, 60000);
    });
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

    const token = await signInToDrive();

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink');
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);

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

        xhr.onerror = (err) => {
            console.error('XHR Upload Error:', err);
            reject(new Error('Upload failed (XHR error)'));
        };

        console.log('Sending XHR request to Drive API...');
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
