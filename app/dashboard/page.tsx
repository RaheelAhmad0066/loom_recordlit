'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Video, Plus, Grid, List, Moon, Sun, LogOut, ExternalLink, MoreVertical, Copy, Download, Edit2, Trash2, Play, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';

// Dummy recordings for UI demo
const dummyRecordings = [
    { id: '1', title: 'Product Demo — Q1 Launch', duration: 245, date: '2 hours ago', color: 'from-violet-500 to-purple-600' },
    { id: '2', title: 'Team Standup — Feb 18', duration: 128, date: '5 hours ago', color: 'from-sky-500 to-blue-600' },
    { id: '3', title: 'Bug Report #1234 Walkthrough', duration: 67, date: 'Yesterday', color: 'from-emerald-500 to-teal-600' },
    { id: '4', title: 'Onboarding Tutorial v2', duration: 532, date: '2 days ago', color: 'from-amber-500 to-orange-600' },
    { id: '5', title: 'Design Review — Homepage', duration: 189, date: '3 days ago', color: 'from-rose-500 to-pink-600' },
    { id: '6', title: 'API Integration Demo', duration: 312, date: '1 week ago', color: 'from-indigo-500 to-violet-600' },
];

function formatDuration(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function DashboardPage() {
    const { theme, toggleTheme } = useTheme();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [menuOpen, setMenuOpen] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredRecordings = dummyRecordings.filter(r =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[hsl(var(--background))]">
            {/* Header */}
            <header className="border-b border-[hsl(var(--border))] glass sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <Video className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-[hsl(var(--foreground))] hidden sm:block">
                            Record<span className="text-gradient">It</span>
                        </h1>
                    </Link>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl hover:bg-[hsl(var(--accent))] transition-colors"
                            title="Toggle theme"
                        >
                            {theme === 'light' ? <Moon className="w-5 h-5 text-[hsl(var(--muted-foreground))]" /> : <Sun className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />}
                        </button>

                        <div className="flex items-center gap-3">
                            <img
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Raheel"
                                alt="Raheel Ahmed"
                                className="w-9 h-9 rounded-full border-2 border-[hsl(var(--primary)/0.3)] ring-2 ring-[hsl(var(--primary)/0.1)]"
                            />
                            <div className="hidden md:block">
                                <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Raheel Ahmed</p>
                                <p className="text-xs text-[hsl(var(--muted-foreground))]">raheel@gmail.com</p>
                            </div>
                        </div>

                        <Link href="/">
                            <Button variant="ghost" size="sm" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))]">
                                <LogOut className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Toolbar */}
                <div className="flex flex-col gap-4 mb-8 animate-fade-in-up">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--foreground))]">My Recordings</h2>
                            <p className="text-[hsl(var(--muted-foreground))] mt-0.5">{filteredRecordings.length} recording{filteredRecordings.length !== 1 ? 's' : ''}</p>
                        </div>
                        <Link href="/record">
                            <Button variant="default" className="shadow-lg shadow-[hsl(var(--primary)/0.2)] rounded-xl group">
                                <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                                New Recording
                            </Button>
                        </Link>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                            <input
                                type="text"
                                placeholder="Search recordings..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition-all placeholder:text-[hsl(var(--muted-foreground))]"
                            />
                        </div>
                        <div className="flex items-center gap-1 bg-[hsl(var(--muted))] rounded-xl p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[hsl(var(--background))] shadow-sm text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`}
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[hsl(var(--background))] shadow-sm text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recordings Grid */}
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5' : 'flex flex-col gap-3'}>
                    {filteredRecordings.map((recording, i) => (
                        <div
                            key={recording.id}
                            className={`group bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl overflow-hidden transition-all duration-300 hover-lift animate-fade-in-up ${viewMode === 'list' ? 'flex items-center' : ''
                                }`}
                            style={{ animationDelay: `${i * 60}ms` }}
                        >
                            {/* Thumbnail */}
                            <div className={`bg-gradient-to-br ${recording.color} relative overflow-hidden cursor-pointer ${viewMode === 'list' ? 'w-40 h-24 flex-shrink-0' : 'aspect-video'
                                }`}>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110">
                                        <Play className="w-5 h-5 text-white ml-0.5" />
                                    </div>
                                </div>
                                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur text-white text-xs font-mono px-2 py-0.5 rounded-md">
                                    {formatDuration(recording.duration)}
                                </div>
                            </div>

                            {/* Content */}
                            <div className={`p-4 flex-1 ${viewMode === 'list' ? 'flex items-center justify-between' : ''}`}>
                                <div className={viewMode === 'list' ? 'flex-1' : ''}>
                                    <h3 className="font-semibold text-[hsl(var(--foreground))] truncate mb-0.5">
                                        {recording.title}
                                    </h3>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{recording.date}</p>
                                </div>

                                <div className={`flex items-center justify-between ${viewMode === 'list' ? '' : 'mt-3'}`}>
                                    <button className="text-sm text-[hsl(var(--primary))] hover:text-[hsl(var(--primary)/0.8)] flex items-center gap-1 font-medium transition-colors">
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        <span className={viewMode === 'list' ? 'hidden sm:inline' : ''}>Open</span>
                                    </button>

                                    <div className="relative">
                                        <button
                                            onClick={() => setMenuOpen(menuOpen === recording.id ? null : recording.id)}
                                            className="p-1.5 hover:bg-[hsl(var(--accent))] rounded-lg transition-colors"
                                        >
                                            <MoreVertical className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                                        </button>

                                        {menuOpen === recording.id && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                                                <div className="absolute right-0 bottom-full mb-1 w-44 bg-[hsl(var(--popover))] rounded-xl shadow-xl border border-[hsl(var(--border))] z-20 overflow-hidden animate-fade-in-up">
                                                    {[
                                                        { icon: Copy, label: 'Copy Link' },
                                                        { icon: Download, label: 'Download' },
                                                        { icon: Edit2, label: 'Rename' },
                                                    ].map((action) => (
                                                        <button
                                                            key={action.label}
                                                            onClick={() => setMenuOpen(null)}
                                                            className="w-full px-4 py-2.5 text-left hover:bg-[hsl(var(--accent))] flex items-center gap-2.5 text-sm transition-colors text-[hsl(var(--foreground))]"
                                                        >
                                                            <action.icon className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                                                            {action.label}
                                                        </button>
                                                    ))}
                                                    <div className="border-t border-[hsl(var(--border))]" />
                                                    <button
                                                        onClick={() => setMenuOpen(null)}
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
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
