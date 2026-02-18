'use client';

import { Video, Share2, Lock, Users, Download, Cloud, CheckCircle } from 'lucide-react';

export function FeaturesSection() {
    const features = [
        {
            icon: <Video className="w-6 h-6" />,
            title: 'Screen & Window Recording',
            description: 'Capture your entire screen, specific windows, or browser tabs with crystal clear quality.',
            gradient: 'from-violet-500 to-purple-600',
        },
        {
            icon: <Share2 className="w-6 h-6" />,
            title: 'Instant Sharing',
            description: 'Get a shareable link immediately after recording. Share via email, chat, or social media.',
            gradient: 'from-blue-500 to-cyan-500',
        },
        {
            icon: <Cloud className="w-6 h-6" />,
            title: 'Cloud Storage',
            description: 'Automatically uploads to your Google Drive. Access your recordings from anywhere, anytime.',
            gradient: 'from-emerald-500 to-teal-500',
        },
        {
            icon: <Lock className="w-6 h-6" />,
            title: 'Secure & Private',
            description: 'Your recordings are stored in your own Google Drive. You control who can view them.',
            gradient: 'from-amber-500 to-orange-500',
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: 'Easy Collaboration',
            description: 'Perfect for remote teams. Share demos, tutorials, and updates with your entire team.',
            gradient: 'from-indigo-500 to-violet-500',
        },
        {
            icon: <Download className="w-6 h-6" />,
            title: 'Download Anytime',
            description: 'Download your recordings as MP4 files. Keep local copies for offline viewing.',
            gradient: 'from-pink-500 to-rose-500',
        },
    ];

    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[hsl(var(--muted)/0.4)]">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16 animate-fade-in-up">
                    <p className="text-sm font-semibold uppercase tracking-widest text-[hsl(var(--primary))] mb-3">
                        Features
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold text-[hsl(var(--foreground))] mb-4">
                        Powerful Features
                    </h2>
                    <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
                        Everything you need for professional screen recording, built right in.
                    </p>
                </div>

                {/* Feature Cards Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group relative bg-[hsl(var(--card))] p-8 rounded-2xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)] transition-all duration-300 hover-lift"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Gradient glow on hover */}
                            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-300`} />

                            <div className="relative z-10">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Extra Features List */}
                <div className="mt-16 bg-[hsl(var(--card))] rounded-2xl p-8 md:p-12 border border-[hsl(var(--border))] animate-shimmer">
                    <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-8 text-center">
                        And much more...
                    </h3>
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                        {[
                            'Webcam overlay bubble',
                            'Pause & resume',
                            'Microphone toggle',
                            'Live timer',
                            'Floating controls',
                            'Dark mode',
                            'Responsive design',
                            'No watermarks',
                        ].map((item, index) => (
                            <div key={index} className="flex items-center gap-2.5">
                                <CheckCircle className="w-4 h-4 text-[hsl(var(--primary))] flex-shrink-0" />
                                <span className="text-sm text-[hsl(var(--muted-foreground))] font-medium">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
