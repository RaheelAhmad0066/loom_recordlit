'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Video, Plus, Grid, List, Moon, Sun, LogOut, ExternalLink, MoreVertical, Copy, Download, Edit2, Trash2, Play, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { getUserRecordings, deleteRecording } from '@/lib/firebase/firestore';
import { signOut } from '@/lib/firebase/auth';
import { Recording } from '@/types';

import { Sidebar } from '@/components/dashboard/Sidebar';
import { VideoPlayer } from '@/components/dashboard/VideoPlayer';

function formatDuration(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

const colorPresets = [
    'from-violet-500 to-indigo-600',
    'from-sky-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-fuchsia-500 to-purple-600',
];

export default function DashboardPage() {
    const { theme, toggleTheme } = useTheme();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [menuOpen, setMenuOpen] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<Recording | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            fetchRecordings();
        }
    }, [user, authLoading]);

    const fetchRecordings = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await getUserRecordings(user.uid);
            setRecordings(data);
        } catch (error) {
            console.error('Error fetching recordings:', error);
            // Fallback for query index issues - if index is missing, try a simpler query
            // but for now we just log it.
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut();
            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this recording?')) {
            try {
                await deleteRecording(id);
                setRecordings(prev => prev.filter(r => r.id !== id));
            } catch (error) {
                console.error('Delete error:', error);
            }
        }
    };

    const filteredRecordings = recordings.filter(r =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
                <div className="w-10 h-10 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col">
            {/* Header - Fixed to Top */}
            <header className="h-16 border-b border-[hsl(var(--border)/0.5)] glass sticky top-0 z-40 bg-[hsl(var(--background)/0.8)] backdrop-blur-xl">
                <div className="max-w-[1600px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                                <Video className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-xl font-bold text-[hsl(var(--foreground))] hidden md:block">
                                Record<span className="text-gradient">It</span>
                            </h1>
                        </Link>

                        {/* Global Search Bar */}
                        <div className="hidden lg:flex items-center relative w-[400px]">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                            <input
                                type="text"
                                placeholder="Search recordings, folders, and tags..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-2 rounded-xl bg-[hsl(var(--accent))] border-none text-sm focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)] transition-all placeholder:text-[hsl(var(--muted-foreground)/0.7)]"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl hover:bg-[hsl(var(--accent))] transition-colors text-[hsl(var(--muted-foreground))]"
                        >
                            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        </button>

                        <div className="h-8 w-px bg-[hsl(var(--border)/0.5)] mx-1" />

                        <div className="flex items-center gap-3 pl-1">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-[hsl(var(--foreground))] leading-none mb-1">{user?.displayName}</p>
                                <p className="text-[11px] text-[hsl(var(--muted-foreground))] uppercase tracking-tighter">Personal Plan</p>
                            </div>
                            <img
                                src={user?.photoURL || `https://api.dicebear.com/7.x/miniavs/svg?seed=${user?.displayName || 'User'}`}
                                alt={user?.displayName || 'User'}
                                className="w-9 h-9 rounded-full border border-[hsl(var(--border))] ring-4 ring-[hsl(var(--accent))]"
                            />
                        </div>

                        <button
                            className="p-2 ml-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] transition-colors"
                            onClick={handleLogout}
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1">
                {/* Sidebar */}
                <Sidebar />

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto bg-[hsl(var(--background))] p-4 sm:p-6 lg:p-8">
                    <div className="max-w-6xl mx-auto">
                        {/* Toolbar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">Library</h2>
                                <p className="text-sm text-[hsl(var(--muted-foreground))] font-medium">
                                    {loading ? 'Crunching numbers...' : `${filteredRecordings.length} total videos`}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center bg-[hsl(var(--accent))] p-1 rounded-xl">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[hsl(var(--background))] shadow-sm text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`}
                                    >
                                        <Grid className="w-4.5 h-4.5" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[hsl(var(--background))] shadow-sm text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`}
                                    >
                                        <List className="w-4.5 h-4.5" />
                                    </button>
                                </div>
                                <Link href="/record">
                                    <Button variant="default" className="rounded-xl shadow-lg shadow-[hsl(var(--primary)/0.2)]">
                                        <Plus className="w-4 h-4 mr-2" />
                                        New Video
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {loading && recordings.length === 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="aspect-video bg-[hsl(var(--accent))] rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : filteredRecordings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] rounded-[2.5rem] shadow-sm animate-fade-in-up">
                                <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/20 dark:to-indigo-900/20 rounded-3xl flex items-center justify-center mb-6">
                                    <Video className="w-10 h-10 text-[hsl(var(--primary))]" />
                                </div>
                                <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">Ready to record?</h3>
                                <p className="text-[hsl(var(--muted-foreground))] mb-8 text-center max-w-sm text-lg">
                                    Your personal library is empty. Click below to start your first session.
                                </p>
                                <Link href="/record">
                                    <Button variant="default" size="lg" className="rounded-2xl px-8 h-12 shadow-xl shadow-[hsl(var(--primary)/0.2)]">
                                        <Plus className="w-5 h-5 mr-2" />
                                        Create First Recording
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-3'}>
                                {filteredRecordings.map((recording, i) => (
                                    <div
                                        key={recording.id}
                                        onClick={() => setSelectedVideo(recording)}
                                        className={`group relative bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] rounded-[1.25rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[hsl(var(--primary)/0.1)] hover:-translate-y-1.5 cursor-pointer animate-fade-in-up ${viewMode === 'list' ? 'flex items-center h-24' : ''}`}
                                        style={{ animationDelay: `${i * 80}ms` }}
                                    >
                                        {/* Thumbnail Container */}
                                        <div className={`bg-gradient-to-br ${colorPresets[i % colorPresets.length]} relative overflow-hidden ${viewMode === 'list' ? 'w-48 h-full flex-shrink-0' : 'aspect-video'}`}>
                                            {/* Preview Placeholder */}
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover:bg-black/20 transition-all duration-500">
                                                <div className="w-11 h-11 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-all duration-500 shadow-xl">
                                                    <Play className="w-5 h-5 fill-current ml-0.5" />
                                                </div>
                                            </div>

                                            {/* Duration Tag */}
                                            <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-lg border border-white/10">
                                                {formatDuration(recording.duration)}
                                            </div>

                                            {/* Abstract Grid background for empty thumbs */}
                                            <div className="absolute inset-0 opacity-10 pointer-events-none p-4 overflow-hidden">
                                                <div className="grid grid-cols-4 gap-2 h-full">
                                                    <div className="bg-white rounded h-full" />
                                                    <div className="bg-white rounded h-2/3" />
                                                    <div className="bg-white rounded h-full" />
                                                    <div className="bg-white rounded h-3/4" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Info */}
                                        <div className={`p-4 flex flex-col justify-between flex-1`}>
                                            <div>
                                                <h3 className="font-bold text-[hsl(var(--foreground))] truncate group-hover:text-[hsl(var(--primary))] transition-colors leading-tight" title={recording.title}>
                                                    {recording.title}
                                                </h3>
                                                <p className="text-[11px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest mt-1 opacity-70">
                                                    {recording.createdAt instanceof Date
                                                        ? recording.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                        : 'Recent Recording'}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex -space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="w-5 h-5 rounded-full border-2 border-[hsl(var(--card))] bg-blue-500 text-[8px] flex items-center justify-center text-white font-bold">RA</div>
                                                    <div className="w-5 h-5 rounded-full border-2 border-[hsl(var(--card))] bg-gray-200 flex items-center justify-center text-[10px] text-gray-500">+</div>
                                                </div>

                                                <button
                                                    onClick={(e) => handleDelete(recording.id, e)}
                                                    className="p-1.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/0.05)] rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Video Player Modal */}
            {selectedVideo && (
                <VideoPlayer
                    recording={selectedVideo}
                    onClose={() => setSelectedVideo(null)}
                />
            )}
        </div>
    );
}
