'use client';

import React, { useState } from 'react';
import { Recording } from '@/types';
import { Card } from '@/components/ui/Card';
import { formatDuration, formatDate } from '@/lib/utils/format';
import { MoreVertical, ExternalLink, Copy, Download, Edit2, Trash2, Check, Play } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface RecordingCardProps {
    recording: Recording;
    onDelete: (id: string) => void;
    onRename: (id: string, newTitle: string) => void;
}

export function RecordingCard({ recording, onDelete, onRename }: RecordingCardProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(recording.title);
    const [copied, setCopied] = useState(false);

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(recording.videoUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        setShowMenu(false);
    };

    const handleRename = () => {
        if (editTitle.trim() && editTitle !== recording.title) {
            onRename(recording.id, editTitle.trim());
        }
        setIsEditing(false);
    };

    const handleDownload = () => {
        window.open(recording.videoUrl.replace('/view', '/export?format=mp4'), '_blank');
        setShowMenu(false);
    };

    return (
        <Card className="overflow-hidden group hover-lift">
            {/* Thumbnail */}
            <div className="aspect-video bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(280_80%_60%)] relative overflow-hidden">
                {recording.thumbnailUrl ? (
                    <img src={recording.thumbnailUrl} alt={recording.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Play className="w-7 h-7 text-white ml-1" />
                        </div>
                    </div>
                )}
                {/* Duration badge */}
                <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-md">
                    {formatDuration(recording.duration)}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={handleRename}
                            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                            className="flex-1 px-3 py-1.5 border border-[hsl(var(--input))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] text-sm bg-[hsl(var(--background))]"
                            autoFocus
                        />
                    </div>
                ) : (
                    <h3 className="font-semibold text-lg mb-1 truncate text-[hsl(var(--foreground))]">{recording.title}</h3>
                )}
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    {formatDate(recording.createdAt)}
                </p>

                <div className="flex items-center justify-between mt-4">
                    <a
                        href={recording.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[hsl(var(--primary))] hover:text-[hsl(var(--primary)/0.8)] flex items-center gap-1.5 font-medium transition-colors"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open in Drive
                    </a>

                    {/* Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-1.5 hover:bg-[hsl(var(--accent))] rounded-lg transition-colors"
                        >
                            <MoreVertical className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                        </button>

                        {showMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                                <div className="absolute right-0 bottom-full mb-2 w-48 bg-[hsl(var(--popover))] text-[hsl(var(--popover-foreground))] rounded-xl shadow-xl border border-[hsl(var(--border))] z-20 overflow-hidden animate-fade-in-up">
                                    <button
                                        onClick={handleCopyLink}
                                        className="w-full px-4 py-2.5 text-left hover:bg-[hsl(var(--accent))] flex items-center gap-2.5 text-sm transition-colors"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                        {copied ? 'Copied!' : 'Copy Link'}
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="w-full px-4 py-2.5 text-left hover:bg-[hsl(var(--accent))] flex items-center gap-2.5 text-sm transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download
                                    </button>
                                    <button
                                        onClick={() => { setIsEditing(true); setShowMenu(false); }}
                                        className="w-full px-4 py-2.5 text-left hover:bg-[hsl(var(--accent))] flex items-center gap-2.5 text-sm transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Rename
                                    </button>
                                    <div className="border-t border-[hsl(var(--border))]" />
                                    <button
                                        onClick={() => {
                                            if (confirm('Are you sure you want to delete this recording?')) {
                                                onDelete(recording.id);
                                            }
                                            setShowMenu(false);
                                        }}
                                        className="w-full px-4 py-2.5 text-left hover:bg-[hsl(var(--destructive)/0.1)] flex items-center gap-2.5 text-sm text-[hsl(var(--destructive))] transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}
