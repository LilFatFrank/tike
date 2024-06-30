import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Wrapper } from "@/components";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tike",
  description: "Broadcast your Fun",
  icons: {
    icon: "/logo/favicon.png",
    other: [
      {
        rel: "icon",
        url: "/logo/favicon.png",
        sizes: "any",
        type: "image/png",
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
      <body className={`${inter.className} w-dvw h-dvh mx-auto md:hidden`}>
        <Wrapper>{children}</Wrapper>
      </body>
    </html>
  );
}
