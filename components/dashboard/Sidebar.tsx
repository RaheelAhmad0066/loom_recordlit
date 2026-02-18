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

const navItems = [
    { label: 'Library', icon: Home, href: '/dashboard', active: true },
    { label: 'Recent', icon: Clock, href: '#recent' },
    { label: 'Starred', icon: Star, href: '#starred' },
    { label: 'Shared with me', icon: Users, href: '#shared' },
    { label: 'Folders', icon: FolderOpen, href: '#folders' },
];

const secondaryItems = [
    { label: 'Settings', icon: Settings, href: '#settings' },
    { label: 'Support', icon: HelpCircle, href: '#support' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 border-r border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card))] flex flex-col h-[calc(100vh-64px)] sticky top-16 hidden lg:flex">
            <div className="flex-1 py-6 px-4 space-y-8 overflow-y-auto">
                {/* Main Navigation */}
                <div className="space-y-1.5">
                    <p className="px-3 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">
                        Personal
                    </p>
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                                item.active
                                    ? "bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]"
                                    : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
                            )}
                        >
                            <item.icon className={cn(
                                "w-4.5 h-4.5 transition-colors",
                                item.active ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))]"
                            )} />
                            {item.label}
                        </Link>
                    ))}
                </div>

                {/* Team/Spaces (Mock) */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between px-3 mb-2">
                        <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                            Spaces
                        </p>
                        <button className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors">
                            <PlusCircle className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <div className="px-3 py-4 border border-dashed border-[hsl(var(--border))] rounded-xl text-center">
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">No spaces yet</p>
                        <button className="text-[hsl(var(--primary))] text-xs font-semibold mt-1 hover:underline">
                            Create a space
                        </button>
                    </div>
                </div>

                {/* Secondary Navigation */}
                <div className="space-y-1.5 pt-4">
                    {secondaryItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] transition-all group"
                        >
                            <item.icon className="w-4.5 h-4.5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))] transition-colors" />
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Bottom Section - Record Button */}
            <div className="p-4 border-t border-[hsl(var(--border)/0.5)]">
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
