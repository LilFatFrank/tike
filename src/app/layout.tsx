import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Desktop, Wrapper } from "@/components";
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
        <Toaster />
        <main className="w-dvw h-dvh mx-auto md:hidden">
          <Wrapper>{children}</Wrapper>
        </main>
        <Desktop />
      </body>
    </html>
  );
}
