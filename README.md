# Screen Recorder - Loom-Style Screen Recording App

A production-ready screen recording web application built with Next.js, Firebase, and Google Drive API. Record your screen, automatically upload to Google Drive, and share instantly.

## Features

- 🎥 **Screen Recording**: Record entire screen, application windows, or browser tabs
- 🎤 **Microphone Support**: Toggle microphone audio on/off
- 📹 **Webcam Overlay**: Optional draggable webcam bubble
- ⏯️ **Playback Controls**: Pause, resume, and stop recording
- ⏱️ **Live Timer**: Real-time recording duration display
- ☁️ **Auto Upload**: Automatic upload to Google Drive
- 🔗 **Instant Sharing**: Get shareable public links immediately
- 📊 **Dashboard**: Manage all your recordings
- 🎨 **Dark/Light Mode**: Theme toggle with system preference detection
- 📱 **Fully Responsive**: Works on desktop, tablet, and mobile

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Authentication (Google Sign-in)
- **Database**: Cloud Firestore
- **Storage**: Google Drive API
- **Hosting**: Firebase Hosting
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ and npm
- Firebase account
- Google Cloud account
- Modern web browser (Chrome/Edge recommended)

## Setup Instructions

### 1. Clone and Install

```bash
cd screen-recorder
npm install
```

### 2. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Google Authentication
3. Create a Firestore database
4. Get your Firebase configuration

### 3. Google Cloud Setup

1. Enable Google Drive API in [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Configure OAuth consent screen
4. Add authorized domains

### 4. Environment Variables

Create `.env.local` file (copy from `.env.local.example`):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Build and Deploy to Firebase Hosting

```bash
# Build for production
npm run build

# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (first time only)
firebase init hosting

# Deploy
firebase deploy --only hosting
```

## Project Structure

```
screen-recorder/
├── app/
│   ├── (pages)/
│   │   ├── page.tsx          # Landing page
│   │   ├── login/
│   │   ├── dashboard/
│   │   └── record/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                    # Reusable UI components
│   ├── auth/                  # Authentication components
│   ├── dashboard/             # Dashboard components
│   ├── recording/             # Recording interface components
│   └── landing/               # Landing page components
├── lib/
│   ├── firebase/              # Firebase configuration
│   ├── drive/                 # Google Drive API client
│   ├── hooks/                 # Custom React hooks
│   └── utils/                 # Utility functions
├── contexts/                  # React contexts
├── types/                     # TypeScript types
└── public/
```

## Usage

1. **Sign In**: Click "Get Started" and sign in with Google
2. **Create Recording**: Click "New Recording" from dashboard
3. **Configure**: Toggle microphone and webcam options
4. **Record**: Click "Start Recording", select screen/window
5. **Control**: Use floating controls to pause/resume/stop
6. **Share**: After upload, copy the shareable link

## Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome  | ✅ Full |
| Edge    | ✅ Full |
| Firefox | ✅ Full |
| Safari  | ⚠️ Limited |

## Documentation

For detailed setup instructions, see [SETUP_GUIDE.md](../SETUP_GUIDE.md)

## Security

- User recordings are stored in their own Google Drive
- Firestore security rules restrict access to user's own data
- All authentication handled by Firebase
- No server-side storage of video files

## License

MIT License - feel free to use for personal or commercial projects

## Support

For issues or questions, please open an issue on GitHub.
