import { Recording } from "@/types";
import { useEffect, useState, useRef } from "react";
import { getDirectDownloadUrl } from "@/lib/utils/drive";
import { getStoredAccessToken, signInWithGoogle } from "@/lib/firebase/auth";
import { Loader2, AlertCircle, Play, Download, X, Copy, LogIn, ArrowUpRight, Pencil, Share } from "lucide-react";

export interface VideoPlayerProps {
    recording: Recording;
    onClose: () => void;
}

export function VideoPlayer({ recording, onClose }: VideoPlayerProps) {
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [isAuthError, setIsAuthError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        let objectUrl: string | null = null;
        const abortController = new AbortController();

        const loadVideo = async () => {
            try {
                setError(null);
                setIsAuthError(false);
                setLoading(true);

                const token = getStoredAccessToken();
                if (!token) {
                    setIsAuthError(true);
                    throw new Error("Authentication token missing. Please sign in again.");
                }

                const url = getDirectDownloadUrl(recording.storagePath);

                const response = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    signal: abortController.signal,
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        setIsAuthError(true);
                        throw new Error("Session expired. Please log in again.");
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
                        setProgress(Math.round((loaded / total) * 100));
                    }
                }

                const blob = new Blob(chunks, { type: "video/webm" });
                objectUrl = URL.createObjectURL(blob);
                setVideoUrl(objectUrl);
                setLoading(false);
            } catch (err: any) {
                if (err.name !== "AbortError") {
                    console.error("Video loading error:", err);
                    setError(err.message || "An error occurred while loading the video.");
                    setLoading(false);
                }
            }
        };

        loadVideo();

        return () => {
            abortController.abort();
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [recording.storagePath, retryCount]);

    const handleReauth = async () => {
        try {
            setLoading(true);
            setError(null);
            await signInWithGoogle();
            setRetryCount(prev => prev + 1);
        } catch (err: any) {
            setError("Re-authentication failed: " + err.message);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Player Container */}
            <div className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-scale-in">
                {/* Header/Title */}
                <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center justify-between">
                    <h2 className="text-white font-semibold truncate px-4">{recording.title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Video Container */}
                <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
                    {loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/50 backdrop-blur-sm z-20">
                            <Loader2 className="w-12 h-12 text-violet-500 animate-spin mb-4" />
                            <div className="w-64 bg-white/10 rounded-full h-2 overflow-hidden mb-2">
                                <div
                                    className="bg-violet-500 h-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-white/70 text-sm font-medium">Loading Video {progress}%</p>
                        </div>
                    )}

                    {error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 p-6 z-20 text-center">
                            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                            <h3 className="text-white font-semibold mb-2">Could Not Load Video</h3>
                            <p className="text-white/60 text-sm max-w-md mb-6">{error}</p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                {isAuthError && (
                                    <button
                                        onClick={handleReauth}
                                        className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-all font-medium flex items-center justify-center gap-2"
                                    >
                                        <LogIn className="w-4 h-4" />
                                        Login & Retry
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all font-medium"
                                >
                                    Close Player
                                </button>
                            </div>
                        </div>
                    )}

                    {videoUrl && (
                        <>
                            <video
                                ref={videoRef}
                                src={videoUrl}
                                autoPlay
                                controls
                                muted={recording.isMuted}
                                className="w-full h-full object-contain"
                                onTimeUpdate={() => {
                                    if (videoRef.current && recording.endTime) {
                                        if (videoRef.current.currentTime >= recording.endTime) {
                                            // Only pause if not already paused
                                            if (!videoRef.current.paused) {
                                                videoRef.current.pause();
                                            }
                                            videoRef.current.currentTime = recording.endTime;
                                        }
                                    }
                                }}
                                onLoadedMetadata={() => {
                                    if (videoRef.current && recording.startTime) {
                                        videoRef.current.currentTime = recording.startTime;
                                    }
                                }}
                            />

                            {/* Overlays Layer - Read Only */}
                            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                {recording.overlays?.map((overlay: any) => (
                                    <div
                                        key={overlay.id}
                                        className="absolute"
                                        style={{
                                            left: `${overlay.x}%`,
                                            top: `${overlay.y}%`,
                                            transform: `translate(-50%, -50%) scale(${overlay.scale}) rotate(${overlay.rotation || 0}deg)`,
                                        }}
                                    >
                                        {overlay.type === 'text' ? (
                                            <div
                                                className="min-w-[100px] p-2 bg-black/60 rounded-lg border text-center font-bold text-xl backdrop-blur-sm"
                                                style={{
                                                    color: overlay.color || '#ffffff',
                                                    borderColor: `${overlay.color || '#ffffff'}40`
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
                                            </div>
                                        ) : overlay.content === 'pencil' ? (
                                            <div className="relative">
                                                <Pencil
                                                    className="w-12 h-12 drop-shadow-[0_0_15px_rgba(0,0,0,0.3)]"
                                                    style={{ color: overlay.color || '#10b981', filter: `drop-shadow(0 0 15px ${(overlay.color || '#10b981')}60)` }}
                                                />
                                                <div
                                                    className="absolute inset-0 blur-2xl rounded-full -z-10"
                                                    style={{ backgroundColor: `${(overlay.color || '#10b981')}30` }}
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-[3rem] drop-shadow-lg">{overlay.content}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-4 bg-[hsl(var(--card))] border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
                        <span>{recording.createdAt instanceof Date ? recording.createdAt.toLocaleDateString() : 'Recent'}</span>
                        <span>•</span>
                        <span>{Math.floor(recording.duration / 60)}:{(recording.duration % 60).toString().padStart(2, '0')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={recording.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-all border border-white/10 flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Open in Drive
                        </a>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(recording.videoUrl);
                            }}
                            className="px-4 py-2 bg-[hsl(var(--primary))] text-white rounded-lg text-sm font-medium hover:bg-[hsl(var(--primary)/0.9)] transition-all flex items-center gap-2"
                        >
                            <Copy className="w-4 h-4" />
                            Copy Link
                        </button>
                        <button
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: recording.title,
                                        text: `Check out this recording: ${recording.title}`,
                                        url: recording.videoUrl
                                    });
                                } else {
                                    navigator.clipboard.writeText(recording.videoUrl);
                                    alert('Link copied to clipboard!');
                                }
                            }}
                            className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-all border border-white/10 flex items-center gap-2"
                        >
                            <Share className="w-4 h-4" />
                            Share
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
