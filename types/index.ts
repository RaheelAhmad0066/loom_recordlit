// Type definitions for the application

import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface Recording {
  id: string;
  userId: string;
  title: string;
  videoUrl: string; // Google Drive Web View Link
  storagePath: string; // Google Drive File ID
  duration: number; // in seconds
  thumbnailUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isStarred?: boolean;
  startTime?: number; // in seconds
  endTime?: number; // in seconds
  isMuted?: boolean;
  overlays?: any[];
  folderId?: string | null;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  error: string | null;
}

export interface RecordingOptions {
  includeMicrophone: boolean;
  includeWebcam: boolean;
  displaySurface?: 'screen' | 'window' | 'browser';
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}
