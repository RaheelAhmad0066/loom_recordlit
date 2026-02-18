'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Video, Mic, MicOff, VideoIcon, VideoOff, Circle, ArrowLeft, Pause, Play, Square, Home, RotateCcw, Copy, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

type Phase = 'setup' | 'countdown' | 'recording' | 'processing' | 'complete' | 'error';

export default function RecordPage() {
    const [phase, setPhase] = useState<Phase>('setup');
    const [includeMic, setIncludeMic] = useState(true);
    const [includeCam, setIncludeCam] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const [duration, setDuration] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(0);
    const [copied, setCopied] = useState(false);

    // Countdown timer
    useEffect(() => {
        if (phase !== 'countdown') return;
        if (countdown <= 0) {
            setPhase('recording');
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

    // Processing simulation
    useEffect(() => {
        if (phase !== 'processing') return;
        if (progress >= 100) {
            setPhase('complete');
            return;
        }
        const t = setTimeout(() => setProgress(p => Math.min(p + Math.random() * 15 + 5, 100)), 300);
        return () => clearTimeout(t);
    }, [phase, progress]);

    const handleStart = () => {
        setPhase('countdown');
        setCountdown(3);
        setDuration(0);
    };

    const handleStop = () => {
        setPhase('processing');
        setProgress(0);
    };

    const handleCopy = () => {
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
                            onClick={handleStart}
                            size="lg"
                            className="w-full rounded-xl h-13 text-lg shadow-lg shadow-[hsl(var(--primary)/0.3)] hover:shadow-xl transition-all group"
                        >
                            <Circle className="w-5 h-5 mr-2 fill-current group-hover:animate-pulse" />
                            Start Recording
                        </Button>

                        <p className="text-xs text-center text-[hsl(var(--muted-foreground))] mt-4">
                            You&apos;ll choose which screen to share after clicking Start
                        </p>
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
                </div>
            )}

            {/* ──── Recording Phase ──── */}
            {phase === 'recording' && (
                <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
                    {/* Simulated screen capture area */}
                    <div className="w-full max-w-4xl aspect-video bg-[hsl(var(--muted)/0.5)] rounded-2xl border border-[hsl(var(--border))] flex items-center justify-center mb-8 relative overflow-hidden">
                        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.5 }} />
                        <p className="text-[hsl(var(--muted-foreground))] text-lg font-medium z-10">Screen capture area</p>

                        {/* Recording indicator */}
                        <div className="absolute top-4 left-4 flex items-center gap-2 bg-[hsl(var(--card)/0.9)] backdrop-blur px-3 py-2 rounded-full border border-[hsl(var(--border))] z-10">
                            <div className="relative">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                {!isPaused && <div className="absolute inset-0 w-3 h-3 rounded-full bg-red-500 animate-ping" />}
                            </div>
                            <span className="font-mono font-semibold text-sm tabular-nums">{formatTime(duration)}</span>
                        </div>

                        {/* Webcam bubble */}
                        {includeCam && (
                            <div className="absolute bottom-4 right-4 w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 border-4 border-[hsl(var(--background))] shadow-xl flex items-center justify-center text-white font-bold text-xl z-10">
                                RA
                            </div>
                        )}
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
                            onClick={() => setIsPaused(!isPaused)}
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
                        <p className="text-[hsl(var(--muted-foreground))] mb-8">Uploading to Google Drive...</p>
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
                                    https://drive.google.com/file/d/1a2b3c4d5e/view
                                </span>
                                <button
                                    onClick={handleCopy}
                                    className="p-2 hover:bg-[hsl(var(--accent))] rounded-lg transition-colors flex-shrink-0"
                                >
                                    {copied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />}
                                </button>
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
