'use client';

import Link from 'next/link';
import { Video, Play, ArrowRight, Sparkles, Shield, Zap, Globe, MonitorPlay, Share2, Cloud, CheckCircle, Menu, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AdBanner from '@/components/AdBanner';

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  'mainEntity': [
    {
      '@type': 'Question',
      'name': 'Is Recordly really a free screen recorder?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'Yes! Recordly offers unlimited screen recording for free. You can capture your screen, webcam, and audio without any hidden costs.'
      }
    },
    {
      '@type': 'Question',
      'name': 'How do I share my screen recordings?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'Once you finish recording your screen, Recordly automatically generates a shareable link. You can paste this link anywhere — Slack, email, or Jira.'
      }
    },
    {
      '@type': 'Question',
      'name': 'Do I need to download any software?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'No. Recordly is a 100% browser-based screen recording tool. It works directly in Chrome, Edge, and Safari without any installations.'
      }
    },
    {
      '@type': 'Question',
      'name': 'Do you have a Chrome extension?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'Yes, Recordly has a Chrome extension that allows you to start recording any tab with just one click.'
      }
    }
  ]
};

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  const features = [
    {
      icon: MonitorPlay,
      title: 'Crystal Clear Recording',
      desc: 'Capture your entire screen, a specific window, or a browser tab in stunning HD quality.',
      gradient: 'from-violet-500 to-purple-600',
    },
    {
      icon: Cloud,
      title: 'Auto Cloud Upload',
      desc: 'Your recordings are automatically saved to Google Drive — access them from anywhere.',
      gradient: 'from-sky-500 to-blue-600',
    },
    {
      icon: Share2,
      title: 'One-Click Sharing',
      desc: 'Get a shareable link instantly. No downloads needed for your viewers.',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      desc: 'Start recording in under 3 seconds. No lag, no bloat, just speed.',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      icon: Shield,
      title: 'Private & Secure',
      desc: 'Files stored in YOUR Google Drive. Full control over who sees your content.',
      gradient: 'from-rose-500 to-pink-600',
    },
    {
      icon: Globe,
      title: 'Works Everywhere',
      desc: 'Browser-based — no downloads required. Works on Chrome, Edge, and more.',
      gradient: 'from-indigo-500 to-violet-600',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(var(--background))] overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-[hsl(var(--border)/0.5)] glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <img src="/logo.png" alt="Recordly Logo" className="w-12 h-12 object-contain group-hover:scale-110 transition-transform" />
              <span className="text-2xl font-black tracking-tight text-[hsl(var(--foreground))]">
                Record<span className="text-gradient">ly</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]">
                Features
              </Link>
              <Link href="/pricing" className="text-sm font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]">
                Pricing
              </Link>
              <Link href="#how-it-works" className="text-sm font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]">
                How It Works
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link href="/login" className="hidden sm:inline-block text-sm font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]">
                Sign In
              </Link>
              <Link href="/login">
                <Button variant="default" size="sm" className="rounded-full px-5 shadow-md shadow-[hsl(var(--primary)/0.25)] hover:shadow-lg transition-all">
                  Get Started Free
                </Button>
              </Link>
              <button
                className="md:hidden p-2 rounded-lg hover:bg-[hsl(var(--accent))] transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-[hsl(var(--border))] animate-fade-in-up">
              <div className="flex flex-col gap-1">
                {[
                  { label: 'Features', href: '#features' },
                  { label: 'Pricing', href: '/pricing' },
                  { label: 'How It Works', href: '#how-it-works' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] py-3 px-4 rounded-lg hover:bg-[hsl(var(--accent))] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-2 px-4">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full justify-center">Sign In</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-1">
        {/* ──────────── Hero Section ──────────── */}
        <section className="relative overflow-hidden pt-20 pb-16 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-32">
          {/* Background effects */}
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[1000px] h-[800px] bg-[radial-gradient(ellipse,hsl(var(--primary)/0.15),transparent_70%)] opacity-70" />
            <div className="absolute top-[20%] left-[-10%] w-96 h-96 bg-violet-500/[0.1] rounded-full blur-3xl" />
            <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-sky-500/[0.1] rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-2 lg:gap-24 items-center">
              {/* Left Content */}
              <div className="flex flex-col gap-8 animate-fade-in-up text-center lg:text-left z-10">
                <div className="inline-flex items-center rounded-full border border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.08)] px-4 py-1.5 text-sm font-medium text-[hsl(var(--primary))] w-fit mx-auto lg:mx-0 shadow-sm backdrop-blur-sm">
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  Free forever · No credit card required
                </div>

                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[hsl(var(--foreground))] leading-[1.1]">
                  Best Free Online <br />
                  <span className="text-gradient">Screen Recorder.</span>
                </h1>

                <p className="max-w-[580px] text-lg sm:text-xl text-[hsl(var(--muted-foreground))] leading-relaxed mx-auto lg:mx-0">
                  The #1 free Loom alternative for fast-moving teams. Record your screen in HD with NO download required. Share professional video messages instantly with one-click cloud upload.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center lg:justify-start">
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full rounded-full text-base h-14 px-8 shadow-xl shadow-[hsl(var(--primary)/0.25)] hover:shadow-2xl hover:shadow-[hsl(var(--primary)/0.35)] transition-all hover:-translate-y-1">
                      Start Recording Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="#demo" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full rounded-full text-base h-14 px-8 border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]">
                      <Play className="mr-2 h-4 w-4 fill-current" />
                      Watch Demo
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center gap-6 text-sm font-medium text-[hsl(var(--muted-foreground))] pt-4 justify-center lg:justify-start">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`w-8 h-8 rounded-full border-2 border-[hsl(var(--background))] bg-gray-200`} style={{ backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 10})`, backgroundSize: 'cover' }} />
                      ))}
                    </div>
                    <div className="flex flex-col text-xs text-[hsl(var(--foreground))]">
                      <span>10k+ Users</span>
                      <div className="flex text-yellow-500">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Content - Modern Video Player UI */}
              <div className="relative mx-auto w-full max-w-[600px] lg:max-w-none animate-float" style={{ animationDelay: '300ms' }}>
                <div className="relative rounded-2xl border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card))] shadow-2xl overflow-hidden ring-1 ring-[hsl(var(--border))]">
                  {/* Browser Chrome */}
                  <div className="flex items-center gap-4 px-5 py-3.5 bg-[hsl(var(--muted)/0.4)] border-b border-[hsl(var(--border)/0.5)] backdrop-blur-md">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E]" />
                      <div className="w-3 h-3 rounded-full bg-[#FEBC2E] border border-[#D89E24]" />
                      <div className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29]" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="h-7 w-full max-w-sm bg-[hsl(var(--background)/0.5)] rounded-lg flex items-center justify-center border border-[hsl(var(--border)/0.5)]">
                        <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                          <Shield className="w-3 h-3" />
                          <span>recordly.dev/demo/v/8s9d7f</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-20 h-2 rounded-full bg-[hsl(var(--border))]" />
                    </div>
                  </div>

                  {/* Video Content Placeholder */}
                  <div className="aspect-[16/10] bg-gradient-to-br from-violet-900/5 via-[hsl(var(--background))] to-indigo-900/5 relative flex items-center justify-center group cursor-pointer overflow-hidden">
                    {/* Abstract UI Background */}
                    <div className="absolute inset-0 p-8 grid grid-cols-12 gap-4 opacity-40 mix-blend-multiply dark:mix-blend-screen">
                      <div className="col-span-3 bg-[hsl(var(--primary)/0.1)] rounded-xl h-full" />
                      <div className="col-span-9 flex flex-col gap-4">
                        <div className="h-16 bg-[hsl(var(--primary)/0.1)] rounded-xl w-full" />
                        <div className="flex-1 bg-[hsl(var(--primary)/0.05)] rounded-xl w-full grid grid-cols-2 gap-4 p-4">
                          <div className="bg-[hsl(var(--background))] rounded-lg shadow-sm" />
                          <div className="bg-[hsl(var(--background))] rounded-lg shadow-sm" />
                          <div className="bg-[hsl(var(--background))] rounded-lg shadow-sm" />
                          <div className="bg-[hsl(var(--background))] rounded-lg shadow-sm" />
                        </div>
                      </div>
                    </div>

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors flex items-center justify-center z-10">
                      <div className="w-20 h-20 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center shadow-lg shadow-[hsl(var(--primary)/0.4)] group-hover:scale-110 transition-all duration-300">
                        <Play className="w-8 h-8 text-white fill-current ml-1" />
                      </div>
                    </div>

                    {/* Active Recording State UI */}
                    <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-20 shadow-lg">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-sm font-mono font-medium text-white">00:42</span>
                    </div>

                    {/* Webcam Bubble */}
                    <div className="absolute bottom-6 right-6 w-24 h-24 rounded-full border-4 border-white shadow-2xl z-20 overflow-hidden bg-gray-900">
                      <img src="https://i.pravatar.cc/150?img=12" alt="Webcam" className="w-full h-full object-cover" />
                    </div>

                    {/* Cursor Graphic */}
                    <div className="absolute top-1/3 right-1/4 animate-float" style={{ animationDuration: '4s' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xl text-[hsl(var(--foreground))]">
                        <path d="M5.5 3.5L11.5 19.5L14.5 12.5L21.5 9.5L5.5 3.5Z" fill="white" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Floating Success Toast */}
                <div className="absolute -bottom-6 -left-6 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] shadow-2xl p-4 animate-fade-in-up hidden md:flex items-center gap-4 z-20 hover:scale-105 transition-transform cursor-default" style={{ animationDelay: '800ms' }}>
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[hsl(var(--foreground))]">Link Copied!</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Ready to share instantly</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────── Updated Trusted By (SVG Logos) ──────────── */}
        <section className="border-y border-[hsl(var(--border)/0.5)] bg-[hsl(var(--muted)/0.3)] py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="mb-8 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-[0.2em]">
              Trusted by fast-moving teams
            </p>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Google */}
              <svg className="h-7 sm:h-8 w-auto text-[hsl(var(--foreground))]" viewBox="0 0 100 32" fill="currentColor"><path d="M16.3 14v4.4h6.3c-.3 1.9-2.2 5.6-6.3 5.6-3.8 0-6.9-3.1-6.9-6.9s3.1-6.9 6.9-6.9c2.2 0 3.6.9 4.5 1.7l3.5-3.5C22 6.3 19.4 5 16.3 5 10.2 5 5.3 9.9 5.3 16s4.9 11 11 11c6.4 0 10.6-4.5 10.6-10.8 0-.7-.1-1.3-.2-1.8h-10.4zm16.9-4.2c-4.6 0-8.2 3.6-8.2 8.2s3.6 8.2 8.2 8.2 8.2-3.6 8.2-8.2-3.7-8.2-8.2-8.2zm0 13.5c-2.5 0-4.7-2.1-4.7-5.3s2.1-5.3 4.7-5.3 4.7 2.1 4.7 5.3-2.1 5.3-4.7 5.3zm16.8-13.5c-4.6 0-8.2 3.6-8.2 8.2s3.6 8.2 8.2 8.2 8.2-3.6 8.2-8.2-3.7-8.2-8.2-8.2zm0 13.5c-2.5 0-4.7-2.1-4.7-5.3s2.1-5.3 4.7-5.3 4.7 2.1 4.7 5.3-2.2 5.3-4.7 5.3zm15.7-9.5v-3.7h-3.6v13H69v-13h-3.2zm-6.6 9.5c0 1.8 1.4 3.2 3.2 3.2s3.2-1.4 3.2-3.2V5.3h-6.4v14zM86.7 9.8c-4.3 0-7.8 3.5-7.8 8.0 0 4.6 3.6 8.0 8.0 8.0 4.1 0 7.3-3.0 7.3-7.7V5.3h-3.5v12.5c0 2.2-1.7 4.0-3.8 4.0 -2.3 0-4.2-1.9-4.2-4.2 0-2.3 1.9-4.2 4.2-4.2 1.3 0 2.4.6 3.1 1.6l2.6-2.6c-1.4-1.6-3.4-2.6-5.9-2.6z" /></svg>
              {/* Microsoft */}
              <svg className="h-7 sm:h-8 w-auto text-[hsl(var(--foreground))]" viewBox="0 0 130 30" fill="currentColor"><path d="M6.2 6.2h12.5v12.5H6.2V6.2zm18.8 0h12.5v12.5H25V6.2zM6.2 25h12.5v12.5H6.2V25zm18.8 0h12.5v12.5H25V25zm25-18.8h5v18.8h-5V6.2zm10 0h5v18.8h-5V6.2zm8.8 0h5.3l3.3 12.3 3.3-12.3h5.3v18.8h-4.3V12l-3.3 13h-2.1l-3.3-13v14.2H68.8V6.2zm23.8 0h11.3v3.8H96.3v3.8h5.3v3.8h-5.3v3.8h6.3v3.8H92.6V6.2zm17.5 0h11.3v3.8H113.8v3.8h5.3v3.8h-5.3v3.8h6.3v3.8h-10v-19z" /></svg>
              {/* Spotify */}
              <svg className="h-7 sm:h-8 w-auto text-[hsl(var(--foreground))]" viewBox="0 0 100 30" fill="currentColor"><path d="M15 0C6.7 0 0 6.7 0 15s6.7 15 15 15 15-6.7 15-15S23.3 0 15 0zm6.9 21.6c-.3.4-.9.6-1.4.3-3.7-2.3-8.4-2.8-13.9-1.5-.6.1-1.1-.3-1.2-.8-.1-.6.3-1.1.8-1.2 6.1-1.4 11.3-.8 15.4 1.7.4.2.6.8.3 1.5zm1.9-4.8c-.4.6-1.1.8-1.7.4-4.2-2.6-10.7-3.3-15.7-1.8-.7.2-1.4-.2-1.6-.8-.2-.7.2-1.4.8-1.6 5.8-1.7 13-1 17.8 2 .6.4.8 1.1.4 1.8zm.1-5c-5.1-3-13.4-3.3-18.3-1.8-.8.2-1.6-.2-1.8-1-.2-.8.2-1.6 1-1.8 5.6-1.7 14.8-1.3 20.7 2.2.7.4 1 1.3.6 2s-1.3 1-2 .4zM55.5 10.4h3.6v12.5h-3.6V10.4zm7.2 0h3.6v12.5h-3.6V10.4zm10.8 0h3.6v12.5h-3.6V10.4zm8.4 0h3.6v12.5h-3.6V10.4z" /></svg>
              {/* Vercel */}
              <svg className="h-6 sm:h-7 w-auto text-[hsl(var(--foreground))]" viewBox="0 0 110 26" fill="currentColor"><path d="M13 1L25 22H1L13 1ZM45 8h4.2l-3.3 9h-3.8L45 8zm14.6 9h-5.8v-9h5.8v1.3h-4.2v2.5h3.8v1.3h-3.8v2.6h4.2V17zm4.2-9h3.6c2 0 3.2 1.2 3.2 3.1 0 1.6-.9 2.7-2.3 2.9l2.5 3h-2l-2.3-2.8h-1.1v2.8h-1.6V8zm3 4.8c1.2 0 1.9-.6 1.9-1.8 0-1.1-.7-1.7-1.9-1.7h-1.4v3.5h1.4zm9.4 4.4c-2.4 0-4.2-1.8-4.2-4.3s1.7-4.4 4.2-4.4c2.2 0 3.8 1.4 4 3.5h-1.5c-.2-1.3-1.2-2.2-2.5-2.2-1.6 0-2.6 1.2-2.6 3s1 3 2.6 3c1.3 0 2.3-.9 2.5-2.2h1.5c-.2 2.1-1.8 3.5-4 3.5zm7.8-8.7h5.8v1.3h-4.2v2.5h3.8v1.3h-3.8v2.6h4.2V17h-5.8V8zm8.6 0h1.6v7.7h4.8V17h-6.4V8z" /></svg>
            </div>
          </div>
        </section>

        {/* AdSense Banner */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <AdBanner
            dataAdSlot="9876543210"
            className="rounded-3xl overflow-hidden bg-[hsl(var(--accent)/0.3)] border border-[hsl(var(--border)/0.5)]"
          />
        </div>

        {/* ──────────── How It Works ──────────── */}
        <section id="how-it-works" className="py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 lg:mb-20">
              <p className="text-sm font-bold uppercase tracking-widest text-[hsl(var(--primary))] mb-3">
                Workflow
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold text-[hsl(var(--foreground))] mb-6">
                Fastest Free Screen Recording & Sharing
              </h2>
              <p className="text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
                No complicated setup, no installations. Record screen sessions, provide feedback, and share tutorials in seconds.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-[20%] left-0 w-full h-px bg-gradient-to-r from-transparent via-[hsl(var(--border))] to-transparent z-0" style={{ backgroundImage: 'linear-gradient(to right, transparent 50%, hsl(var(--border)) 50%)', backgroundSize: '20px 100%' }} />

              {[
                { step: '01', title: 'Click Record', desc: 'Choose your screen, window, or tab. Toggle mic & webcam on/off.', color: 'from-violet-600 to-purple-600', icon: Zap },
                { step: '02', title: 'Capture Content', desc: 'Narrate your thoughts. Use our drawing tools to highlight key areas.', color: 'from-sky-600 to-blue-600', icon: MonitorPlay },
                { step: '03', title: 'Share Instantly', desc: 'Your video is auto-uploaded. Paste the link anywhere to share.', color: 'from-emerald-600 to-teal-600', icon: Share2 },
              ].map((item, i) => (
                <div key={i} className="relative text-center group z-10">
                  <div className="bg-[hsl(var(--background))] inline-block p-4 rounded-full mb-6 relative">
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-300 relative overflow-hidden`}>
                      <item.icon className="w-8 h-8 relative z-10" />
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                      {i + 1}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-3">{item.title}</h3>
                  <p className="text-[hsl(var(--muted-foreground))] leading-relaxed text-lg">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────── Features ──────────── */}
        <section id="features" className="py-24 sm:py-32 bg-[hsl(var(--muted)/0.3)] border-t border-[hsl(var(--border)/0.5)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 lg:mb-20">
              <p className="text-sm font-bold uppercase tracking-widest text-[hsl(var(--primary))] mb-3">
                Features
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold text-[hsl(var(--foreground))] mb-6">
                Built for Modern Teams
              </h2>
              <p className="text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
                Everything you need to communicate clearly, without the email back-and-forth.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="group relative bg-[hsl(var(--card))] p-8 rounded-3xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)] transition-all duration-300 hover:shadow-2xl hover:shadow-[hsl(var(--primary)/0.05)] hover:-translate-y-1"
                >
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`} />
                  <div className="relative z-10">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-3">{feature.title}</h3>
                    <p className="text-[hsl(var(--muted-foreground))] leading-relaxed text-base">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────── CTA Section ──────────── */}
        <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 px-6 sm:px-16 py-20 sm:py-24 text-center shadow-2xl isolate">
              {/* Background Shapes */}
              <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

              <div className="relative z-10">
                <h2 className="mb-6 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Stop Typing. <br className="sm:hidden" /> Start Recording.
                </h2>
                <p className="mb-10 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                  Join 2 million+ people who use Recordly to save time and communicate with clarity.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full h-14 rounded-full px-8 text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105 bg-white text-indigo-700 hover:bg-white/95 font-bold border-0">
                      Get It Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-white/60 font-medium">
                  <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> No Credit Card</span>
                  <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Mac & PC</span>
                  <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Instant Sharing</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────── FAQ Section (SEO Boost) ──────────── */}
        <section className="py-24 sm:py-32 bg-[hsl(var(--background))] border-t border-[hsl(var(--border)/0.5)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--foreground))] mb-4">Frequently Asked Questions</h2>
              <p className="text-[hsl(var(--muted-foreground))]">Everything you need to know about the best online screen recorder.</p>
            </div>
            <div className="space-y-6">
              {[
                { q: "Is Recordly really a free screen recorder?", a: "Yes! Recordly offers unlimited screen recording for free. You can capture your screen, webcam, and audio without any hidden costs." },
                { q: "How do I share my screen recordings?", a: "Once you finish recording your screen, Recordly automatically generates a shareable link. You can paste this link anywhere — Slack, email, or Jira." },
                { q: "Do I need to download any software?", a: "No. Recordly is a 100% browser-based screen recording tool. It works directly in Chrome, Edge, and Safari without any installations." },
                { q: "Is there a limit on recording duration?", a: "Our free plan allows for unlimited recordings. We believe in providing the best screen recording experience without limiting your content." },
                { q: "Can I record my webcam and screen at the same time?", a: "Absolutely. Recordly features a webcam overlay that allows you to record your face and screen simultaneously, perfect for tutorials and demos." }
              ].map((faq, i) => (
                <div key={i} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 hover:border-[hsl(var(--primary)/0.3)] transition-colors shadow-sm">
                  <h3 className="text-lg font-bold text-[hsl(var(--foreground))] mb-2">{faq.q}</h3>
                  <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ──────────── Footer ──────────── */}
      <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.2)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <img src="/logo.png" alt="Recordly Logo" className="w-12 h-12 object-contain" />
                <span className="text-2xl font-black tracking-tight text-[hsl(var(--foreground))]">Recordly</span>
              </div>
              <p className="text-[hsl(var(--muted-foreground))] leading-relaxed max-w-xs mb-6">
                The fastest way to share screen recordings. Built for developers, designers, and fast-moving teams.
              </p>
              <div className="flex gap-4">
                {['twitter', 'github', 'discord', 'linkedin'].map((social) => (
                  <a key={social} href="#" className="w-8 h-8 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--primary))] hover:text-white transition-all">
                    <span className="sr-only">{social}</span>
                    <Globe className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Download', 'Changelog'] },
              { title: 'Company', links: ['About', 'Careers', 'Blog', 'Contact'] },
              { title: 'Resources', links: ['Help Center', 'API Docs', 'Community', 'Status'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-bold text-[hsl(var(--foreground))] mb-6">{col.title}</h4>
                <ul className="space-y-4">
                  {col.links.map((link) => (
                    <li key={link}>
                      <Link href={link === 'Pricing' ? '/pricing' : '#'} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-[hsl(var(--border))] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">© 2024 Recordly Inc. All rights reserved.</p>
            <div className="flex gap-8 text-sm text-[hsl(var(--muted-foreground))]">
              <a href="#" className="hover:text-[hsl(var(--foreground))]">Privacy Policy</a>
              <a href="#" className="hover:text-[hsl(var(--foreground))]">Terms of Service</a>
              <a href="#" className="hover:text-[hsl(var(--foreground))]">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
