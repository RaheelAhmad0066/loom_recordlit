'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Scissors,
    ArrowLeft,
    Save,
    Play,
    Pause,
    RotateCcw,
    CheckCircle,
    AlertCircle,
    Trash2,
    Edit2,
    Clock,
    Volume2,
    Maximize,
    Smile,
    Plus,
    ArrowUpRight,
    MousePointer2,
    Pencil,
    Type,
    MoreVertical,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { getRecording, updateRecording, deleteRecording } from '@/lib/firebase/firestore';
import { getStoredAccessToken } from '@/lib/firebase/auth';
import { getDirectDownloadUrl, deleteFileFromDrive } from '@/lib/utils/drive';
import { Recording } from '@/types';
import { cn } from '@/lib/utils/cn';
import { Star } from 'lucide-react';

export default function EditPage() {
    return (
        <React.Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
                <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <EditPageContent />
        </React.Suspense>
    );
}

function EditPageContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const router = useRouter();
    const { user } = useAuth();
    const token = getStoredAccessToken();

    const [recording, setRecording] = useState<Recording | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Editor State
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [videoProgress, setVideoProgress] = useState(0);
    const [isFetchingVideo, setIsFetchingVideo] = useState(false);
    const [videoBlobUrl, setVideoBlobUrl] = useState<string | undefined>(undefined);
    const [videoError, setVideoError] = useState<string | null>(null);
    const [noiseReduction, setNoiseReduction] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [overlays, setOverlays] = useState<{ id: string; type: string; content: string; x: number; y: number; scale: number; rotation: number; color: string; width?: number }[]>([]);
    const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        return () => {
            if (videoBlobUrl) URL.revokeObjectURL(videoBlobUrl);
            if (abortControllerRef.current) abortControllerRef.current.abort();
        };
    }, []);

    useEffect(() => {
        if (recording && token) {
            loadVideoData();
        }
    }, [recording, token]);

    const loadVideoData = async () => {
        if (!recording || !token) return;

        try {
            setIsFetchingVideo(true);
            setVideoError(null);

            if (abortControllerRef.current) abortControllerRef.current.abort();
            abortControllerRef.current = new AbortController();

            const url = getDirectDownloadUrl(recording.storagePath);
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                if (response.status === 401) {
                    setIsFetchingVideo(false);
                    setVideoError("Authentication expired. Redirecting to dashboard...");
                    setTimeout(() => {
                        router.push('/dashboard');
                    }, 2000);
                    return;
                }
                throw new Error(`Failed to load video: ${response.statusText}`);
            }

            if (!response.body) {
                throw new Error("Response body is null");
            }

            const contentLength = response.headers.get("content-length");
            const total = contentLength ? parseInt(contentLength, 10) : 0;
            let loaded = 0;

            const reader = response.body.getReader();
            const chunks: BlobPart[] = [];

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                chunks.push(value);
                loaded += value.length;

                if (total > 0) {
                    setVideoProgress(Math.round((loaded / total) * 100));
                }
            }

            const blob = new Blob(chunks, { type: "video/webm" });
            const objectUrl = URL.createObjectURL(blob);
            setVideoBlobUrl(objectUrl);
        } catch (err: any) {
            if (err.name !== "AbortError") {
                console.error("Video loading error:", err);
                setVideoError(err.message || "An error occurred while loading the video.");
            }
        } finally {
            setIsFetchingVideo(false);
        }
    };

    useEffect(() => {
        if (!user && !loading) {
            router.push('/login');
            return;
        }

        if (id) {
            fetchRecording();
        }
    }, [id, user]);

    const fetchRecording = async () => {
        try {
            setLoading(true);
            const data = await getRecording(id as string);
            if (data) {
                setRecording(data);
                setTitle(data.title);
                setStartTime(data.startTime || 0);
                setEndTime(data.endTime || data.duration);
                setIsMuted(data.isMuted || false);
                setOverlays(data.overlays || []);
            }
        } catch (error) {
            console.error('Error fetching recording:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!recording) return;
        setSaving(true);
        try {
            await updateRecording(recording.id, {
                title,
                startTime,
                endTime,
                isMuted,
                overlays
            });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error('Error saving:', error);
            alert('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const togglePlay = async () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            // If we are at the end of the trim, restart at the beginning of the trim
            if (videoRef.current.currentTime >= endTime) {
                videoRef.current.currentTime = startTime;
            }
            try {
                await videoRef.current.play();
                setIsPlaying(true);
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    console.error('Play error:', err);
                }
            }
        }
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const time = videoRef.current.currentTime;
        setCurrentTime(time);

        // Loop or stop at endTime
        if (endTime > 0 && time >= endTime) {
            videoRef.current.pause();
            setIsPlaying(false);
            videoRef.current.currentTime = endTime;
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (!isFinite(time)) return;
        if (videoRef.current) {
            videoRef.current.currentTime = time;
        }
        setCurrentTime(time);
    };

    const addEmoji = (emoji: string) => {
        setOverlays([...overlays, {
            id: Math.random().toString(36).substr(2, 9),
            type: 'emoji',
            content: emoji,
            x: 50,
            y: 50,
            scale: 1,
            rotation: 0,
            color: '#8b5cf6',
            width: emoji === 'arrow' ? 100 : undefined
        }]);
        setShowEmojiPicker(false);
    };

    const updateOverlayPos = (id: string, x: number, y: number) => {
        setOverlays(prev => prev.map(o => o.id === id ? { ...o, x, y } : o));
    };

    const updateOverlayScale = (id: string, delta: number) => {
        setOverlays(prev => prev.map(o => o.id === id ? { ...o, scale: Math.max(0.2, Math.min(o.scale + delta, 5)) } : o));
    };

    const updateOverlayRotation = (id: string, rotation: number) => {
        setOverlays(prev => prev.map(o => o.id === id ? { ...o, rotation } : o));
    };

    const updateOverlayWidth = (id: string, width: number) => {
        setOverlays(prev => prev.map(o => o.id === id ? { ...o, width: Math.max(20, width) } : o));
    };

    const updateOverlayColor = (id: string, color: string) => {
        setOverlays(prev => prev.map(o => o.id === id ? { ...o, color } : o));
    };

    const removeOverlay = (id: string) => {
        setOverlays(prev => prev.filter(o => o.id !== id));
    };

    const [transforming, setTransforming] = useState<{ id: string; type: 'rotate' | 'resize' | 'stretch'; startX: number; startY: number; initialValue: number } | null>(null);

    const handleTransformStart = (e: React.MouseEvent | React.TouchEvent, id: string, type: 'rotate' | 'resize' | 'stretch') => {
        e.stopPropagation();
        e.preventDefault();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const overlay = overlays.find(o => o.id === id);
        if (!overlay) return;

        setTransforming({
            id,
            type,
            startX: clientX,
            startY: clientY,
            initialValue: type === 'rotate' ? overlay.rotation : type === 'stretch' ? (overlay.width || 100) : overlay.scale
        });
    };

    useEffect(() => {
        const handleMove = (e: MouseEvent | TouchEvent) => {
            if (!transforming) return;
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

            if (transforming.type === 'resize') {
                const deltaX = clientX - transforming.startX;
                const deltaY = clientY - transforming.startY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                const factor = deltaX > 0 || deltaY > 0 ? 1 : -1;
                const newScale = Math.max(0.1, Math.min(transforming.initialValue + (distance * 0.01 * factor), 10));
                updateOverlayScale(transforming.id, newScale - overlays.find(o => o.id === transforming.id)!.scale);
            } else if (transforming.type === 'stretch') {
                const deltaX = clientX - transforming.startX;
                const deltaY = clientY - transforming.startY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                const factor = deltaX > 0 || deltaY > 0 ? 1 : -1;
                const newWidth = Math.max(20, transforming.initialValue + (distance * factor));
                updateOverlayWidth(transforming.id, newWidth);
            } else if (transforming.type === 'rotate') {
                const overlay = overlays.find(o => o.id === transforming.id);
                if (!overlay) return;

                // Simplified rotation: horizontal drag
                const deltaX = clientX - transforming.startX;
                const newRotation = (transforming.initialValue + deltaX) % 360;
                updateOverlayRotation(transforming.id, newRotation);
            }
        };

        const handleUp = () => setTransforming(null);

        if (transforming) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleUp);
            window.addEventListener('touchmove', handleMove);
            window.addEventListener('touchend', handleUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleUp);
        };
    }, [transforming, overlays]);

    const handleDelete = async () => {
        if (!id || !recording || !token) return;

        if (!confirm('Are you sure you want to delete this recording? This action cannot be undone.')) {
            return;
        }

        try {
            setSaving(true);

            // 1. Delete from Drive
            await deleteFileFromDrive(recording.storagePath, token);

            // 2. Delete from Firestore
            await deleteRecording(id as string);

            router.push('/dashboard');
        } catch (error: any) {
            console.error('Error deleting recording:', error);
            if (
                error.message?.includes('UNAUTHORIZED') ||
                error.message?.includes('401') ||
                error.message?.includes('invalid authentication credentials')
            ) {
                setVideoError("Authentication expired. Redirecting to dashboard...");
                setTimeout(() => {
                    router.push('/dashboard');
                }, 2000);
            } else {
                alert('Failed to delete recording: ' + error.message);
            }
        } finally {
            setSaving(false);
        }
    };

    const formatTime = (seconds: number) => {
        if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
                <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!recording) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--background))] p-4">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Recording not found</h1>
                <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col text-[hsl(var(--foreground))]">
            {/* ──── Header ──── */}
            <header className="h-16 border-b border-[hsl(var(--border)/0.5)] flex items-center justify-between px-6 glass sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="p-2 hover:bg-[hsl(var(--accent))] rounded-xl transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="h-10 w-px bg-[hsl(var(--border)/0.5)] mx-2" />
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 group">
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="bg-transparent border-none text-lg font-bold focus:ring-0 w-auto min-w-[200px] outline-none"
                                placeholder="Untitled video"
                            />
                            <Edit2 className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity" />
                        </div>
                        <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-widest font-bold">
                            Editing Mode
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {saveSuccess && (
                        <div className="flex items-center gap-2 text-emerald-500 text-sm font-medium animate-fade-in">
                            <CheckCircle className="w-4 h-4" />
                            Changes saved
                        </div>
                    )}
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-xl shadow-lg shadow-violet-500/20 px-6"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Changes
                    </Button>
                </div>
            </header>

            {/* ──── Main Editor Area ──── */}
            <main className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
                {/* Video Stage */}
                <div className="flex-1 bg-black/40 relative flex flex-col items-center justify-center p-8 overflow-hidden">
                    <div className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-black ring-1 ring-white/10 group">
                        <video
                            ref={videoRef}
                            src={videoBlobUrl}
                            className="w-full h-full object-contain cursor-default"
                            onClick={(e) => { e.stopPropagation(); setSelectedOverlayId(null); }}
                            muted={isMuted}
                            onTimeUpdate={handleTimeUpdate}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onLoadedMetadata={() => {
                                if (videoRef.current && recording) {
                                    const vidDuration = videoRef.current.duration;

                                    if (!recording.duration || recording.duration === 0) {
                                        setRecording({ ...recording, duration: vidDuration });
                                    }

                                    if (endTime === 0 || endTime > vidDuration) {
                                        setEndTime(vidDuration);
                                    }

                                    videoRef.current.currentTime = startTime;
                                }
                            }}
                        />

                        {/* Overlays Layer */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            {overlays.map((overlay) => (
                                <div
                                    key={overlay.id}
                                    className={cn(
                                        "absolute cursor-move pointer-events-auto select-none active:grayscale-[0.2] transition-transform group/overlay z-40",
                                        selectedOverlayId === overlay.id && "z-50"
                                    )}
                                    style={{
                                        left: `${overlay.x}%`,
                                        top: `${overlay.y}%`,
                                        transform: `translate(-50%, -50%) scale(${overlay.scale}) rotate(${overlay.rotation}deg)`,
                                    }}
                                    onMouseDown={(e) => {
                                        setSelectedOverlayId(overlay.id);
                                        const parent = (e.currentTarget as HTMLElement).parentElement;
                                        if (!parent) return;
                                        const rect = parent.getBoundingClientRect();

                                        const moveHandler = (moveEvent: MouseEvent) => {
                                            const x = Math.max(0, Math.min(100, ((moveEvent.clientX - rect.left) / rect.width) * 100));
                                            const y = Math.max(0, Math.min(100, ((moveEvent.clientY - rect.top) / rect.height) * 100));
                                            updateOverlayPos(overlay.id, x, y);
                                        };
                                        const upHandler = () => {
                                            window.removeEventListener('mousemove', moveHandler);
                                            window.removeEventListener('mouseup', upHandler);
                                        };
                                        window.addEventListener('mousemove', moveHandler);
                                        window.addEventListener('mouseup', upHandler);
                                    }}
                                >
                                    {overlay.type === 'text' ? (
                                        <div
                                            contentEditable
                                            suppressContentEditableWarning
                                            onBlur={(e) => {
                                                const newContent = e.currentTarget.textContent || '';
                                                setOverlays(prev => prev.map(o => o.id === overlay.id ? { ...o, content: newContent } : o));
                                            }}
                                            className="min-w-[100px] p-2 bg-black/60 rounded-lg border outline-none text-center font-bold text-xl backdrop-blur-sm"
                                            style={{
                                                color: overlay.color,
                                                borderColor: `${overlay.color}40`
                                            }}
                                        >
                                            {overlay.content}
                                        </div>
                                    ) : overlay.content === 'arrow' ? (
                                        <div className="relative flex items-center">
                                            <svg
                                                width={overlay.width || 100}
                                                height="40"
                                                viewBox={`0 0 ${overlay.width || 100} 40`}
                                                className="drop-shadow-[0_0_15px_rgba(0,0,0,0.3)]"
                                                style={{ filter: `drop-shadow(0 0 15px ${(overlay.color || '#8b5cf6')}60)` }}
                                            >
                                                <path
                                                    d={`
                                                        M 0,17 
                                                        L ${Math.max(0, (overlay.width || 100) - 20)},17 
                                                        L ${Math.max(0, (overlay.width || 100) - 20)},8 
                                                        L ${overlay.width || 100},20 
                                                        L ${Math.max(0, (overlay.width || 100) - 20)},32 
                                                        L ${Math.max(0, (overlay.width || 100) - 20)},23 
                                                        L 0,23 
                                                        Z
                                                    `}
                                                    fill={overlay.color || '#8b5cf6'}
                                                />
                                            </svg>
                                            <div
                                                className="absolute inset-x-0 h-4 blur-2xl rounded-full -z-10"
                                                style={{ backgroundColor: `${(overlay.color || '#8b5cf6')}30`, top: '50%', transform: 'translateY(-50%)' }}
                                            />
                                            {/* Stretch Handle */}
                                            <div
                                                onMouseDown={(e) => { e.stopPropagation(); handleTransformStart(e, overlay.id, 'stretch'); }}
                                                className={cn(
                                                    "absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-violet-500 cursor-ew-resize transition-opacity shadow-lg z-[60] opacity-0 group-hover/overlay:opacity-100",
                                                    selectedOverlayId === overlay.id && "opacity-100"
                                                )}
                                            />
                                        </div>
                                    ) : overlay.content === 'pencil' ? (
                                        <div className="relative">
                                            <Pencil
                                                className="w-12 h-12 drop-shadow-[0_0_15px_rgba(0,0,0,0.3)]"
                                                style={{ color: overlay.color, filter: `drop-shadow(0 0 15px ${overlay.color}60)` }}
                                            />
                                            <div
                                                className="absolute inset-0 blur-2xl rounded-full -z-10"
                                                style={{ backgroundColor: `${overlay.color}30` }}
                                            />
                                        </div>
                                    ) : (
                                        <span className="text-[3rem] drop-shadow-lg">{overlay.content}</span>
                                    )}

                                    {/* 
                                        Removed handles and controls from here to move to sidebar
                                        Selected overlay is now controlled via the Properties panel
                                    */}
                                </div>
                            ))}
                        </div>

                        {/* Progress Overlay */}
                        {(isFetchingVideo || videoError) && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                                {videoError ? (
                                    <div className="text-center p-6 bg-red-500/10 border border-red-500/20 rounded-2xl max-w-sm">
                                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                        <h3 className="text-white font-bold mb-2">Failed to load video</h3>
                                        <p className="text-red-400 text-sm mb-6">{videoError}</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={loadVideoData}
                                            className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                                        >
                                            <RotateCcw className="w-4 h-4 mr-2" />
                                            Try Again
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="w-full max-w-md px-12 text-center">
                                        <div className="relative w-20 h-20 mx-auto mb-8">
                                            <div className="absolute inset-0 border-4 border-violet-500/20 rounded-full" />
                                            <div
                                                className="absolute inset-0 border-4 border-violet-500 rounded-full border-t-transparent animate-spin"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-violet-500">
                                                {videoProgress}%
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Fetching Content</h3>
                                        <p className="text-slate-400 text-sm mb-8">Retrieving your high-quality recording from Drive...</p>

                                        {/* Simple Progress Bar */}
                                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
                                            <div
                                                className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-300 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                                                style={{ width: `${videoProgress}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            <span>Loading</span>
                                            <span>{videoProgress}%</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Centered Play/Pause Overlay (Shows on hover or pause) */}
                        {!isPlaying && (
                            <div
                                className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] cursor-pointer"
                                onClick={togglePlay}
                            >
                                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/40 flex items-center justify-center hover:scale-110 transition-transform duration-300">
                                    <Play className="w-10 h-10 text-white fill-current ml-1" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Controls */}
                    <div className="mt-8 flex items-center gap-6 bg-[hsl(var(--card))] px-8 py-4 rounded-3xl border border-[hsl(var(--border)/0.5)] shadow-xl">
                        <button onClick={togglePlay} className="p-2 hover:text-violet-500 transition-colors">
                            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                        </button>
                        <button onClick={() => {
                            if (videoRef.current) videoRef.current.currentTime = startTime;
                        }} className="p-2 hover:text-violet-500 transition-colors">
                            <RotateCcw className="w-5 h-5" />
                        </button>
                        <div className="h-6 w-px bg-[hsl(var(--border)/0.5)]" />
                        <div className="text-sm font-mono font-bold tracking-tight">
                            <span className="text-violet-500">{formatTime(currentTime)}</span>
                            <span className="text-[hsl(var(--muted-foreground))] mx-1">/</span>
                            <span>{formatTime(recording?.duration || 0)}</span>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Properties & Tools */}
                <aside className="w-full lg:w-80 border-l border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card))] overflow-y-auto p-6">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Scissors className="w-5 h-5 text-violet-500" />
                        Edit Properties
                    </h2>

                    <div className="space-y-8">
                        {/* Quick Actions */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={async () => {
                                    if (!recording) return;
                                    const newVal = !recording.isStarred;
                                    await updateRecording(recording.id, { isStarred: newVal });
                                    setRecording({ ...recording, isStarred: newVal });
                                }}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all font-bold text-sm",
                                    recording.isStarred
                                        ? "bg-amber-500/10 border-amber-500/30 text-amber-600"
                                        : "bg-[hsl(var(--accent))] border-transparent text-[hsl(var(--muted-foreground))] hover:border-amber-500/30 hover:text-amber-500"
                                )}
                            >
                                <Star className={cn("w-4 h-4", recording.isStarred && "fill-current")} />
                                {recording.isStarred ? 'Starred' : 'Star Video'}
                            </button>
                        </div>

                        {/* Trim Inputs */}
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest">Trim Video</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <span className="text-[10px] text-[hsl(var(--muted-foreground))]">Start (sec)</span>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={startTime}
                                        onChange={(e) => {
                                            const val = Math.max(0, Math.min(parseFloat(e.target.value), endTime - 0.1));
                                            setStartTime(val);
                                            if (videoRef.current) videoRef.current.currentTime = val;
                                        }}
                                        className="w-full bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-violet-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <span className="text-[10px] text-[hsl(var(--muted-foreground))]">End (sec)</span>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={endTime}
                                        onChange={(e) => {
                                            const val = Math.min(recording.duration, Math.max(parseFloat(e.target.value), startTime + 0.1));
                                            setEndTime(val);
                                            if (videoRef.current) videoRef.current.currentTime = val;
                                        }}
                                        className="w-full bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-violet-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-[hsl(var(--border)/0.5)]" />

                        {/* Premium Tools */}
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest">Enhanced Features</label>
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-sm group",
                                    isMuted
                                        ? "bg-red-500/10 border-red-500/30 text-red-500"
                                        : "bg-[hsl(var(--accent))] border-transparent hover:border-violet-500/30"
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                    isMuted ? "bg-red-500 text-white" : "bg-violet-500/10 text-violet-500"
                                )}>
                                    <Volume2 className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="font-bold">Mute Audio</span>
                                    <span className="text-[10px] opacity-60">{isMuted ? 'Voice Hidden' : 'Video Sound Active'}</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setNoiseReduction(!noiseReduction)}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-sm group",
                                    noiseReduction
                                        ? "bg-blue-500/10 border-blue-500/30 text-blue-500"
                                        : "bg-[hsl(var(--accent))] border-transparent hover:border-violet-500/30"
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                    noiseReduction ? "bg-blue-500 text-white" : "bg-blue-500/10 text-blue-500"
                                )}>
                                    <Volume2 className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="font-bold">Noise Reduction</span>
                                    <span className="text-[10px] opacity-60">{noiseReduction ? 'Enhanced Audio Enabled' : 'Simulate Studio Quality'}</span>
                                </div>
                            </button>
                            <button className="w-full flex items-center gap-3 p-3 rounded-2xl bg-[hsl(var(--accent))] border border-transparent hover:border-violet-500/30 transition-all text-sm group">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                    <Maximize className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="font-bold">Canvas Resize</span>
                                    <span className="text-[10px] opacity-60">Optimize for Social Media</span>
                                </div>
                            </button>

                            {/* Annotation Tools */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-sm group",
                                        showEmojiPicker ? "bg-violet-500/10 border-violet-500/30" : "bg-[hsl(var(--accent))] border-transparent hover:border-violet-500/30"
                                    )}
                                >
                                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                                        <MousePointer2 className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="font-bold">Annotate</span>
                                        <span className="text-[10px] opacity-60">Arrows, Pencils & Highlights</span>
                                    </div>
                                    <Plus className="w-4 h-4 ml-auto opacity-40" />
                                </button>

                                {showEmojiPicker && (
                                    <div className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] rounded-2xl shadow-2xl flex flex-col gap-2 z-50 animate-in fade-in slide-in-from-bottom-2">
                                        <div className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest px-1">Select Tool</div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => {
                                                    const id = Math.random().toString(36).substr(2, 9);
                                                    setOverlays([...overlays, { id, type: 'emoji', content: 'arrow', x: 50, y: 50, scale: 1, rotation: 0, color: '#8b5cf6', width: 100 }]);
                                                    setSelectedOverlayId(id);
                                                    setShowEmojiPicker(false);
                                                }}
                                                className="flex items-center gap-2 p-2 hover:bg-[hsl(var(--accent))] rounded-xl transition-colors text-xs font-medium"
                                            >
                                                <ArrowUpRight className="w-4 h-4 text-violet-500" />
                                                Arrow
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const id = Math.random().toString(36).substr(2, 9);
                                                    setOverlays([...overlays, { id, type: 'emoji', content: 'pencil', x: 50, y: 50, scale: 1, rotation: 0, color: '#10b981' }]);
                                                    setSelectedOverlayId(id);
                                                    setShowEmojiPicker(false);
                                                }}
                                                className="flex items-center gap-2 p-2 hover:bg-[hsl(var(--accent))] rounded-xl transition-colors text-xs font-medium"
                                            >
                                                <Pencil className="w-4 h-4 text-emerald-500" />
                                                Pencil
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const id = Math.random().toString(36).substr(2, 9);
                                                    setOverlays([...overlays, { id, type: 'text', content: 'Double click to edit', x: 50, y: 50, scale: 1, rotation: 0, color: '#f59e0b' }]);
                                                    setSelectedOverlayId(id);
                                                    setShowEmojiPicker(false);
                                                }}
                                                className="flex items-center gap-2 p-2 hover:bg-[hsl(var(--accent))] rounded-xl transition-colors text-xs font-medium"
                                            >
                                                <Type className="w-4 h-4 text-amber-500" />
                                                Text
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ──── Annotation Properties Sidebar ──── */}
                            {selectedOverlayId && overlays.find(o => o.id === selectedOverlayId) && (
                                <div className="mt-8 p-5 bg-violet-500/5 border border-violet-500/20 rounded-3xl space-y-6 animate-in fade-in slide-in-from-right-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-bold text-violet-500 uppercase tracking-widest">Annotation Properties</h3>
                                        <button
                                            onClick={() => setSelectedOverlayId(null)}
                                            className="text-[hsl(var(--muted-foreground))] hover:text-red-500 p-1"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Color Picker */}
                                    <div className="space-y-3">
                                        <span className="text-[10px] font-bold opacity-60 uppercase">Pick Color</span>
                                        <div className="flex flex-wrap gap-2">
                                            {['#ffffff', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'].map(c => (
                                                <button
                                                    key={c}
                                                    onClick={() => updateOverlayColor(selectedOverlayId!, c)}
                                                    className={cn(
                                                        "w-6 h-6 rounded-full border border-white/20 transition-all hover:scale-125",
                                                        overlays.find(o => o.id === selectedOverlayId)?.color === c && "ring-2 ring-violet-500 ring-offset-2 ring-offset-[hsl(var(--card))]"
                                                    )}
                                                    style={{ backgroundColor: c }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Size/Scale Slider */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold opacity-60 uppercase">Overall Scale</span>
                                            <span className="text-[10px] font-mono text-violet-500">{(overlays.find(o => o.id === selectedOverlayId)?.scale || 1).toFixed(1)}x</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0.2"
                                            max="5"
                                            step="0.1"
                                            value={overlays.find(o => o.id === selectedOverlayId)?.scale || 1}
                                            onChange={(e) => {
                                                const current = overlays.find(o => o.id === selectedOverlayId)?.scale || 1;
                                                updateOverlayScale(selectedOverlayId!, parseFloat(e.target.value) - current);
                                            }}
                                            className="w-full h-1 bg-[hsl(var(--border))] rounded-lg appearance-none cursor-pointer accent-violet-500"
                                        />
                                    </div>

                                    {/* Arrow Width (Stretch) - Only for arrows */}
                                    {overlays.find(o => o.id === selectedOverlayId)?.content === 'arrow' && (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold opacity-60 uppercase">Arrow Length</span>
                                                <span className="text-[10px] font-mono text-violet-500">{Math.round(overlays.find(o => o.id === selectedOverlayId)?.width || 100)}px</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="50"
                                                max="500"
                                                step="1"
                                                value={overlays.find(o => o.id === selectedOverlayId)?.width || 100}
                                                onChange={(e) => updateOverlayWidth(selectedOverlayId!, parseInt(e.target.value))}
                                                className="w-full h-1 bg-[hsl(var(--border))] rounded-lg appearance-none cursor-pointer accent-violet-500"
                                            />
                                        </div>
                                    )}

                                    {/* Rotation Slider */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold opacity-60 uppercase">Rotation</span>
                                            <span className="text-[10px] font-mono text-violet-500">{Math.round(overlays.find(o => o.id === selectedOverlayId)?.rotation || 0)}°</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="360"
                                            step="1"
                                            value={overlays.find(o => o.id === selectedOverlayId)?.rotation || 0}
                                            onChange={(e) => updateOverlayRotation(selectedOverlayId!, parseInt(e.target.value))}
                                            className="w-full h-1 bg-[hsl(var(--border))] rounded-lg appearance-none cursor-pointer accent-violet-500"
                                        />
                                    </div>

                                    {/* Delete Button */}
                                    <button
                                        onClick={() => {
                                            removeOverlay(selectedOverlayId!);
                                            setSelectedOverlayId(null);
                                        }}
                                        className="w-full mt-4 flex items-center justify-center gap-2 p-3 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all font-bold text-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Remove Annotation
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-[hsl(var(--border)/0.5)]">
                        <button
                            onClick={handleDelete}
                            disabled={saving}
                            className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all text-sm font-bold disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4" />
                            {saving ? 'Deleting...' : 'Delete Original'}
                        </button>
                    </div>
                </aside>
            </main>
        </div>
    );
}
