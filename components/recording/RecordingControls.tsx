'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { RecordingOptions } from '@/types';
import { Mic, MicOff, Video, VideoOff, Circle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface RecordingControlsProps {
    onStartRecording: (options: RecordingOptions) => void;
    disabled?: boolean;
}

export function RecordingControls({ onStartRecording, disabled }: RecordingControlsProps) {
    const [includeMicrophone, setIncludeMicrophone] = useState(true);
    const [includeWebcam, setIncludeWebcam] = useState(false);

    const handleStart = () => {
        onStartRecording({
            includeMicrophone,
            includeWebcam,
        });
    };

    return (
        <div className="flex flex-col items-center space-y-8 p-8 animate-fade-in-up">
            <div className="text-center space-y-3">
                <h2 className="text-3xl sm:text-4xl font-bold text-gradient">
                    Ready to Record
                </h2>
                <p className="text-[hsl(var(--muted-foreground))]">
                    Configure your recording settings below
                </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 p-6 bg-[hsl(var(--muted)/0.5)] rounded-2xl w-full max-w-md border border-[hsl(var(--border))]">
                <button
                    onClick={() => setIncludeMicrophone(!includeMicrophone)}
                    className={cn(
                        'flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200 flex-1 w-full sm:w-auto hover-lift',
                        includeMicrophone
                            ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] shadow-md shadow-[hsl(var(--primary)/0.1)]'
                            : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)]'
                    )}
                >
                    {includeMicrophone ? (
                        <Mic className="w-8 h-8 text-[hsl(var(--primary))] mb-2" />
                    ) : (
                        <MicOff className="w-8 h-8 text-[hsl(var(--muted-foreground))] mb-2" />
                    )}
                    <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                        {includeMicrophone ? 'Mic On' : 'Mic Off'}
                    </span>
                </button>

                <button
                    onClick={() => setIncludeWebcam(!includeWebcam)}
                    className={cn(
                        'flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200 flex-1 w-full sm:w-auto hover-lift',
                        includeWebcam
                            ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] shadow-md shadow-[hsl(var(--primary)/0.1)]'
                            : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)]'
                    )}
                >
                    {includeWebcam ? (
                        <Video className="w-8 h-8 text-[hsl(var(--primary))] mb-2" />
                    ) : (
                        <VideoOff className="w-8 h-8 text-[hsl(var(--muted-foreground))] mb-2" />
                    )}
                    <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                        {includeWebcam ? 'Cam On' : 'Cam Off'}
                    </span>
                </button>
            </div>

            <Button
                variant="default"
                size="lg"
                onClick={handleStart}
                disabled={disabled}
                className="w-full max-w-md group rounded-xl h-12 text-base shadow-lg shadow-[hsl(var(--primary)/0.25)] hover:shadow-xl hover:shadow-[hsl(var(--primary)/0.3)] transition-all"
            >
                <Circle className="w-5 h-5 mr-2 fill-current group-hover:animate-pulse" />
                Start Recording
            </Button>

            <p className="text-xs text-[hsl(var(--muted-foreground))] text-center max-w-md">
                You&apos;ll be able to choose which screen, window, or tab to record after clicking Start
            </p>
        </div>
    );
}
