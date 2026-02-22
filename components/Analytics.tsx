'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { analytics } from '@/lib/firebase/config';
import { logEvent } from 'firebase/analytics';

export default function Analytics() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!pathname) return;

        const trackPageView = async () => {
            const a = await analytics;
            if (a) {
                logEvent(a, 'page_view', {
                    page_path: pathname,
                    page_location: window.location.href,
                    page_title: document.title,
                });
            }
        };

        trackPageView();
    }, [pathname, searchParams]);

    return null;
}
