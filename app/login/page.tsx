'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Video, ArrowLeft, CheckCircle, Zap, Shield, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleGoogleSignIn = () => {
        setLoading(true);
        // UI-only: simulate sign-in and navigate to dashboard
        setTimeout(() => {
            router.push('/dashboard');
        }, 800);
    };

    return (
        <div className="min-h-screen bg-[hsl(var(--background))] relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-[-10%] left-[40%] w-[500px] h-[500px] bg-[hsl(var(--primary)/0.06)] rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] right-[30%] w-[400px] h-[400px] bg-violet-500/[0.04] rounded-full blur-3xl" />
            </div>

            {/* Back to Home */}
            <div className="absolute top-6 left-6 z-10">
                <Link href="/">
                    <Button variant="ghost" size="sm" className="gap-2 text-[hsl(var(--muted-foreground))]">
                        <ArrowLeft className="w-4 h-4" />
                        Home
                    </Button>
                </Link>
            </div>

            <div className="flex min-h-screen items-center justify-center px-4 py-12">
                <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Side - Branding */}
                    <div className="hidden lg:block animate-fade-in-up">
                        <div className="space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                                    <Video className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Record<span className="text-gradient">It</span></h1>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Professional Screen Recording</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-4xl xl:text-5xl font-bold text-[hsl(var(--foreground))] leading-tight">
                                    Start Recording
                                    <span className="block text-gradient">in Seconds</span>
                                </h2>
                                <p className="text-lg text-[hsl(var(--muted-foreground))] leading-relaxed">
                                    Your screen recordings, securely stored and instantly shareable.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { icon: Zap, text: 'One-click recording', sub: 'No installs needed' },
                                    { icon: Shield, text: 'Secure cloud storage', sub: 'Saved to your Google Drive' },
                                    { icon: Star, text: 'Unlimited recordings', sub: 'Free forever, no limits' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center flex-shrink-0 group-hover:bg-[hsl(var(--primary)/0.15)] transition-colors">
                                            <item.icon className="w-5 h-5 text-[hsl(var(--primary))]" />
                                        </div>
                                        <div>
                                            <span className="font-semibold text-[hsl(var(--foreground))]">{item.text}</span>
                                            <p className="text-sm text-[hsl(var(--muted-foreground))]">{item.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Login Card */}
                    <div className="w-full max-w-md mx-auto animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                        <div className="relative">
                            <div className="absolute -inset-3 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 rounded-3xl blur-2xl animate-glow" />

                            <div className="relative bg-[hsl(var(--card))] rounded-2xl shadow-2xl border border-[hsl(var(--border))] p-8 md:p-10">
                                {/* Mobile Logo */}
                                <div className="lg:hidden flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
                                        <Video className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-2xl font-bold text-[hsl(var(--foreground))]">Record<span className="text-gradient">It</span></span>
                                </div>

                                <div className="text-center mb-8">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--foreground))] mb-2">
                                        Welcome Back
                                    </h2>
                                    <p className="text-[hsl(var(--muted-foreground))]">
                                        Sign in to access your recordings
                                    </p>
                                </div>

                                <div className="flex justify-center mb-8">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                        <Zap className="w-4 h-4 text-emerald-500" />
                                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                            Free Forever · No Credit Card
                                        </span>
                                    </div>
                                </div>

                                {/* Google Sign In Button */}
                                <button
                                    onClick={handleGoogleSignIn}
                                    disabled={loading}
                                    className="w-full group relative overflow-hidden bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] rounded-xl p-4 transition-all duration-300 shadow-sm hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="flex items-center justify-center gap-3">
                                        {loading ? (
                                            <div className="w-6 h-6 border-2 border-[hsl(var(--muted))] border-t-[hsl(var(--primary))] rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24">
                                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                </svg>
                                                <span className="text-[hsl(var(--foreground))] font-semibold text-lg">
                                                    Continue with Google
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </button>

                                <p className="mt-6 text-center text-xs text-[hsl(var(--muted-foreground))]">
                                    By continuing, you agree to our{' '}
                                    <a href="#" className="text-[hsl(var(--primary))] hover:underline">Terms</a>{' '}
                                    and{' '}
                                    <a href="#" className="text-[hsl(var(--primary))] hover:underline">Privacy Policy</a>
                                </p>

                                <div className="relative my-8">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-[hsl(var(--border))]" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))]">What you get</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {['Unlimited screen recordings', 'Auto upload to Google Drive', 'Instant shareable links', 'Webcam overlay support'].map((feature, i) => (
                                        <div key={i} className="flex items-center gap-2.5 text-sm">
                                            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                            <span className="text-[hsl(var(--muted-foreground))]">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
