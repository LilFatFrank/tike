import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Wrapper } from "@/components";
import { Toaster } from "sonner";

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
        <link rel="icon" href="/logo/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={`${inter.className}`}>
        <img src="/images/desktop-bg.png" alt="desktop-bg" className="fixed z-[-3] top-0 left-0 right-0 bottom-0 object-cover h-dvh w-dvw" />
        <Toaster />
        <main className="w-dvw h-dvh md:h-[calc(100dvh-60px)] mx-auto md:w-[552px] md:border md:border-black-20 md:rounded-t-[20px] md:overflow-auto md:no-scrollbar bg-white opacity-90">
          <Wrapper>{children}</Wrapper>
        </main>
      </body>
    </html>
  );
}
