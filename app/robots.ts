import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://obscuradaily.com/sitemap.xml',
    host: 'https://obscuradaily.com',
  };
}
