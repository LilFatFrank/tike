import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Wrapper } from "@/components";
import { Toaster } from "sonner";
import { GoogleTagManager } from "@/components";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tike",
  description: "Broadcast your fun",
  icons: {
    icon: [
      {
        rel: "icon",
        url: "/images/192x192-logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        rel: "icon",
        url: "/images/64x64-logo.png",
        sizes: "64x64",
        type: "image/png",
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
      <body className={inter.className}>
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
        )}
        <Toaster position="bottom-center" duration={1500} />
        <main className="w-dvw max-md:h-dvh md:h-[calc(100dvh-40px)] mx-auto md:w-[552px] md:border md:border-black-20 md:border-b-0 md:rounded-t-[20px] md:overflow-auto md:no-scrollbar">
          <Wrapper>{children}</Wrapper>
        </main>
      </body>
    </html>
  );
}
