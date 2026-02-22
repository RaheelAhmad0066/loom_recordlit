import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Analytics from '@/components/Analytics';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const viewport = {
  width: 'width=device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://recordly.dev'),
  title: {
    default: 'Recordly - #1 Free Online Screen Recorder | Best Loom Alternative',
    template: '%s | Recordly'
  },
  description: 'The best free online screen recorder for professionals. Record your screen, webcam, and audio with one click. Auto-upload to Google Drive and share instantly. No download required.',
  keywords: ['online screen recorder', 'free screen recorder', 'no download screen recorder', 'best loom alternative', 'chrome extension', 'screen capture', 'video recording', 'recordly', 'product demo', 'tutorial maker'],
  authors: [{ name: 'Recordly Team' }],
  alternates: {
    canonical: 'https://recordly.dev',
  },
  openGraph: {
    title: 'Recordly - High-Performance Screen Recording',
    description: 'Instant screen recording and sharing. Professional-grade tool for modern teams.',
    url: 'https://recordly.dev',
    siteName: 'Recordly',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Recordly - Professional Screen Recording',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recordly - Professional Screen Recording',
    description: 'The fastest way to share your screen with your team.',
    images: ['/og-image.png'],
    creator: '@recordly',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Placeholder
  }
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Recordly',
  operatingSystem: 'Windows, macOS, ChromeOS',
  applicationCategory: 'MultimediaApplication',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '1250',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${outfit.variable} ${inter.variable}`}>
      <body className={outfit.className} suppressHydrationWarning={true}>
        <ThemeProvider>
          <AuthProvider>
            <Suspense fallback={null}>
              <Analytics />
            </Suspense>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
