import { Recording } from "@/types";

export interface VideoPlayerProps {
    recording: Recording;
    onClose: () => void;
}

export function VideoPlayer({ recording, onClose }: VideoPlayerProps) {
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
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Video Container */}
                <div className="aspect-video bg-gray-900 flex items-center justify-center">
                    <iframe
                        src={`https://drive.google.com/file/d/${recording.storagePath}/preview`}
                        className="w-full h-full border-none shadow-inner"
                        allow="autoplay"
                        allowFullScreen
                    />
                </div>

                {/* Footer Controls (Optional more UI here) */}
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
                            className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-all border border-white/10"
                        >
                            Open in Drive
                        </a>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(recording.videoUrl);
                            }}
                            className="px-4 py-2 bg-[hsl(var(--primary))] text-white rounded-lg text-sm font-medium hover:bg-[hsl(var(--primary)/0.9)] transition-all"
                        >
                            Copy Link
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
