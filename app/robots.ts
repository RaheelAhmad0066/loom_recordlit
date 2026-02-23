import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard/', '/record/'], // Don't index these private/app pages
        },
        sitemap: 'https://recordly-screen-recorder.web.app/sitemap.xml',
    };
}
