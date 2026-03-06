import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

type PageKey =
  | 'home'
  | 'about'
  | 'services'
  | 'contact'
  | 'blog'
  | 'careers'
  | 'work'
  | 'guarantee'
  | 'technology'
  | 'custom-pricing'
  | 'first-clients'
  | 'services-professional-websites'
  | 'services-ecommerce'
  | 'services-custom-systems'
  | 'services-optimization'
  | 'services-landing-page'
  | 'privacy'
  | 'terms';

export async function generatePageMetadata(
  locale: string,
  page: PageKey
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.noctra.studio';
  const pagePath = page === 'home' ? '' : page;
  
  // Strict absolute URLs for next-intl (avoiding ambiguous locale fallback)
  const canonicalUrl = `${baseUrl}/${locale}${pagePath ? `/${pagePath}` : ''}`;
  const enUrl = `${baseUrl}/en${pagePath ? `/${pagePath}` : ''}`;
  const esUrl = `${baseUrl}/es${pagePath ? `/${pagePath}` : ''}`;
  
  return {
    title: t(`${page}.title`),
    description: t(`${page}.description`),
    keywords: t(`${page}.keywords`),
    
    // Open Graph
    openGraph: {
      title: t(`${page}.og_title`),
      description: t(`${page}.og_description`),
      url: canonicalUrl,
      siteName: 'Noctra Studio',
      locale: locale === 'en' ? 'en_US' : 'es_MX',
      type: 'website',
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: t(`${page}.og_image_alt`),
        },
      ],
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: t(`${page}.twitter_title`),
      description: t(`${page}.twitter_description`),
      images: [`${baseUrl}/twitter-image.jpg`],
    },
    
    // Alternate languages
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': enUrl,
        'es': esUrl,
        'x-default': esUrl,
      },
    },
    
    // Additional metadata
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
  };
}
