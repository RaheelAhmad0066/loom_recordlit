'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Video,
    Home,
    Clock,
    Star,
    Settings,
    Users,
    FolderOpen,
    HelpCircle,
    PlusCircle,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
export type TabId = 'library' | 'recent' | 'starred' | 'folders' | 'settings' | 'support';

interface SidebarProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
    onUpload?: () => void;
    isOpen?: boolean;
    onClose?: () => void;
}

const navItems = [
    { id: 'library' as TabId, label: 'Library', icon: Home },
    { id: 'recent' as TabId, label: 'Recent', icon: Clock },
    { id: 'starred' as TabId, label: 'Starred', icon: Star },
    { id: 'folders' as TabId, label: 'Folders', icon: FolderOpen },
];

const secondaryItems = [
    { id: 'settings' as TabId, label: 'Settings', icon: Settings },
    { id: 'support' as TabId, label: 'Support', icon: HelpCircle },
];

export function Sidebar({ activeTab, onTabChange, onUpload, isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
                    onClick={onClose}
                />
            )}

            <aside className={cn(
                "fixed lg:sticky top-0 lg:top-16 left-0 z-50 lg:z-30 w-72 lg:w-64 h-full lg:h-[calc(100vh-64px)] border-r border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card))] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Mobile Header in Sidebar */}
                <div className="flex items-center justify-between p-4 lg:hidden border-b border-[hsl(var(--border)/0.5)]">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Recordly" className="w-10 h-10 object-contain" />
                        <span className="text-xl font-bold tracking-tight">Recordly</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-[hsl(var(--accent))] transition-colors"
                    >
                        <X className="w-6 h-6 text-[hsl(var(--muted-foreground))]" />
                    </button>
                </div>

                <div className="flex-1 py-6 px-4 space-y-8 overflow-y-auto">
                    {/* Main Navigation */}
                    <div className="space-y-1.5">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onTabChange(item.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group lg:py-2.5",
                                    activeTab === item.id
                                        ? "bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]"
                                        : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
                                )}
                            >
                                <item.icon className={cn(
                                    "w-5 h-5 lg:w-4.5 lg:h-4.5 transition-colors",
                                    activeTab === item.id ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))]"
                                )} />
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Secondary Navigation */}
                    <div className="space-y-1.5 pt-4">
                        {secondaryItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onTabChange(item.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group lg:py-2.5",
                                    activeTab === item.id
                                        ? "bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]"
                                        : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
                                )}
                            >
                                <item.icon className={cn(
                                    "w-5 h-5 lg:w-4.5 lg:h-4.5 transition-colors",
                                    activeTab === item.id ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))]"
                                )} />
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bottom Section - Action Buttons */}
                <div className="p-4 border-t border-[hsl(var(--border)/0.5)] space-y-3 pb-8 lg:pb-4">
                    <button
                        onClick={onUpload}
                        className="w-full py-3 lg:py-2.5 bg-[hsl(var(--accent))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] rounded-xl text-sm font-bold hover:bg-[hsl(var(--accent))/0.8] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group"
                    >
                        <PlusCircle className="w-5 h-5 lg:w-4 h-4 text-[hsl(var(--primary))] group-hover:scale-110 transition-transform" />
                        Upload Video
                    </button>
                    <Link href="/record" className="block">
                        <button
                            className="w-full py-3.5 lg:py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                        >
                            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            Record a video
                        </button>
                    </Link>
                </div>
            </aside>
        </>
    );
}
