'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Plus, Grid, List, Play, Check, Copy, Scissors, Trash2, ExternalLink, Moon, Sun, LogOut, Star, Share2, Menu, X, MoreVertical, Download, Edit2, Filter, FolderOpen, HelpCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { getUserRecordings, deleteRecording, updateRecording, getUserFolders, createFolder, deleteFolder, Folder } from '@/lib/firebase/firestore';
import { signOut } from '@/lib/firebase/auth';
import { Recording } from '@/types';

import { Sidebar, TabId } from '@/components/dashboard/Sidebar';
import { VideoPlayer } from '@/components/dashboard/VideoPlayer';
import { Modal } from '@/components/ui/Modal';
import { uploadVideo, getShareableLink } from '@/lib/drive/client';
import AdBanner from '@/components/AdBanner';

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
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<TabId>('library');
    const [folders, setFolders] = useState<Folder[]>([]);
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [isSharing, setIsSharing] = useState<string | null>(null);
    const [shareCopied, setShareCopied] = useState(false);

    // Modal State
    const [modalConfig, setModalConfig] = useState<{
        type: 'create' | 'delete-folder' | 'delete-recording' | 'upload';
        title: string;
        description?: string;
        confirmLabel?: string;
        showInput?: boolean;
        inputPlaceholder?: string;
        initialValue?: string;
        targetId?: string;
        targetRecording?: Recording;
    } | null>(null);
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const uploadAbortControllerRef = React.useRef<AbortController | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            fetchRecordings();
            fetchFolders();
        }
    }, [user, authLoading]);


    const fetchFolders = async () => {
        if (!user) return;
        try {
            const data = await getUserFolders(user.uid);
            setFolders(data);
        } catch (error) {
            console.error('Error fetching folders:', error);
        }
    };

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
        setModalConfig({
            type: 'delete-recording',
            title: 'Delete Recording',
            description: 'Are you sure you want to permanently delete this recording? This action cannot be undone.',
            confirmLabel: 'Delete',
            targetId: id
        });
    };

    const performDeleteRecording = async (id: string) => {
        try {
            setIsModalLoading(true);
            await deleteRecording(id);
            setRecordings(prev => prev.filter(r => r.id !== id));
            setModalConfig(null);
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete recording');
        } finally {
            setIsModalLoading(false);
        }
    };

    const handleStartRename = (recording: Recording, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(recording.id);
        setEditTitle(recording.title);
    };

    const handleSaveRename = async (id: string) => {
        if (!editTitle.trim()) {
            setEditingId(null);
            return;
        }

        try {
            await updateRecording(id, { title: editTitle.trim() });
            setRecordings(prev => prev.map(r => r.id === id ? { ...r, title: editTitle.trim() } : r));
            setEditingId(null);
        } catch (error) {
            console.error('Rename error:', error);
            alert('Failed to rename recording');
        }
    };

    const toggleStar = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const recording = recordings.find(r => r.id === id);
        if (!recording) return;

        try {
            const newValue = !recording.isStarred;
            await updateRecording(id, { isStarred: newValue });
            setRecordings(prev => prev.map(r => r.id === id ? { ...r, isStarred: newValue } : r));
        } catch (error) {
            console.error('Star toggle error:', error);
        }
    };

    const handleShare = async (recording: Recording, e: React.MouseEvent) => {
        e.stopPropagation();
        if (navigator.share) {
            try {
                await navigator.share({
                    title: recording.title,
                    text: 'Check out this screen recording!',
                    url: recording.videoUrl,
                });
            } catch (err) {
                console.error('Share error:', err);
                copyToClipboard(recording.videoUrl);
            }
        } else {
            copyToClipboard(recording.videoUrl);
        }
    };

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
    };

    const handleMoveToFolder = async (recordingId: string, folderId: string | null) => {
        try {
            await updateRecording(recordingId, { folderId });
            setRecordings(prev => prev.map(r => r.id === recordingId ? { ...r, folderId } : r));
            setMenuOpen(null);
        } catch (error) {
            console.error('Move to folder error:', error);
        }
    };

    const handleCreateFolder = async () => {
        if (!user) return;
        setModalConfig({
            type: 'create',
            title: 'New Folder',
            description: 'Enter a name for your new folder.',
            confirmLabel: 'Create Folder',
            showInput: true,
            inputPlaceholder: 'e.g. Project X',
        });
    };

    const performCreateFolder = async (name?: string) => {
        if (!user || !name?.trim()) return;
        try {
            setIsModalLoading(true);
            await createFolder(user.uid, name.trim());
            fetchFolders();
            setModalConfig(null);
        } catch (error) {
            console.error('Create folder error:', error);
            alert('Failed to create folder');
        } finally {
            setIsModalLoading(false);
        }
    };

    const handleDeleteFolder = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setModalConfig({
            type: 'delete-folder',
            title: 'Delete Folder',
            description: 'Are you sure you want to delete this folder? The videos inside will stay in your library.',
            confirmLabel: 'Delete',
            targetId: id
        });
    };

    const performDeleteFolder = async (id: string) => {
        try {
            setIsModalLoading(true);
            await deleteFolder(id);
            fetchFolders();
            setModalConfig(null);
        } catch (error) {
            console.error('Delete folder error:', error);
            alert('Failed to delete folder');
        } finally {
            setIsModalLoading(false);
        }
    };

    const filteredRecordings = recordings.filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;

        if (activeTab === 'starred') return r.isStarred;
        if (activeTab === 'folders' && selectedFolderId) {
            return r.folderId === selectedFolderId;
        }

        return true;
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        // Trigger name prompt
        setModalConfig({
            type: 'upload',
            title: 'Upload Video',
            description: 'Provide a title for your video upload.',
            confirmLabel: 'Start Upload',
            showInput: true,
            initialValue: file.name.replace(/\.[^/.]+$/, ""), // Strip extension
            targetRecording: { id: 'temp', file } as any // Store file object
        });

        // Reset input
        e.target.value = '';
    };

    const performUpload = async (title?: string) => {
        const file = (modalConfig?.targetRecording as any)?.file as File;
        if (!user || !file || !title?.trim()) return;

        try {
            setIsModalLoading(true);

            // 1. Upload to Drive with abort support
            uploadAbortControllerRef.current = new AbortController();
            const driveData = await uploadVideo(file, title.trim(), (progress) => {
                setUploadProgress(progress.percentage);
            }, uploadAbortControllerRef.current.signal);

            // 2. Save to Firestore
            const videoUrl = await getShareableLink(driveData.fileId);

            const { saveRecording } = await import('@/lib/firebase/firestore');
            const docId = await saveRecording(
                user.uid,
                title.trim(),
                videoUrl,
                driveData.fileId,
                0 // Duration unknown initially
            );

            if (selectedFolderId) {
                await updateRecording(docId, { folderId: selectedFolderId });
            }

            fetchRecordings();
            setModalConfig(null);
            setUploadProgress(0);
            uploadAbortControllerRef.current = null;
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log('Upload aborted by user');
                return;
            }
            console.error('Upload error details:', error);
            // Try to extract a useful message
            const errorMsg = error.message ||
                (error.result?.error?.message) ||
                (typeof error === 'object' ? JSON.stringify(error) : String(error));

            alert('Failed to upload video: ' + errorMsg);
        } finally {
            setIsModalLoading(false);
            uploadAbortControllerRef.current = null;
        }
    };

    // Sort for recent if needed
    const displayedRecordings = activeTab === 'recent'
        ? [...filteredRecordings].sort((a, b) => {
            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt instanceof Date ? a.createdAt.getTime() : 0);
            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt instanceof Date ? b.createdAt.getTime() : 0);
            return timeB - timeA;
        }).slice(0, 5)
        : filteredRecordings;

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
                    <div className="flex items-center gap-4 sm:gap-8">
                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                            className="p-2 -ml-2 rounded-xl hover:bg-[hsl(var(--accent))] lg:hidden transition-colors text-[hsl(var(--muted-foreground))]"
                        >
                            {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>

                        <Link href="/" className="flex items-center gap-3">
                            <img src="/logo.png" alt="Recordly Logo" className="w-12 h-12 object-contain transition-transform hover:scale-110" />
                            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] hidden md:block tracking-tight">
                                Record<span className="text-gradient">ly</span>
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
                        {/* Extension Prompt - Mobile/Small Desktop Hidden */}
                        <div className="hidden xl:flex items-center gap-3">
                            <img src="/logo.png" className="w-8 h-8 object-contain" alt="Recordly" />
                            <span className="text-[11px] font-bold text-[hsl(var(--primary))] uppercase tracking-tight">Recordly Extension:</span>
                            <a href="#" className="text-[11px] font-black text-[hsl(var(--foreground))] hover:underline decoration-[hsl(var(--primary))] underline-offset-2">Install for 1-click recording →</a>
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
                <Sidebar
                    activeTab={activeTab}
                    onTabChange={(tab) => {
                        setActiveTab(tab);
                        setMobileSidebarOpen(false);
                    }}
                    onUpload={() => {
                        document.getElementById('video-upload')?.click();
                        setMobileSidebarOpen(false);
                    }}
                    isOpen={mobileSidebarOpen}
                    onClose={() => setMobileSidebarOpen(false)}
                />

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto bg-[hsl(var(--background))] p-4 sm:p-6 lg:p-8">
                    <div className="max-w-6xl mx-auto">
                        {/* Toolbar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))] capitalize">{activeTab}</h2>
                                <p className="text-sm text-[hsl(var(--muted-foreground))] font-medium">
                                    {(activeTab === 'library' || activeTab === 'recent' || activeTab === 'starred' || activeTab === 'folders')
                                        ? (loading ? 'Crunching numbers...' : `${displayedRecordings.length} videos`)
                                        : `Manage your ${activeTab}`}
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
                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        id="video-upload"
                                        accept="video/*"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                    <Link href="/record">
                                        <Button variant="default" className="rounded-xl shadow-lg shadow-[hsl(var(--primary)/0.2)]">
                                            <Plus className="w-4 h-4 mr-2" />
                                            New Video
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* ──── Dynamic Content Based on activeTab ──── */}
                        {(activeTab === 'library' || activeTab === 'recent' || activeTab === 'starred') ? (
                            <>
                                {/* AdSense Banner */}
                                <AdBanner
                                    dataAdSlot="1234567890"
                                    className="max-w-6xl mx-auto rounded-2xl overflow-hidden bg-[hsl(var(--accent)/0.3)] border border-[hsl(var(--border)/0.5)]"
                                />

                                {loading && recordings.length === 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="aspect-video bg-[hsl(var(--accent))] rounded-2xl animate-pulse" />
                                        ))}
                                    </div>
                                ) : displayedRecordings.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-24 bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] rounded-[2.5rem] shadow-sm animate-fade-in-up">
                                        <img src="/logo.png" alt="Recordly" className="w-32 h-32 object-contain mb-8 transition-all hover:rotate-3" />
                                        <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">
                                            {activeTab === 'starred' ? 'No starred videos' : 'Ready to record?'}
                                        </h3>
                                        <p className="text-[hsl(var(--muted-foreground))] mb-8 text-center max-w-sm text-lg">
                                            {activeTab === 'starred' ? "Items you star will appear here for quick access." : 'Your personal library is empty. Click below to start your first session.'}
                                        </p>
                                        <Link href="/record">
                                            <Button variant="default" size="lg" className="rounded-2xl px-8 h-12 shadow-xl shadow-[hsl(var(--primary)/0.2)]">
                                                <Plus className="w-5 h-5 mr-2" />
                                                Create Recording
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-3'}>
                                        {displayedRecordings.map((recording, i) => (
                                            <div
                                                key={recording.id}
                                                onClick={() => setSelectedVideo(recording)}
                                                className={`group relative bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] rounded-[1.25rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[hsl(var(--primary)/0.1)] hover:-translate-y-1.5 cursor-pointer animate-fade-in-up ${viewMode === 'list' ? 'flex items-center h-24' : ''}`}
                                                style={{ animationDelay: `${i * 80}ms` }}
                                            >
                                                {/* Thumbnail Container */}
                                                <div className={`bg-gradient-to-br ${colorPresets[i % colorPresets.length]} relative overflow-hidden ${viewMode === 'list' ? 'w-48 h-full flex-shrink-0' : 'aspect-video'}`}>
                                                    {/* Background Decorative Patterns */}
                                                    {!recording.thumbnailUrl && (
                                                        <>
                                                            {/* Noise Texture */}
                                                            <div className="absolute inset-0 opacity-[0.2] mix-blend-overlay pointer-events-none">
                                                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
                                                            </div>

                                                            {/* Dots Pattern */}
                                                            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

                                                            {/* Glassy Glow */}
                                                            <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-white/20 blur-[80px] rounded-full pointer-events-none" />

                                                            {/* Subtle Watermark Logo */}
                                                            <div className="absolute right-4 bottom-4 opacity-[0.08] transform rotate-[-15deg] pointer-events-none group-hover:scale-110 group-hover:rotate-0 transition-transform duration-700">
                                                                <img src="/logo.png" className="w-24 h-24 object-contain filter grayscale invert" alt="" />
                                                            </div>
                                                        </>
                                                    )}

                                                    {recording.thumbnailUrl ? (
                                                        <img src={recording.thumbnailUrl} alt={recording.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-all duration-500">
                                                            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center text-white scale-90 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-[0_0_40px_rgba(0,0,0,0.1)]">
                                                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                                                                    <Play className="w-6 h-6 fill-current ml-1" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Duration Tag - Premium Pill */}
                                                    <div className="absolute bottom-3 right-3 bg-white/10 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-full border border-white/20 shadow-xl transition-all group-hover:bg-white/20 group-hover:translate-y-[-2px]">
                                                        {formatDuration(recording.duration)}
                                                    </div>
                                                </div>

                                                {/* Card Info */}
                                                <div className={`p-4 flex flex-col justify-between flex-1`}>
                                                    <div>
                                                        {editingId === recording.id ? (
                                                            <input
                                                                type="text"
                                                                value={editTitle}
                                                                onChange={(e) => setEditTitle(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') handleSaveRename(recording.id);
                                                                    if (e.key === 'Escape') setEditingId(null);
                                                                }}
                                                                onBlur={() => handleSaveRename(recording.id)}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="w-full px-2 py-1 rounded border border-violet-500 bg-[hsl(var(--background))] text-sm font-bold focus:outline-none"
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <h3 className="font-bold text-[hsl(var(--foreground))] truncate group-hover:text-[hsl(var(--primary))] transition-colors leading-tight" title={recording.title}>
                                                                {recording.title}
                                                            </h3>
                                                        )}
                                                        <p className="text-[11px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest mt-1 opacity-70">
                                                            {recording.createdAt?.toDate
                                                                ? recording.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                                : (recording.createdAt instanceof Date
                                                                    ? recording.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                                    : 'Recent Recording')}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center justify-between mt-4">
                                                        <div className="flex -space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div className="w-5 h-5 rounded-full border-2 border-[hsl(var(--card))] bg-blue-500 text-[8px] flex items-center justify-center text-white font-bold">RA</div>
                                                        </div>

                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={(e) => toggleStar(recording.id, e)}
                                                                className={cn(
                                                                    "p-1.5 rounded-lg transition-all",
                                                                    recording.isStarred
                                                                        ? "text-amber-500 bg-amber-500/10 opacity-100"
                                                                        : "text-[hsl(var(--muted-foreground))] hover:text-amber-500 hover:bg-amber-500/05"
                                                                )}
                                                                title={recording.isStarred ? "Unstar" : "Star"}
                                                            >
                                                                <Star className={cn("w-4 h-4", recording.isStarred && "fill-current")} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleShare(recording, e)}
                                                                className="p-1.5 text-[hsl(var(--muted-foreground))] hover:text-emerald-500 hover:bg-emerald-500/05 rounded-lg transition-all relative"
                                                                title="Share"
                                                            >
                                                                {shareCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); copyToClipboard(recording.videoUrl); }}
                                                                className="p-1.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.05)] rounded-lg transition-all"
                                                                title="Copy Link"
                                                            >
                                                                <Copy className="w-4 h-4" />
                                                            </button>
                                                            <Link
                                                                href={`/edit?id=${recording.id}`}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="p-1.5 text-[hsl(var(--muted-foreground))] hover:text-sky-500 hover:bg-sky-500/05 rounded-lg transition-all"
                                                                title="Edit Content"
                                                            >
                                                                <Scissors className="w-4 h-4" />
                                                            </Link>
                                                            <button
                                                                onClick={(e) => handleStartRename(recording, e)}
                                                                className="p-1.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.05)] rounded-lg transition-all"
                                                                title="Rename"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleDelete(recording.id, e)}
                                                                className="p-1.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/0.05)] rounded-lg transition-all"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>

                                                            {/* Simple Folder Move Option */}
                                                            <div className="relative">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === recording.id ? null : recording.id); }}
                                                                    className="p-1.5 text-[hsl(var(--muted-foreground))] hover:text-violet-500 hover:bg-violet-500/05 rounded-lg transition-all"
                                                                    title="Move to folder"
                                                                >
                                                                    <FolderOpen className="w-4 h-4" />
                                                                </button>
                                                                {menuOpen === recording.id && (
                                                                    <div className="absolute right-0 bottom-full mb-2 w-48 bg-[hsl(var(--popover))] rounded-xl shadow-xl border border-[hsl(var(--border))] z-[60] overflow-hidden animate-fade-in-up">
                                                                        <div className="p-2 text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest border-b border-[hsl(var(--border)/0.5)]">Move to Folder</div>
                                                                        <button
                                                                            onClick={() => handleMoveToFolder(recording.id, null)}
                                                                            className="w-full px-4 py-2 text-left hover:bg-[hsl(var(--accent))] text-xs font-medium"
                                                                        >
                                                                            Root Library
                                                                        </button>
                                                                        {folders.map(f => (
                                                                            <button
                                                                                key={f.id}
                                                                                onClick={() => handleMoveToFolder(recording.id, f.id)}
                                                                                className="w-full px-4 py-2 text-left hover:bg-[hsl(var(--accent))] text-xs font-medium truncate"
                                                                            >
                                                                                {f.name}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : activeTab === 'folders' ? (
                            <div className="space-y-6">
                                {selectedFolderId ? (
                                    <>
                                        <div className="flex items-center gap-4 mb-6">
                                            <button
                                                onClick={() => setSelectedFolderId(null)}
                                                className="p-2 hover:bg-[hsl(var(--accent))] rounded-xl transition-all"
                                            >
                                                <ArrowLeft className="w-5 h-5" />
                                            </button>
                                            <div>
                                                <h3 className="text-xl font-bold">{folders.find(f => f.id === selectedFolderId)?.name}</h3>
                                                <p className="text-sm text-[hsl(var(--muted-foreground))]">{displayedRecordings.length} videos in this folder</p>
                                            </div>
                                        </div>
                                        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-3'}>
                                            {displayedRecordings.map((recording, i) => (
                                                <div
                                                    key={recording.id}
                                                    onClick={() => setSelectedVideo(recording)}
                                                    className={`group relative bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] rounded-[1.25rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[hsl(var(--primary)/0.1)] hover:-translate-y-1.5 cursor-pointer animate-fade-in-up ${viewMode === 'list' ? 'flex items-center h-24' : ''}`}
                                                    style={{ animationDelay: `${i * 80}ms` }}
                                                >
                                                    {/* Same card UI as Library for consistency */}
                                                    <div className={`bg-gradient-to-br ${colorPresets[i % colorPresets.length]} relative overflow-hidden ${viewMode === 'list' ? 'w-48 h-full flex-shrink-0' : 'aspect-video'}`}>
                                                        {!recording.thumbnailUrl && (
                                                            <>
                                                                <div className="absolute inset-0 opacity-[0.2] mix-blend-overlay pointer-events-none">
                                                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
                                                                </div>
                                                                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                                                                <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-white/20 blur-[80px] rounded-full pointer-events-none" />
                                                                <div className="absolute right-4 bottom-4 opacity-[0.08] transform rotate-[-15deg] pointer-events-none group-hover:scale-110 group-hover:rotate-0 transition-transform duration-700">
                                                                    <img src="/logo.png" className="w-24 h-24 object-contain filter grayscale invert" alt="" />
                                                                </div>
                                                            </>
                                                        )}

                                                        {recording.thumbnailUrl ? (
                                                            <img src={recording.thumbnailUrl} alt={recording.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                                        ) : (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-all duration-500">
                                                                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center text-white scale-90 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-[0_0_40px_rgba(0,0,0,0.1)]">
                                                                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white">
                                                                        <Play className="w-6 h-6 fill-current ml-1" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="absolute bottom-3 right-3 bg-white/10 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-full border border-white/20 shadow-xl transition-all group-hover:bg-white/20 group-hover:translate-y-[-2px]">
                                                            {formatDuration(recording.duration)}
                                                        </div>
                                                    </div>
                                                    <div className="p-4 flex flex-col justify-between flex-1">
                                                        <h3 className="font-bold text-[hsl(var(--foreground))] truncate group-hover:text-[hsl(var(--primary))] transition-colors leading-tight">{recording.title}</h3>
                                                        <div className="flex items-center justify-between mt-4">
                                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={(e) => toggleStar(recording.id, e)} className="p-1.5 rounded-lg transition-all text-[hsl(var(--muted-foreground))] hover:text-amber-500 hover:bg-amber-500/05"><Star className={cn("w-4 h-4", recording.isStarred && "fill-current")} /></button>
                                                                <button onClick={(e) => handleShare(recording, e)} className="p-1.5 text-[hsl(var(--muted-foreground))] hover:text-emerald-500 hover:bg-emerald-500/05 rounded-lg transition-all"><Share2 className="w-4 h-4" /></button>
                                                                <button onClick={(e) => handleDelete(recording.id, e)} className="p-1.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/0.05)] rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {displayedRecordings.length === 0 && (
                                                <div className="col-span-full py-20 text-center bg-[hsl(var(--accent))] rounded-3xl border border-dashed border-[hsl(var(--border)/0.5)]">
                                                    <p className="text-sm font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest">Folder is empty</p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
                                        <button
                                            onClick={handleCreateFolder}
                                            className="aspect-[4/3] bg-[hsl(var(--card))] border-2 border-dashed border-[hsl(var(--border))] rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.05)] transition-all group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-[hsl(var(--accent))] flex items-center justify-center group-hover:bg-[hsl(var(--primary)/0.1)] transition-all">
                                                <Plus className="w-5 h-5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))]" />
                                            </div>
                                            <span className="text-sm font-bold text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))]">New Folder</span>
                                        </button>

                                        {folders.map((folder) => (
                                            <div
                                                key={folder.id}
                                                onClick={() => setSelectedFolderId(folder.id)}
                                                className="aspect-[4/3] bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] rounded-2xl p-5 flex flex-col justify-between hover:shadow-lg transition-all group cursor-pointer relative"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <FolderOpen className="w-8 h-8 text-amber-500" />
                                                    <button
                                                        onClick={(e) => handleDeleteFolder(folder.id, e)}
                                                        className="p-1 hover:bg-red-500/10 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm truncate">{folder.name}</h4>
                                                    <p className="text-[10px] text-[hsl(var(--muted-foreground))] font-bold uppercase tracking-widest mt-0.5">
                                                        {recordings.filter(r => r.folderId === folder.id).length} Videos
                                                    </p>
                                                </div>
                                            </div>
                                        ))}

                                    </div>
                                )}
                            </div>
                        ) : activeTab === 'settings' ? (
                            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] rounded-[2.5rem] p-8 max-w-2xl animate-fade-in">
                                <h3 className="text-xl font-bold mb-6">Account Settings</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-[hsl(var(--accent))] rounded-2xl">
                                        <div>
                                            <p className="font-bold text-sm">Email Notifications</p>
                                            <p className="text-xs text-[hsl(var(--muted-foreground))]">Get notified when someone views your video</p>
                                        </div>
                                        <div className="w-10 h-5 bg-violet-500 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" /></div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-[hsl(var(--accent))] rounded-2xl">
                                        <div>
                                            <p className="font-bold text-sm">Public Profile</p>
                                            <p className="text-xs text-[hsl(var(--muted-foreground))]">Allow others to see your public library</p>
                                        </div>
                                        <div className="w-10 h-5 bg-[hsl(var(--muted))] rounded-full relative cursor-pointer"><div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full" /></div>
                                    </div>
                                    <Button variant="default" className="w-full h-12 rounded-xl mt-4">Save Preferences</Button>
                                </div>
                            </div>
                        ) : activeTab === 'support' ? (
                            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] rounded-[2.5rem] p-8 text-center max-w-md mx-auto animate-fade-in">
                                <div className="w-20 h-20 bg-violet-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <HelpCircle className="w-10 h-10 text-violet-500" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Need Help?</h3>
                                <p className="text-[hsl(var(--muted-foreground))] mb-8 text-lg">Our team is here to help you get the most out of Recordly.</p>
                                <Button variant="default" className="w-full h-12 rounded-xl">Contact Support</Button>
                            </div>
                        ) : null}
                    </div>
                </main>
            </div>

            {/* Video Player Modal */}
            {
                selectedVideo && (
                    <VideoPlayer
                        recording={selectedVideo}
                        onClose={() => setSelectedVideo(null)}
                    />
                )
            }

            {/* Custom UI Modal */}
            {
                modalConfig && (
                    <Modal
                        isOpen={!!modalConfig}
                        onClose={() => {
                            if (isModalLoading && uploadAbortControllerRef.current) {
                                uploadAbortControllerRef.current.abort();
                            }
                            setModalConfig(null);
                        }}
                        title={modalConfig.title}
                        description={modalConfig.description}
                        confirmLabel={modalConfig.confirmLabel}
                        showInput={modalConfig.showInput}
                        inputPlaceholder={modalConfig.inputPlaceholder}
                        initialInputValue={modalConfig.initialValue}
                        isLoading={isModalLoading}
                        type={modalConfig.type.startsWith('delete') ? 'destructive' : 'primary'}
                        onConfirm={(value) => {
                            if (modalConfig.type === 'delete-recording' && modalConfig.targetId) {
                                performDeleteRecording(modalConfig.targetId);
                            } else if (modalConfig.type === 'delete-folder' && modalConfig.targetId) {
                                performDeleteFolder(modalConfig.targetId);
                            } else if (modalConfig.type === 'create') {
                                performCreateFolder(value);
                            } else if (modalConfig.type === 'upload') {
                                performUpload(value);
                            }
                        }}
                    >
                        {modalConfig.type === 'upload' && isModalLoading && (
                            <div className="mt-4">
                                <div className="flex justify-between text-xs mb-1 font-bold">
                                    <span>Uploading to Drive...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-[hsl(var(--accent))] h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-[hsl(var(--primary))] h-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </Modal>
                )
            }
        </div >
    );
}
