import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Wrapper } from "@/components";
import { Toaster } from "sonner";
import { GoogleTagManager } from "@/components";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tike",
  description: "Broadcast your fun",
  icons: {
    icon: [
      {
        rel: "icon",
        url: "/logo/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  },
  openGraph: {
    images: [
      {
        url: "/images/opengraph-image.jpg",
        width: 1200,
        height: 630,
        alt: "Broadcast your fun",
      },
    ],
  },
  metadataBase: new URL("https://app.tike.social/"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <meta name="theme-color" content="#472B92" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <link rel="apple-touch-icon" href="/images/192x192-logo.png" />
        <link rel="icon" href="/logo/favicon.svg" type="image/svg+xml" />
        {process.env.NEXT_PUBLIC_GTM_ID ? (
          <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
        ) : null}
      </head>
      <body className={`${inter.className}`}>
        <Toaster position="bottom-center" duration={1500} />
        <main className="w-dvw max-md:h-dvh md:h-[calc(100dvh-40px)] mx-auto md:w-[552px] md:border md:border-black-20 md:border-b-0 md:rounded-t-[20px] md:overflow-auto md:no-scrollbar">
          <Wrapper>{children}</Wrapper>
        </main>
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(
                    function(registration) {
                      console.log('Service Worker registered with scope:', registration.scope);
                    },
                    function(err) {
                      console.error('Service Worker registration failed:', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
