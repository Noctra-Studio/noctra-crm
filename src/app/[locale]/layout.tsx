import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import dynamic from "next/dynamic";

const ScrollToTop = dynamic(() =>
  import("@/components/ui/ScrollToTop").then((mod) => mod.ScrollToTop),
);
const Cursor = dynamic(() =>
  import("@/components/ui/cursor").then((mod) => mod.Cursor),
);

import { SmoothScroll } from "@/components/SmoothScroll";
import Script from "next/script";

// Satoshi - Brand primary font
const satoshi = localFont({
  src: [
    {
      path: "../../fonts/Satoshi-Variable.woff2",
      weight: "300 900",
      style: "normal",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.noctra.studio"),
  title: "Noctra Studio | Digital Architecture & Web Development",
  description:
    "Strategic web development studio in Querétaro, Mexico. Websites that generate measurable ROI for businesses.",
  openGraph: {
    title: "Noctra Studio | Strategic Web Development",
    description:
      "Websites that generate measurable ROI for businesses in Mexico and abroad.",
    siteName: "Noctra Studio",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Noctra Studio — Strategic Web Development",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Noctra Studio | Strategic Web Development",
    description:
      "Websites that generate measurable ROI for businesses in Mexico and abroad.",
    images: ["/twitter-image.jpg"],
  },
  icons: [
    {
      rel: "icon",
      type: "image/svg+xml",
      url: "/favicon-dark.svg",
      media: "(prefers-color-scheme: light)",
    },
    {
      rel: "icon",
      type: "image/svg+xml",
      url: "/favicon-light.svg",
      media: "(prefers-color-scheme: dark)",
    },
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  const fontClasses = `${satoshi.variable} ${geistSans.variable} ${geistMono.variable} antialiased selection:bg-white selection:text-black`;

  return (
    <>
      <head>
        <link
          rel="preload"
          href="/fonts/Satoshi-Variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://cdn.resend.com"
          crossOrigin="anonymous"
        />
      </head>
      <Script id="apply-attributes" strategy="beforeInteractive">
        {`
          document.documentElement.lang = '${locale}';
          document.body.className = '${fontClasses}';
        `}
      </Script>
      <NextIntlClientProvider messages={messages} locale={locale}>
        <Cursor />
        <SmoothScroll />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange>
          {children}
          <ScrollToTop />
        </ThemeProvider>
      </NextIntlClientProvider>
    </>
  );
}
