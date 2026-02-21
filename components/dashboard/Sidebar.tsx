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
    PlusCircle
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type TabId = 'library' | 'recent' | 'starred' | 'folders' | 'settings' | 'support';

interface SidebarProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
    onUpload?: () => void;
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

export function Sidebar({ activeTab, onTabChange, onUpload }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside className="w-64 border-r border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card))] flex flex-col h-[calc(100vh-64px)] sticky top-16 hidden lg:flex">
            <div className="flex-1 py-6 px-4 space-y-8 overflow-y-auto">
                {/* Main Navigation */}
                <div className="space-y-1.5">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                                activeTab === item.id
                                    ? "bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]"
                                    : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
                            )}
                        >
                            <item.icon className={cn(
                                "w-4.5 h-4.5 transition-colors",
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
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                                activeTab === item.id
                                    ? "bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]"
                                    : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
                            )}
                        >
                            <item.icon className={cn(
                                "w-4.5 h-4.5 transition-colors",
                                activeTab === item.id ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))]"
                            )} />
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bottom Section - Action Buttons */}
            <div className="p-4 border-t border-[hsl(var(--border)/0.5)] space-y-3">
                <button
                    onClick={onUpload}
                    className="w-full py-2.5 bg-[hsl(var(--accent))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] rounded-xl text-sm font-bold hover:bg-[hsl(var(--accent))/0.8] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group"
                >
                    <PlusCircle className="w-4 h-4 text-[hsl(var(--primary))] group-hover:scale-110 transition-transform" />
                    Upload Video
                </button>
                <Link href="/record">
                    <button className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        Record a video
                    </button>
                </Link>
            </div>
        </aside>
    );
}
