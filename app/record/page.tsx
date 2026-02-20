'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Video, Mic, MicOff, VideoIcon, VideoOff, Circle, ArrowLeft, Pause, Play, Square, Home, RotateCcw, Copy, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/contexts/AuthContext';
import { saveRecording } from '@/lib/firebase/firestore';
import { uploadToDrive } from '@/lib/utils/drive';
import { signInWithGoogle } from '@/lib/firebase/auth';
import { WebcamOverlay } from '@/components/recording/WebcamOverlay';

type Phase = 'setup' | 'countdown' | 'recording' | 'processing' | 'complete' | 'error';

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

    // Recording refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const screenStreamRef = useRef<MediaStream | null>(null);
    const camStreamRef = useRef<MediaStream | null>(null);
    const [camStream, setCamStream] = useState<MediaStream | null>(null);

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

            // 1. Get Screen Stream
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: includeMic
            });
            screenStreamRef.current = screenStream;

            // 2. Get Camera Stream if needed
            if (includeCam) {
                const camStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false // We use audio from screen/mic capture
                });
                camStreamRef.current = camStream;
                setCamStream(camStream);
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
        if (!screenStreamRef.current) return;

        const streamsToCombine = [screenStreamRef.current];

        // Combine audio tracks if available
        const audioTracks = screenStreamRef.current.getAudioTracks();

        const combinedStream = new MediaStream([
            ...screenStreamRef.current.getVideoTracks(),
            ...audioTracks
        ]);

        const recorder = new MediaRecorder(combinedStream, {
            mimeType: 'video/webm;codecs=vp8,opus'
        });

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunksRef.current.push(e.data);
            }
        };

        recorder.onstop = processRecording;

        mediaRecorderRef.current = recorder;
        recorder.start(1000); // Collect in chunks
        setPhase('recording');
    };

    const handleStop = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }

        // Stop all tracks
        [screenStreamRef.current, camStreamRef.current].forEach(stream => {
            stream?.getTracks().forEach(track => track.stop());
        });

        setPhase('processing');
        setProgress(0);
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
            const fileName = `RecordIt-${new Date().toLocaleString()}.webm`;
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
                        <Link href="/dashboard" className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                                <Video className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg font-bold text-[hsl(var(--foreground))]">Record<span className="text-gradient">It</span></span>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center animate-countdown shadow-2xl shadow-violet-500/40" key={countdown}>
                            <span className="text-6xl font-bold text-white">{countdown || '🎬'}</span>
                        </div>
                    </div>
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

                    {/* Webcam Overlay */}
                    {includeCam && camStream && <WebcamOverlay stream={camStream} />}

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
                    </div>
                </div>
            )}

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
        </div>
    );
}
