'use client';

import Link from 'next/link';
import { Video, Play, ArrowRight, Star, Sparkles, Shield, Zap, Globe, MonitorPlay, Share2, Cloud, CheckCircle, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="flex min-h-screen flex-col bg-[hsl(var(--background))]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-[hsl(var(--border)/0.5)] glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/25">
                <Video className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[hsl(var(--foreground))]">
                Record<span className="text-gradient">It</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
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
                <Button variant="default" size="sm" className="rounded-full px-5 shadow-md shadow-[hsl(var(--primary)/0.25)]">
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
                    className="text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] py-2.5 px-2 rounded-lg hover:bg-[hsl(var(--accent))] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link href="/login" className="text-sm font-semibold text-[hsl(var(--primary))] py-2.5 px-2">
                  Sign In →
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-1">
        {/* ──────────── Hero Section ──────────── */}
        <section className="relative overflow-hidden pt-16 pb-12 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-28">
          {/* Background effects */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse,hsl(var(--primary)/0.12),transparent_70%)]" />
            <div className="absolute top-[30%] left-[-5%] w-72 h-72 bg-violet-500/[0.06] rounded-full blur-3xl" />
            <div className="absolute top-[10%] right-[-5%] w-96 h-96 bg-sky-500/[0.04] rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              {/* Left Content */}
              <div className="flex flex-col gap-5 animate-fade-in-up text-center lg:text-left">
                <div className="inline-flex items-center rounded-full border border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.06)] px-3.5 py-1.5 text-sm font-medium text-[hsl(var(--primary))] w-fit mx-auto lg:mx-0">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  Free forever · No credit card
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-extrabold tracking-tight text-[hsl(var(--foreground))] leading-[1.1]">
                  Screen Recording,{' '}
                  <span className="text-gradient">Simplified.</span>
                </h1>

                <p className="max-w-[540px] text-base sm:text-lg text-[hsl(var(--muted-foreground))] leading-relaxed mx-auto lg:mx-0">
                  Record your screen in HD, auto-upload to Google Drive, and share with a link.
                  No installs. No sign-up walls. Just click & record.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center lg:justify-start">
                  <Link href="/login">
                    <Button size="lg" className="w-full sm:w-auto rounded-full text-base h-12 px-8 shadow-lg shadow-[hsl(var(--primary)/0.3)] hover:shadow-xl hover:shadow-[hsl(var(--primary)/0.4)] transition-all group">
                      Start Recording
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="#how-it-works">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full text-base h-12 px-8">
                      <Play className="mr-2 h-4 w-4" />
                      See How It Works
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center gap-6 text-sm text-[hsl(var(--muted-foreground))] pt-2 justify-center lg:justify-start">
                  <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" />HD Quality</span>
                  <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" />No Watermark</span>
                  <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" />Unlimited</span>
                </div>
              </div>

              {/* Right Content - Demo Card */}
              <div className="relative mx-auto w-full max-w-[520px] lg:max-w-none animate-float" style={{ animationDelay: '300ms' }}>
                <div className="relative rounded-2xl border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card)/0.8)] backdrop-blur-xl shadow-2xl overflow-hidden">
                  {/* Browser chrome */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border)/0.5)]">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                      <div className="w-3 h-3 rounded-full bg-green-400/80" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="h-6 bg-[hsl(var(--background)/0.6)] rounded-md flex items-center px-3">
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">app.recordit.dev</span>
                      </div>
                    </div>
                  </div>

                  {/* Video area */}
                  <div className="aspect-video bg-gradient-to-br from-violet-600/10 via-[hsl(var(--background))] to-sky-600/10 relative flex items-center justify-center group cursor-pointer">
                    {/* Grid pattern */}
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.3 }} />

                    {/* Play button */}
                    <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-500/30 transition-all group-hover:scale-110 group-hover:shadow-violet-500/40">
                      <Play className="h-7 w-7 sm:h-8 sm:w-8 text-white ml-1 fill-white" />
                    </div>

                    {/* Recording indicator */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-[hsl(var(--background)/0.8)] backdrop-blur px-3 py-1.5 rounded-full border border-[hsl(var(--border)/0.5)]">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-mono font-medium text-[hsl(var(--foreground))]">02:34</span>
                    </div>

                    {/* Webcam bubble */}
                    <div className="absolute bottom-4 right-4 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 border-4 border-[hsl(var(--background))] shadow-xl flex items-center justify-center text-white font-bold text-lg">
                      RA
                    </div>
                  </div>
                </div>

                {/* Floating card */}
                <div className="absolute -bottom-4 -left-4 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] shadow-xl p-3 animate-fade-in-up hidden sm:flex items-center gap-3" style={{ animationDelay: '800ms' }}>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Uploaded!</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Saved to Google Drive</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────── Trusted By ──────────── */}
        <section className="border-y border-[hsl(var(--border)/0.4)] bg-[hsl(var(--muted)/0.3)] py-8 sm:py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="mb-6 text-xs sm:text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-[0.15em]">
              Trusted by creators & teams worldwide
            </p>
            <div className="flex flex-wrap justify-center gap-x-8 sm:gap-x-12 gap-y-3 opacity-30">
              {['Google', 'Microsoft', 'Spotify', 'Notion', 'Stripe', 'Vercel'].map((logo) => (
                <span key={logo} className="font-bold text-sm sm:text-base text-[hsl(var(--foreground))]">
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────── How It Works ──────────── */}
        <section id="how-it-works" className="py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-widest text-[hsl(var(--primary))] mb-3">
                How It Works
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[hsl(var(--foreground))] mb-4">
                Three Steps. That&apos;s It.
              </h2>
              <p className="text-base sm:text-lg text-[hsl(var(--muted-foreground))] max-w-xl mx-auto">
                No complicated setup, no installations — just pure simplicity.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {[
                { step: '01', title: 'Click Record', desc: 'Choose your screen, window, or tab. Toggle mic & webcam on/off.', color: 'from-violet-600 to-purple-600' },
                { step: '02', title: 'Record & Finish', desc: 'Record as long as you want. Pause, resume, stop anytime.', color: 'from-sky-600 to-blue-600' },
                { step: '03', title: 'Share Instantly', desc: 'Auto-uploaded to Drive. Get a shareable link in seconds.', color: 'from-emerald-600 to-teal-600' },
              ].map((item, i) => (
                <div key={i} className="relative text-center group animate-fade-in-up" style={{ animationDelay: `${i * 150}ms` }}>
                  <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-bold text-xl shadow-xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-2">{item.title}</h3>
                  <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">{item.desc}</p>

                  {/* Connector line */}
                  {i < 2 && (
                    <div className="hidden md:block absolute top-8 left-[calc(50%+48px)] w-[calc(100%-96px)] h-px bg-gradient-to-r from-[hsl(var(--border))] to-[hsl(var(--border))]" style={{ backgroundImage: 'repeating-linear-gradient(90deg, hsl(var(--border)), hsl(var(--border)) 6px, transparent 6px, transparent 12px)' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────── Features ──────────── */}
        <section id="features" className="py-20 sm:py-28 bg-[hsl(var(--muted)/0.3)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-widest text-[hsl(var(--primary))] mb-3">
                Features
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[hsl(var(--foreground))] mb-4">
                Everything You Need
              </h2>
              <p className="text-base sm:text-lg text-[hsl(var(--muted-foreground))] max-w-xl mx-auto">
                Powerful features packed into a clean, easy-to-use interface.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="group relative bg-[hsl(var(--card))] p-7 rounded-2xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)] transition-all duration-300 hover-lift"
                >
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300`} />
                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-[hsl(var(--foreground))] mb-2">{feature.title}</h3>
                    <p className="text-[hsl(var(--muted-foreground))] leading-relaxed text-sm">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────── CTA Section ──────────── */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 px-6 sm:px-12 py-16 sm:py-20 text-center shadow-2xl">
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1), transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.05), transparent 50%)' }} />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

              <div className="relative z-10">
                <h2 className="mb-4 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
                  Ready to Start Recording?
                </h2>
                <p className="mb-8 text-base sm:text-lg text-white/70 max-w-lg mx-auto">
                  Join thousands of creators and teams who use RecordIt every day.
                </p>
                <Link href="/login">
                  <Button size="lg" className="rounded-full px-8 h-12 text-base shadow-xl hover:shadow-2xl transition-all hover:scale-105 bg-white text-indigo-700 hover:bg-white/95 font-semibold border-0">
                    Get Started — It&apos;s Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <p className="mt-4 text-sm text-white/50">
                  No credit card · No installs · Free forever
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ──────────── Footer ──────────── */}
      <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                  <Video className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-[hsl(var(--foreground))]">RecordIt</span>
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                Professional screen recording, simplified.
              </p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Dashboard'] },
              { title: 'Company', links: ['About', 'Blog', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold text-sm text-[hsl(var(--foreground))] mb-3 uppercase tracking-wider">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <Link href={link === 'Pricing' ? '/pricing' : link === 'Dashboard' ? '/dashboard' : '#'} className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-[hsl(var(--border))] pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">© 2024 RecordIt. All rights reserved.</p>
            <div className="flex gap-6">
              {['Twitter', 'GitHub', 'Discord'].map((s) => (
                <a key={s} href="#" className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
