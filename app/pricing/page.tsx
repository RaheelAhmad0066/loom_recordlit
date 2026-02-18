'use client';

import Link from 'next/link';
import { Video, Check, ArrowRight, Zap, Star, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

export default function PricingPage() {
    const [annual, setAnnual] = useState(true);

    const plans = [
        {
            name: 'Free',
            desc: 'Perfect for getting started',
            price: '$0',
            period: 'forever',
            badge: null,
            cta: 'Get Started',
            ctaVariant: 'outline' as const,
            features: [
                'Unlimited recordings',
                'Up to 720p quality',
                'Auto upload to Google Drive',
                'Shareable links',
                'Webcam overlay',
                '5 GB cloud storage',
            ],
        },
        {
            name: 'Pro',
            desc: 'For creators & professionals',
            price: annual ? '$12' : '$15',
            period: annual ? '/mo billed annually' : '/mo',
            badge: 'Most Popular',
            cta: 'Upgrade to Pro',
            ctaVariant: 'default' as const,
            features: [
                'Everything in Free',
                '4K recording quality',
                'Custom branding',
                'Advanced editing tools',
                'Priority support',
                '100 GB cloud storage',
                'Password protected links',
                'Team workspace',
            ],
        },
        {
            name: 'Team',
            desc: 'For growing teams',
            price: annual ? '$25' : '$30',
            period: annual ? '/user/mo billed annually' : '/user/mo',
            badge: null,
            cta: 'Contact Sales',
            ctaVariant: 'outline' as const,
            features: [
                'Everything in Pro',
                'Unlimited cloud storage',
                'Admin dashboard',
                'SSO / SAML',
                'Custom integrations',
                'Dedicated support',
                'SLA guarantee',
                'Analytics & insights',
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-[hsl(var(--background))]">
            {/* Nav */}
            <nav className="sticky top-0 z-50 w-full border-b border-[hsl(var(--border)/0.5)] glass">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/25">
                                <Video className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-[hsl(var(--foreground))]">
                                Record<span className="text-gradient">It</span>
                            </span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <Link href="/login" className="hidden sm:inline-block text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                                Sign In
                            </Link>
                            <Link href="/login">
                                <Button variant="default" size="sm" className="rounded-full px-5 shadow-md shadow-[hsl(var(--primary)/0.25)]">
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                {/* Header */}
                <div className="text-center mb-14 animate-fade-in-up">
                    <p className="text-sm font-semibold uppercase tracking-widest text-[hsl(var(--primary))] mb-3">
                        Pricing
                    </p>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[hsl(var(--foreground))] mb-4">
                        Simple, transparent <span className="text-gradient">pricing</span>
                    </h1>
                    <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-xl mx-auto mb-8">
                        Start for free. Upgrade when you need more power.
                    </p>

                    {/* Annual Toggle */}
                    <div className="inline-flex items-center gap-3 bg-[hsl(var(--muted))] p-1.5 rounded-full">
                        <button
                            onClick={() => setAnnual(false)}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${!annual
                                    ? 'bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-sm'
                                    : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setAnnual(true)}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${annual
                                    ? 'bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-sm'
                                    : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                                }`}
                        >
                            Annual
                            <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                                Save 20%
                            </span>
                        </button>
                    </div>
                </div>

                {/* Plans Grid */}
                <div className="grid md:grid-cols-3 gap-6 lg:gap-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    {plans.map((plan, i) => (
                        <div
                            key={i}
                            className={`relative rounded-2xl p-8 border transition-all duration-300 hover-lift ${plan.badge
                                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--card))] shadow-xl shadow-[hsl(var(--primary)/0.1)] ring-1 ring-[hsl(var(--primary)/0.2)]'
                                    : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'
                                }`}
                        >
                            {plan.badge && (
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                    <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                                        {plan.badge}
                                    </span>
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-1">{plan.name}</h3>
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">{plan.desc}</p>
                            </div>

                            <div className="mb-6">
                                <span className="text-5xl font-extrabold text-[hsl(var(--foreground))]">{plan.price}</span>
                                <span className="text-[hsl(var(--muted-foreground))] ml-1">{plan.period}</span>
                            </div>

                            <Link href="/login">
                                <Button
                                    variant={plan.ctaVariant}
                                    className={`w-full rounded-xl h-11 mb-8 ${plan.badge
                                            ? 'shadow-lg shadow-[hsl(var(--primary)/0.2)]'
                                            : ''
                                        }`}
                                >
                                    {plan.cta}
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </Link>

                            <ul className="space-y-3">
                                {plan.features.map((feature, j) => (
                                    <li key={j} className="flex items-start gap-2.5 text-sm">
                                        <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.badge ? 'text-[hsl(var(--primary))]' : 'text-emerald-500'}`} />
                                        <span className="text-[hsl(var(--muted-foreground))]">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* FAQ / Trust Section */}
                <div className="mt-20 text-center">
                    <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
                        {[
                            { icon: Zap, title: 'No Setup Required', desc: 'Start recording in your browser instantly' },
                            { icon: Star, title: '4.9/5 Rating', desc: 'Loved by thousands of users' },
                            { icon: Users, title: '14M+ Users', desc: 'Trusted by teams worldwide' },
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
                                    <item.icon className="w-6 h-6 text-[hsl(var(--primary))]" />
                                </div>
                                <h4 className="font-semibold text-[hsl(var(--foreground))]">{item.title}</h4>
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                            <Video className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-base font-bold text-[hsl(var(--foreground))]">RecordIt</span>
                    </div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">© 2024 RecordIt. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
