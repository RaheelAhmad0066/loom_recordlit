'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from './Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children?: React.ReactNode;
    confirmLabel?: string;
    onConfirm?: (value?: string) => void;
    showInput?: boolean;
    inputPlaceholder?: string;
    initialInputValue?: string;
    type?: 'destructive' | 'primary';
    isLoading?: boolean;
}

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    confirmLabel = 'Confirm',
    onConfirm,
    showInput = false,
    inputPlaceholder = 'Enter value...',
    initialInputValue = '',
    type = 'primary',
    isLoading = false
}: ModalProps) {
    const [inputValue, setInputValue] = useState(initialInputValue);

    useEffect(() => {
        if (isOpen) {
            setInputValue(initialInputValue);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, initialInputValue]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm(showInput ? inputValue : undefined);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-white dark:bg-[hsl(var(--card))] rounded-[2rem] shadow-2xl border border-[hsl(var(--border)/0.5)] overflow-hidden animate-zoom-in">
                <div className="p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">{title}</h3>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-xl hover:bg-[hsl(var(--accent))] transition-colors text-[hsl(var(--muted-foreground))]"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {description && (
                        <p className="text-[hsl(var(--muted-foreground))] mb-6 text-sm leading-relaxed">
                            {description}
                        </p>
                    )}

                    {showInput && (
                        <div className="mb-6">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={inputPlaceholder}
                                autoFocus
                                className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--accent))] border-2 border-transparent focus:border-[hsl(var(--primary)/0.3)] focus:ring-4 focus:ring-[hsl(var(--primary)/0.1)] transition-all outline-none text-sm font-medium"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleConfirm();
                                    if (e.key === 'Escape') onClose();
                                }}
                            />
                        </div>
                    )}

                    {children && <div className="mb-6">{children}</div>}

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 bg-transparent hover:bg-[hsl(var(--accent))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))]"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant={type === 'destructive' ? 'destructive' : 'primary'}
                            onClick={handleConfirm}
                            isLoading={isLoading}
                            className={cn(
                                "flex-1 shadow-lg",
                                type === 'destructive' && "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20",
                                type === 'primary' && "bg-[hsl(var(--primary))] hover:opacity-90 shadow-[hsl(var(--primary)/0.2)]"
                            )}
                        >
                            {confirmLabel}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
