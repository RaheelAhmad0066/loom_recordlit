import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard/', '/record/'], // Don't index these private/app pages
        },
        sitemap: 'https://recordly.dev/sitemap.xml',
    };
}
