import {createNavigation} from 'next-intl/navigation';
import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'es'],
 
  // Used when no locale matches
  defaultLocale: 'en',
  
  // Use 'as-needed' to hide default locale from URL
  // This reduces navigation and keeps URLs cleaner
  localePrefix: 'as-needed',
  pathnames: {
    '/': '/',
    '/about': '/about',
    '/services': '/services',
    '/work': '/work',
    '/contact': '/contact',
    '/blog': '/blog',
    '/privacy-policy': {
      en: '/privacy-policy',
      es: '/aviso-de-privacidad'
    },
    '/terms-and-conditions': {
      en: '/terms-and-conditions',
      es: '/terminos-y-condiciones'
    },
    '/cookie-policy': {
      en: '/cookie-policy',
      es: '/politica-de-cookies'
    },
    '/studio': '/studio',
    '/dashboard': '/dashboard',
    '/admin': '/admin',
    '/login': '/login',
    '/guarantee': {
      en: '/guarantee',
      es: '/garantia'
    },
    '/technology-explained': {
      en: '/technology-explained',
      es: '/tecnologia-explicada'
    },
    '/custom-pricing': {
      en: '/custom-pricing',
      es: '/precios-personalizados'
    },
    '/first-clients': {
      en: '/first-clients',
      es: '/primeros-clientes'
    },
    "/careers": { en: "/careers", es: "/talento" },
    '/services/landing-page': {
      en: '/services/landing-page',
      es: '/servicios/landing-page'
    },
    '/services/professional-websites': {
      en: '/services/professional-websites',
      es: '/servicios/sitios-web-profesionales'
    },
    '/services/ecommerce': {
      en: '/services/ecommerce',
      es: '/servicios/tiendas-en-linea'
    },
    '/services/custom-systems': {
      en: '/services/custom-systems',
      es: '/servicios/sistemas-a-medida'
    },
    '/services/optimization': {
      en: '/services/optimization',
      es: '/servicios/optimizacion'
    }
  }
});
 
// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const {Link, redirect, usePathname, useRouter} =
  createNavigation(routing);
