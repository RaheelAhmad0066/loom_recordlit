'use client';

import React from 'react';

interface CountdownOverlayProps {
    count: number;
}

export function CountdownOverlay({ count }: CountdownOverlayProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
            <div className="relative">
                {/* Pulsing ring */}
                <div className="absolute inset-0 animate-ping rounded-full bg-[hsl(var(--primary)/0.2)]" style={{ width: '160px', height: '160px', margin: '-20px' }} />
                {/* Number */}
                <div className="w-32 h-32 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center animate-countdown shadow-2xl shadow-[hsl(var(--primary)/0.4)]" key={count}>
                    <span className="text-6xl font-bold text-[hsl(var(--primary-foreground))]">
                        {count}
                    </span>
                </div>
            </div>
        </div>
    );
}
