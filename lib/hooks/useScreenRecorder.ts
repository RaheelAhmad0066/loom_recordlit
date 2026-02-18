import { useState, useRef, useCallback, useEffect } from 'react';
import { RecordingState, RecordingOptions } from '@/types';

export function useScreenRecorder() {
    const [state, setState] = useState<RecordingState>({
        isRecording: false,
        isPaused: false,
        duration: 0,
        error: null,
    });

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const screenStreamRef = useRef<MediaStream | null>(null);
    const micStreamRef = useRef<MediaStream | null>(null);
    const webcamStreamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(0);
    const pausedDurationRef = useRef<number>(0);
    const lastPauseTimeRef = useRef<number>(0);

    // Update duration timer
    useEffect(() => {
        if (state.isRecording && !state.isPaused) {
            timerRef.current = setInterval(() => {
                const elapsed = (Date.now() - startTimeRef.current - pausedDurationRef.current) / 1000;
                setState((prev) => ({ ...prev, duration: Math.floor(elapsed) }));
            }, 100);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [state.isRecording, state.isPaused]);

    const startRecording = useCallback(async (options: RecordingOptions) => {
        try {
            setState({ isRecording: false, isPaused: false, duration: 0, error: null });
            chunksRef.current = [];

            // Get screen stream
            const displayMediaOptions: DisplayMediaStreamOptions = {
                video: {
                    displaySurface: options.displaySurface || 'screen',
                } as any,
                audio: false,
            };

            const screenStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
            screenStreamRef.current = screenStream;

            const tracks: MediaStreamTrack[] = [...screenStream.getTracks()];

            // Add microphone if requested
            if (options.includeMicrophone) {
                try {
                    const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    micStreamRef.current = micStream;
                    tracks.push(...micStream.getAudioTracks());
                } catch (err) {
                    console.error('Microphone access denied:', err);
                }
            }

            // Get webcam stream if requested (stored separately for overlay)
            if (options.includeWebcam) {
                try {
                    const webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
                    webcamStreamRef.current = webcamStream;
                } catch (err) {
                    console.error('Webcam access denied:', err);
                }
            }

            // Combine all tracks
            const combinedStream = new MediaStream(tracks);

            // Create MediaRecorder
            const mediaRecorder = new MediaRecorder(combinedStream, {
                mimeType: 'video/webm;codecs=vp9',
            });

            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                // Handled in stopRecording
            };

            // Handle user stopping screen share
            screenStream.getVideoTracks()[0].onended = () => {
                if (state.isRecording) {
                    stopRecording();
                }
            };

            mediaRecorder.start(1000); // Collect data every second
            startTimeRef.current = Date.now();
            pausedDurationRef.current = 0;

            setState({ isRecording: true, isPaused: false, duration: 0, error: null });
        } catch (error: any) {
            console.error('Error starting recording:', error);
            setState({ isRecording: false, isPaused: false, duration: 0, error: error.message || 'Failed to start recording' });
        }
    }, [state.isRecording]);

    const pauseRecording = useCallback(() => {
        if (mediaRecorderRef.current && state.isRecording && !state.isPaused) {
            mediaRecorderRef.current.pause();
            lastPauseTimeRef.current = Date.now();
            setState((prev) => ({ ...prev, isPaused: true }));
        }
    }, [state.isRecording, state.isPaused]);

    const resumeRecording = useCallback(() => {
        if (mediaRecorderRef.current && state.isRecording && state.isPaused) {
            mediaRecorderRef.current.resume();
            pausedDurationRef.current += Date.now() - lastPauseTimeRef.current;
            setState((prev) => ({ ...prev, isPaused: false }));
        }
    }, [state.isRecording, state.isPaused]);

    const stopRecording = useCallback((): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            if (!mediaRecorderRef.current) {
                reject(new Error('No recording in progress'));
                return;
            }

            const mediaRecorder = mediaRecorderRef.current;

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' });

                // Stop all tracks
                screenStreamRef.current?.getTracks().forEach((track) => track.stop());
                micStreamRef.current?.getTracks().forEach((track) => track.stop());
                webcamStreamRef.current?.getTracks().forEach((track) => track.stop());

                screenStreamRef.current = null;
                micStreamRef.current = null;
                webcamStreamRef.current = null;
                mediaRecorderRef.current = null;
                chunksRef.current = [];

                setState({ isRecording: false, isPaused: false, duration: 0, error: null });
                resolve(blob);
            };

            mediaRecorder.stop();
        });
    }, []);

    const getWebcamStream = useCallback(() => {
        return webcamStreamRef.current;
    }, []);

    return {
        ...state,
        startRecording,
        pauseRecording,
        resumeRecording,
        stopRecording,
        getWebcamStream,
    };
}
