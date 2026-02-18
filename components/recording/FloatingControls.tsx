'use client';

import React, { useState, useEffect } from 'react';
import { Pause, Play, Square } from 'lucide-react';
import { formatDuration } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface FloatingControlsProps {
    isPaused: boolean;
    duration: number;
    onPause: () => void;
    onResume: () => void;
    onStop: () => void;
}

export function FloatingControls({
    isPaused,
    duration,
    onPause,
    onResume,
    onStop,
}: FloatingControlsProps) {
    const [position, setPosition] = useState({ x: 20, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).tagName === 'BUTTON') return;
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        });
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setPosition({
                    x: e.clientX - dragOffset.x,
                    y: e.clientY - dragOffset.y,
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset]);

    return (
        <div
            className={cn(
                'fixed z-50 bg-[hsl(var(--card)/0.95)] backdrop-blur-xl text-[hsl(var(--foreground))] rounded-full shadow-2xl px-5 py-3 flex items-center gap-4 border border-[hsl(var(--border))] animate-slide-in-left',
                isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab hover:shadow-3xl'
            )}
            style={{ left: position.x, top: position.y, transition: isDragging ? 'none' : 'box-shadow 0.3s, transform 0.2s' }}
            onMouseDown={handleMouseDown}
        >
            {/* Recording Indicator */}
            <div className="flex items-center gap-2.5">
                <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    {!isPaused && (
                        <div className="absolute inset-0 w-3 h-3 rounded-full bg-red-500 animate-ping" />
                    )}
                </div>
                <span className="font-mono font-semibold text-base tabular-nums tracking-wider">
                    {formatDuration(duration)}
                </span>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-[hsl(var(--border))]" />

            {/* Controls */}
            <div className="flex items-center gap-1">
                <button
                    onClick={isPaused ? onResume : onPause}
                    className="p-2 hover:bg-[hsl(var(--accent))] rounded-full transition-colors"
                    title={isPaused ? 'Resume' : 'Pause'}
                >
                    {isPaused ? (
                        <Play className="w-5 h-5 fill-current text-[hsl(var(--primary))]" />
                    ) : (
                        <Pause className="w-5 h-5 fill-current" />
                    )}
                </button>

                <button
                    onClick={onStop}
                    className="p-2 hover:bg-red-500/10 rounded-full transition-colors text-red-500"
                    title="Stop Recording"
                >
                    <Square className="w-5 h-5 fill-current" />
                </button>
            </div>
        </div>
    );
}
