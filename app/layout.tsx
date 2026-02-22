import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const viewport = {
  width: 'width=device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://recordly-screen-recorder.web.app'),
  title: 'Recordly - Professional Screen Recording Made Simple',
  description: 'Record your screen, automatically upload to Google Drive, and share instantly. The premium Loom alternative for high-performance teams.',
  keywords: ['screen recorder', 'screen capture', 'video recording', 'loom alternative', 'recordly', 'product demo', 'tutorial maker'],
  authors: [{ name: 'Recordly Team' }],
  openGraph: {
    title: 'Recordly - High-Performance Screen Recording',
    description: 'Instant screen recording and sharing. Professional-grade tool for modern teams.',
    url: 'https://recordly-screen-recorder.web.app',
    siteName: 'Recordly',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 600,
        alt: 'Recordly Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recordly - Professional Screen Recording',
    description: 'The fastest way to share your screen with your team.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
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
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
