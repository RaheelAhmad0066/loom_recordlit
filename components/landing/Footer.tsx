import Link from 'next/link';
import { Video } from 'lucide-react';

export function Footer() {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        Product: [
            { label: 'Features', href: '#features' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'Updates', href: '#' },
        ],
        Company: [
            { label: 'About', href: '#' },
            { label: 'Blog', href: '#' },
            { label: 'Contact', href: '#' },
        ],
        Legal: [
            { label: 'Privacy', href: '#' },
            { label: 'Terms', href: '#' },
            { label: 'Security', href: '#' },
        ],
    };

    return (
        <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-[hsl(var(--primary))] rounded-lg flex items-center justify-center">
                                <Video className="w-4 h-4 text-[hsl(var(--primary-foreground))]" />
                            </div>
                            <span className="text-xl font-bold text-[hsl(var(--foreground))]">Recordly</span>
                        </div>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                            Professional screen recording made simple. Record, share, and collaborate effortlessly.
                        </p>
                    </div>

                    {/* Links */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h3 className="font-semibold text-[hsl(var(--foreground))] mb-4 text-sm uppercase tracking-wider">
                                {category}
                            </h3>
                            <ul className="space-y-2.5">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom */}
                <div className="border-t border-[hsl(var(--border))] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        © {currentYear} Recordly. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        {['Twitter', 'GitHub', 'LinkedIn'].map((social) => (
                            <a
                                key={social}
                                href="#"
                                className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                            >
                                {social}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
