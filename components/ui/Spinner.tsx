import React from 'react';
import { cn } from '@/lib/utils/cn';

export function Spinner({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'w-5 h-5 border-2',
        md: 'w-10 h-10 border-[3px]',
        lg: 'w-14 h-14 border-4',
    };

    return (
        <div
            className={cn(
                'animate-spin rounded-full border-[hsl(var(--muted))] border-t-[hsl(var(--primary))]',
                sizeClasses[size],
                className
            )}
        />
    );
}
