import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning={true}>
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
      <body
        suppressHydrationWarning={true}
        className="selection:bg-white selection:text-black">
        {children}
      </body>
    </html>
  );
}
