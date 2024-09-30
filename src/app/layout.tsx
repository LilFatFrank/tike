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
        url: "/logo/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  },
  openGraph: {
    images: [
      {
        url: "https://tike-assets.s3.ap-south-1.amazonaws.com/opengraph-image.jpg",
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
        <link rel="apple-touch-icon" href="/logo/favicon.svg" />
        <link rel="icon" href="/logo/favicon.svg" type="image/svg+xml" />
      </head>
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
