'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { LogOut, Video, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';

export function DashboardHeader() {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    return (
        <header className="border-b border-[hsl(var(--border))] glass sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary))] flex items-center justify-center shadow-lg shadow-[hsl(var(--primary)/0.25)]">
                        <Video className="w-5 h-5 text-[hsl(var(--primary-foreground))]" />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gradient hidden sm:block">
                        Screen Recorder
                    </h1>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg hover:bg-[hsl(var(--accent))] transition-colors"
                        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    >
                        {theme === 'light' ? (
                            <Moon className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                        ) : (
                            <Sun className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                        )}
                    </button>

                    {/* User Profile */}
                    <div className="flex items-center gap-3">
                        {user?.photoURL && (
                            <img
                                src={user.photoURL}
                                alt={user.displayName || 'User'}
                                className="w-9 h-9 rounded-full border-2 border-[hsl(var(--primary))] ring-2 ring-[hsl(var(--primary)/0.15)]"
                            />
                        )}
                        <div className="hidden md:block">
                            <p className="text-sm font-medium text-[hsl(var(--foreground))]">{user?.displayName}</p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">{user?.email}</p>
                        </div>
                    </div>

                    {/* Sign Out */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSignOut}
                        className="flex items-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))]"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Logout</span>
                    </Button>
                </div>
            </div>
        </header>
    );
}
