'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';

interface WebcamOverlayProps {
    stream: MediaStream | null;
}

export function WebcamOverlay({ stream }: WebcamOverlayProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [position, setPosition] = useState({ x: window.innerWidth - 220, y: window.innerHeight - 220 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const handleMouseDown = (e: React.MouseEvent) => {
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

    if (!stream) return null;

    return (
        <div
            className={cn(
                'fixed z-40 rounded-full overflow-hidden shadow-2xl ring-4 ring-[hsl(var(--primary)/0.3)] border-4 border-[hsl(var(--background))]',
                isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab hover:ring-[hsl(var(--primary)/0.5)]'
            )}
            style={{
                left: position.x,
                top: position.y,
                width: '180px',
                height: '180px',
                transition: isDragging ? 'none' : 'ring-color 0.3s, transform 0.2s',
            }}
            onMouseDown={handleMouseDown}
        >
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
            />
        </div>
    );
}
