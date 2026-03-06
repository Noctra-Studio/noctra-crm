import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://noctra.studio';
  const lastModified = new Date();

  const pages: {
    path: string;
    esPath?: string;
    changeFrequency: 'weekly' | 'monthly';
    priority: number;
  }[] = [
    { path: '', changeFrequency: 'weekly', priority: 1 },
    { path: 'about', changeFrequency: 'monthly', priority: 0.8 },
    { path: 'services', changeFrequency: 'monthly', priority: 0.9 },
    { path: 'services/professional-websites', changeFrequency: 'monthly', priority: 0.8 },
    { path: 'services/ecommerce', changeFrequency: 'monthly', priority: 0.8 },
    { path: 'services/custom-systems', changeFrequency: 'monthly', priority: 0.8 },
    { path: 'services/optimization', changeFrequency: 'monthly', priority: 0.8 },
    { path: 'services/landing-page', changeFrequency: 'monthly', priority: 0.8 },
    { path: 'work', changeFrequency: 'monthly', priority: 0.7 },
    { path: 'contact', changeFrequency: 'monthly', priority: 0.8 },
    { path: 'blog', changeFrequency: 'weekly', priority: 0.7 },
    { path: 'careers', esPath: 'talento', changeFrequency: 'monthly', priority: 0.6 },
    { path: 'guarantee', esPath: 'garantia', changeFrequency: 'monthly', priority: 0.6 },
    { path: 'technology-explained', esPath: 'tecnologia-explicada', changeFrequency: 'monthly', priority: 0.5 },
    { path: 'custom-pricing', esPath: 'precios-personalizados', changeFrequency: 'monthly', priority: 0.6 },
    { path: 'first-clients', esPath: 'primeros-clientes', changeFrequency: 'monthly', priority: 0.6 },
    { path: 'privacy-policy', changeFrequency: 'monthly', priority: 0.3 },
    { path: 'terms-and-conditions', changeFrequency: 'monthly', priority: 0.3 },
  ];

  return pages.map((page) => ({
    url: `${baseUrl}/${page.path}`,
    lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
    alternates: {
      languages: {
        en: `${baseUrl}/${page.path}`,
        es: `${baseUrl}/es/${page.esPath ?? page.path}`,
      },
    },
  }));
}
