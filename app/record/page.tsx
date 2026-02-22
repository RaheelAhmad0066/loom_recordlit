'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Video, Mic, MicOff, VideoIcon, VideoOff, Circle, ArrowLeft, Edit2, Pause, Play, Square, Home, RotateCcw, Copy, CheckCircle, AlertCircle, ExternalLink, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/contexts/AuthContext';
import { saveRecording } from '@/lib/firebase/firestore';
import { uploadToDrive } from '@/lib/utils/drive';
import { signInWithGoogle } from '@/lib/firebase/auth';
import { WebcamOverlay } from '@/components/recording/WebcamOverlay';
import { Modal } from '@/components/ui/Modal';

type Phase = 'setup' | 'countdown' | 'recording' | 'preview' | 'processing' | 'complete' | 'error';

export default function RecordPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [phase, setPhase] = useState<Phase>('setup');
    const [includeMic, setIncludeMic] = useState(true);
    const [includeCam, setIncludeCam] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const [duration, setDuration] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(0);
    const [processingStatus, setProcessingStatus] = useState('');
    const [copied, setCopied] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);

    // Recording refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const screenStreamRef = useRef<MediaStream | null>(null);
    const camStreamRef = useRef<MediaStream | null>(null);
    const micStreamRef = useRef<MediaStream | null>(null);
    const [camStream, setCamStream] = useState<MediaStream | null>(null);

    // Canvas Compositing Refs
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const screenVideoRef = useRef<HTMLVideoElement | null>(null);
    const camVideoRef = useRef<HTMLVideoElement | null>(null);
    const renderIntervalRef = useRef<any>(null);

    // Countdown timer
    useEffect(() => {
        if (phase !== 'countdown') return;
        if (countdown <= 0) {
            startActualRecording();
            return;
        }
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [phase, countdown]);

    // Recording timer
    useEffect(() => {
        if (phase !== 'recording' || isPaused) return;
        const t = setInterval(() => setDuration(d => d + 1), 1000);
        return () => clearInterval(t);
    }, [phase, isPaused]);

    const handleStartSetup = async () => {
        try {
            setErrorMsg(null);

            // 1. Get Screen Stream (System Audio if possible)
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    frameRate: { ideal: 30 }
                },
                audio: true
            });
            screenStreamRef.current = screenStream;
            if (screenVideoRef.current) {
                screenVideoRef.current.srcObject = screenStream;
                screenVideoRef.current.play();
            }

            // 2. Get Camera Stream if needed
            if (includeCam) {
                const camStream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 640 },
                        height: { ideal: 480 }
                    },
                    audio: false
                });
                camStreamRef.current = camStream;
                setCamStream(camStream);
                if (camVideoRef.current) {
                    camVideoRef.current.srcObject = camStream;
                    camVideoRef.current.play();
                }
            }

            // 3. Get Microphone Stream if needed
            if (includeMic) {
                const micStream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    }
                });
                micStreamRef.current = micStream;
            }

            // If user stops sharing from browser UI
            screenStream.getVideoTracks()[0].onended = () => {
                handleStop();
            };

            setPhase('countdown');
            setCountdown(3);
            setDuration(0);
        } catch (err: any) {
            console.error('Permission error:', err);
            setErrorMsg(err.message || 'Permissions denied or cancelled');
            setPhase('setup');
        }
    };

    const startActualRecording = () => {
        if (!screenStreamRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        // Set canvas size to match screen video (or default to 1080p)
        const videoTrack = screenStreamRef.current.getVideoTracks()[0];
        const settings = videoTrack.getSettings();
        canvas.width = settings.width || 1920;
        canvas.height = settings.height || 1080;

        // Drawing Loop
        const draw = () => {
            try {
                // If we're not recording or counting down, stop the drawing
                // (Though clearInterval should handle this, it's a safe guard)

                // 1. Draw Screen
                if (screenVideoRef.current) {
                    ctx.drawImage(screenVideoRef.current, 0, 0, canvas.width, canvas.height);
                }

                // 2. Draw Camera Overlay (Circle)
                if (includeCam && camVideoRef.current) {
                    const size = Math.min(canvas.width, canvas.height) * 0.2;
                    const margin = 40;
                    const x = margin;
                    const y = canvas.height - size - margin;

                    ctx.save();
                    // Move to where we want the bubble and Mirror the camera
                    ctx.translate(x + size, 0);
                    ctx.scale(-1, 1);

                    ctx.beginPath();
                    ctx.arc(size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
                    ctx.clip();

                    // Draw at 0 because of translate
                    ctx.drawImage(camVideoRef.current, 0, y, size, size);
                    ctx.restore();

                    // Add border (non-mirrored)
                    ctx.beginPath();
                    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
                    ctx.strokeStyle = '#a78bfa'; // violet-400
                    ctx.lineWidth = 8;
                    ctx.stroke();
                }
            } catch (err) {
                console.error("Draw loop error:", err);
            }
        };

        // Use high frequency interval instead of requestAnimationFrame for better background persistence
        renderIntervalRef.current = setInterval(draw, 1000 / 30); // 30 FPS

        // Capture Stream from Canvas
        const canvasStream = canvas.captureStream(30);

        // Mix Audio Tracks
        const audioContext = new AudioContext();
        const destination = audioContext.createMediaStreamDestination();

        // Screen Audio (System)
        if (screenStreamRef.current.getAudioTracks().length > 0) {
            const screenSource = audioContext.createMediaStreamSource(new MediaStream([screenStreamRef.current.getAudioTracks()[0]]));
            screenSource.connect(destination);
        }

        // Microphone Audio
        if (includeMic && micStreamRef.current) {
            const micSource = audioContext.createMediaStreamSource(micStreamRef.current);
            micSource.connect(destination);
        }

        // Final Combined Stream
        const combinedStream = new MediaStream([
            ...canvasStream.getVideoTracks(),
            ...destination.stream.getAudioTracks()
        ]);

        const recorder = new MediaRecorder(combinedStream, {
            mimeType: 'video/webm;codecs=vp8,opus'
        });

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunksRef.current.push(e.data);
            }
        };

        recorder.onstop = () => {
            // Decoupled: Don't auto-process, wait for user to click "Upload" in preview screen
            audioContext.close();
        };

        mediaRecorderRef.current = recorder;
        recorder.start(1000);
        setPhase('recording');
    };

    const handleStop = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }

        [screenStreamRef.current, camStreamRef.current, micStreamRef.current].forEach(stream => {
            stream?.getTracks().forEach(track => track.stop());
        });

        if (renderIntervalRef.current) {
            clearInterval(renderIntervalRef.current);
        }

        const defaultTitle = `Recordly-${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        setTitle(defaultTitle);
        setPhase('preview');
        setProgress(0);
    };

    const handleDeleteRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }

        [screenStreamRef.current, camStreamRef.current, micStreamRef.current].forEach(stream => {
            stream?.getTracks().forEach(track => track.stop());
        });

        if (renderIntervalRef.current) {
            clearInterval(renderIntervalRef.current);
        }

        chunksRef.current = [];
        setIsDeleteModalOpen(false);
        router.push('/dashboard');
    };

    const handleDiscardRecording = () => {
        chunksRef.current = [];
        setIsDiscardModalOpen(false);
        router.push('/dashboard');
    };

    const processRecording = async () => {
        try {
            setErrorMsg(null);
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            setProcessingStatus('Preparing upload...');
            setProgress(5);

            const token = localStorage.getItem('google_access_token');
            if (!token) throw new Error('UNAUTHORIZED: Google access token missing. Please log in again.');

            // Upload to Google Drive with progress updates
            const fileName = title.endsWith('.webm') ? title : `${title}.webm`;
            setProcessingStatus('Uploading to Google Drive...');

            const driveData = await uploadToDrive(blob, fileName, token, duration, (p) => {
                // Map upload progress to 5-90% range to leave room for final save
                const mappedProgress = 5 + (p.percentage * 0.95);
                setProgress(mappedProgress);
            });

            setProcessingStatus('Complete!');
            setProgress(100);
            setShareLink(driveData.link);

            // Save metadata to Firestore (Non-blocking)
            if (user) {
                saveRecording(
                    user.uid,
                    fileName,
                    driveData.link,
                    driveData.id,
                    duration
                ).catch(err => console.error('Firestore save error:', err));
            }

            setPhase('complete');
        } catch (err: any) {
            console.error('Processing error:', err);

            // Auto-redirect if Google Drive API is disabled
            const driveApiLinkMatch = err.message?.match(/https:\/\/console\.developers\.google\.com\/apis\/api\/drive\.googleapis\.com\/overview\?project=\d+/);
            if (driveApiLinkMatch) {
                setProcessingStatus('Redirecting to Google Cloud Console to enable Drive API...');
                setTimeout(() => {
                    window.location.href = driveApiLinkMatch[0];
                }, 2000);
                return;
            }

            setErrorMsg(err.message || 'Failed to save recording');
            setPhase('error');
        } finally {
            // Only clear chunks if it's not a temporary auth error
            // If it's an auth error, we keep the chunks so user can retry after login
            const isAuthError = errorMsg?.includes('UNAUTHORIZED');
            if (!isAuthError) {
                chunksRef.current = [];
            }
        }
    };

    const handleRetryUpload = async () => {
        const isAuthError = errorMsg?.includes('UNAUTHORIZED');

        if (isAuthError) {
            try {
                setProcessingStatus('Re-authenticating...');
                await signInWithGoogle();
                // If sign in successful, try processing again
                setPhase('processing');
                processRecording();
            } catch (err: any) {
                setErrorMsg('Re-authentication failed: ' + err.message);
            }
        } else {
            setPhase('setup');
            setDuration(0);
            setProgress(0);
            setErrorMsg(null);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col">
            {/* Top bar (visible in setup) */}
            {phase === 'setup' && (
                <div className="border-b border-[hsl(var(--border))] glass">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
                        <Link href="/dashboard" className="flex items-center gap-3">
                            <img src="/logo.png" alt="Recordly Logo" className="w-12 h-12 object-contain transition-transform hover:scale-110" />
                            <span className="text-2xl font-black text-[hsl(var(--foreground))] tracking-tight">Recordly</span>
                        </Link>
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            )}

            {/* ──── Setup Phase ──── */}
            {phase === 'setup' && (
                <div className="flex-1 flex items-center justify-center px-4">
                    <div className="max-w-lg w-full animate-fade-in-up">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--foreground))] mb-2">
                                Ready to <span className="text-gradient">Record</span>
                            </h2>
                            <p className="text-[hsl(var(--muted-foreground))]">Configure your settings and start recording</p>
                        </div>

                        <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-6 mb-6">
                            <h3 className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-4">Options</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setIncludeMic(!includeMic)}
                                    className={cn(
                                        'flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all duration-200 hover-lift',
                                        includeMic
                                            ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.06)] shadow-md shadow-[hsl(var(--primary)/0.08)]'
                                            : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)]'
                                    )}
                                >
                                    {includeMic ? <Mic className="w-7 h-7 text-[hsl(var(--primary))] mb-2" /> : <MicOff className="w-7 h-7 text-[hsl(var(--muted-foreground))] mb-2" />}
                                    <span className="text-sm font-medium">{includeMic ? 'Mic On' : 'Mic Off'}</span>
                                </button>
                                <button
                                    onClick={() => setIncludeCam(!includeCam)}
                                    className={cn(
                                        'flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all duration-200 hover-lift',
                                        includeCam
                                            ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.06)] shadow-md shadow-[hsl(var(--primary)/0.08)]'
                                            : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)]'
                                    )}
                                >
                                    {includeCam ? <VideoIcon className="w-7 h-7 text-[hsl(var(--primary))] mb-2" /> : <VideoOff className="w-7 h-7 text-[hsl(var(--muted-foreground))] mb-2" />}
                                    <span className="text-sm font-medium">{includeCam ? 'Cam On' : 'Cam Off'}</span>
                                </button>
                            </div>
                        </div>

                        <Button
                            onClick={handleStartSetup}
                            size="lg"
                            className="w-full rounded-xl h-13 text-lg shadow-lg shadow-[hsl(var(--primary)/0.3)] hover:shadow-xl transition-all group"
                        >
                            <Circle className="w-5 h-5 mr-2 fill-current group-hover:animate-pulse" />
                            Start Recording
                        </Button>

                        <p className="text-xs text-center text-[hsl(var(--muted-foreground))] mt-4">
                            You&apos;ll choose which screen to share after clicking Start
                        </p>

                        {errorMsg && (
                            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {errorMsg}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ──── Countdown Phase ──── */}
            {phase === 'countdown' && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
                    <div className="relative mb-8">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center animate-countdown shadow-2xl shadow-violet-500/40" key={countdown}>
                            <span className="text-6xl font-bold text-white">{countdown || '🎬'}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => startActualRecording()}
                        className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group"
                    >
                        <span className="text-sm font-bold uppercase tracking-[0.2em]">Skip Countdown</span>
                        <Play className="w-4 h-4 fill-current group-hover:translate-x-1 transition-transform" />
                    </button>

                    {includeCam && camStream && <WebcamOverlay stream={camStream} />}
                </div>
            )}

            {/* ──── Recording Phase ──── */}
            {phase === 'recording' && (
                <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
                    {/* Visual indicator (Loom typically doesn't show a preview of screen, just the webcam) */}
                    <div className="text-center mb-12 animate-fade-in">
                        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 border-2 border-red-500/20 relative">
                            <div className="w-4 h-4 rounded-full bg-red-500 animate-ping absolute" />
                            <div className="w-4 h-4 rounded-full bg-red-500 relative" />
                        </div>
                        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">Recording in Progress</h2>
                        <p className="text-[hsl(var(--muted-foreground))]">Your screen is being captured</p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-4 bg-[hsl(var(--card))] rounded-full px-6 py-3 border border-[hsl(var(--border))] shadow-xl animate-slide-in-left">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                {!isPaused && <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />}
                            </div>
                            <span className="font-mono font-semibold tabular-nums text-lg">{formatTime(duration)}</span>
                        </div>
                        <div className="h-6 w-px bg-[hsl(var(--border))]" />
                        <button
                            onClick={() => {
                                if (isPaused) mediaRecorderRef.current?.resume();
                                else mediaRecorderRef.current?.pause();
                                setIsPaused(!isPaused);
                            }}
                            className="p-2.5 hover:bg-[hsl(var(--accent))] rounded-full transition-colors"
                            title={isPaused ? 'Resume' : 'Pause'}
                        >
                            {isPaused ? <Play className="w-5 h-5 text-[hsl(var(--primary))] fill-current" /> : <Pause className="w-5 h-5 fill-current" />}
                        </button>
                        <button
                            onClick={handleStop}
                            className="p-2.5 hover:bg-red-500/10 rounded-full transition-colors text-red-500"
                            title="Stop"
                        >
                            <Square className="w-5 h-5 fill-current" />
                        </button>
                        <div className="h-6 w-px bg-[hsl(var(--border))]" />
                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="p-2.5 hover:bg-red-500/10 rounded-full transition-colors text-red-500"
                            title="Delete"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* ──── Preview / Naming Phase ──── */}
            {phase === 'preview' && (
                <div className="flex-1 flex items-center justify-center px-4">
                    <div className="max-w-md w-full animate-fade-in-up">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/20 border border-white/10 overflow-hidden">
                                <img src="/logo.png" alt="Recordly" className="w-full h-full object-contain p-3.5 brightness-0 invert" />
                            </div>
                            <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2">Name your video</h2>
                            <p className="text-[hsl(var(--muted-foreground))]">Give it a title before saving</p>
                        </div>

                        <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-6 mb-6">
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="video-title" className="block text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1.5 uppercase tracking-wider">
                                        Title
                                    </label>
                                    <input
                                        id="video-title"
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all text-lg font-medium"
                                        placeholder="Enter video name..."
                                        autoFocus
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={() => {
                                    setPhase('processing');
                                    processRecording();
                                }}
                                size="lg"
                                className="w-full rounded-xl h-13 text-lg shadow-lg shadow-violet-500/20"
                            >
                                Upload & Save Video
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setIsDiscardModalOpen(true)}
                                className="text-[hsl(var(--muted-foreground))] hover:text-red-500"
                            >
                                Discard Recording
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteRecording}
                title="Delete Recording?"
                description="Are you sure you want to delete this recording? This action cannot be undone."
                confirmLabel="Delete"
                type="destructive"
            />

            <Modal
                isOpen={isDiscardModalOpen}
                onClose={() => setIsDiscardModalOpen(false)}
                onConfirm={handleDiscardRecording}
                title="Discard Recording?"
                description="This recording will be permanently discarded. Are you sure?"
                confirmLabel="Discard"
                type="destructive"
            />

            {/* ──── Processing Phase ──── */}
            {phase === 'processing' && (
                <div className="flex-1 flex items-center justify-center px-4">
                    <div className="text-center max-w-md animate-fade-in-up">
                        <div className="w-16 h-16 border-4 border-[hsl(var(--muted))] border-t-[hsl(var(--primary))] rounded-full animate-spin mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">Processing Recording</h2>
                        <p className="text-[hsl(var(--muted-foreground))] mb-8">{processingStatus || 'Saving to your Google Drive...'}</p>
                        <div className="w-full bg-[hsl(var(--muted))] rounded-full h-2.5 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-3 font-medium">{Math.round(progress)}% complete</p>
                    </div>
                </div>
            )}

            {/* ──── Error Phase ──── */}
            {phase === 'error' && (
                <div className="flex-1 flex items-center justify-center px-4">
                    <div className="text-center max-w-md animate-fade-in-up">
                        <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">Something went wrong</h2>
                        <p className="text-[hsl(var(--muted-foreground))] mb-8">{errorMsg}</p>
                        <div className="flex flex-col gap-3">
                            {errorMsg?.includes('UNAUTHORIZED') && (
                                <Button
                                    variant="default"
                                    onClick={handleRetryUpload}
                                    className="shadow-lg shadow-[hsl(var(--primary)/0.2)] bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    Login Again & Resume
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                onClick={() => { setPhase('setup'); setDuration(0); setProgress(0); setErrorMsg(null); chunksRef.current = []; }}
                                className="border-[hsl(var(--border))]"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                {errorMsg?.includes('UNAUTHORIZED') ? 'Discard & Start Over' : 'Try Again'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ──── Complete Phase ──── */}
            {phase === 'complete' && (
                <div className="flex-1 flex items-center justify-center px-4">
                    <div className="text-center max-w-md animate-fade-in-up">
                        <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2">Recording Complete!</h2>
                        <p className="text-[hsl(var(--muted-foreground))] mb-8">Your recording has been uploaded to Google Drive</p>

                        <div className="bg-[hsl(var(--muted))] rounded-xl p-4 mb-8 text-left border border-[hsl(var(--border))]">
                            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2 font-semibold uppercase tracking-wider">Shareable Link</p>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-[hsl(var(--primary))] break-all flex-1 font-medium">
                                    {shareLink}
                                </span>
                                <button
                                    onClick={handleCopy}
                                    className="p-2 hover:bg-[hsl(var(--accent))] rounded-lg transition-colors flex-shrink-0"
                                >
                                    {copied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />}
                                </button>
                                <a href={shareLink} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-[hsl(var(--accent))] rounded-lg transition-colors flex-shrink-0">
                                    <ExternalLink className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                                </a>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link href="/dashboard">
                                <Button variant="default" className="w-full sm:w-auto shadow-lg shadow-[hsl(var(--primary)/0.2)]">
                                    <Home className="w-4 h-4 mr-2" />
                                    Dashboard
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                onClick={() => { setPhase('setup'); setDuration(0); setProgress(0); }}
                                className="w-full sm:w-auto"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Record Another
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Elements for Compositing */}
            <div className="hidden">
                <video ref={screenVideoRef} autoPlay muted playsInline />
                <video ref={camVideoRef} autoPlay muted playsInline />
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
}
