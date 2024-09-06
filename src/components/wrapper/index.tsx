"use client";
import { NeynarContextProvider, Theme } from "@neynar/react";
import { FC, ReactNode, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Error, Footer, Platform } from "@/components";
import { AppContextProvider } from "@/context";

const queryClient = new QueryClient();

interface Wrapper {
  children: ReactNode;
}

const Wrapper: FC<Wrapper> = ({ children }) => {
  const [isSafariMobile, setIsSafariMobile] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
    setIsSafariMobile(isSafari && isMobile);
  }, []);

  if (isSafariMobile) {
    return (
      <Error
        message="Safari Mobile is not supported, Please use Chrome on Mobile while we work on a fix."
        type="error"
      />
    );
  }

  return (
    <NeynarContextProvider
      settings={{
        clientId: process.env.NEXT_PUBLIC_CLIENT_ID || "",
        defaultTheme: Theme.Dark,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AppContextProvider>
          <Platform>{children}</Platform>
          <Footer />
        </AppContextProvider>
      </QueryClientProvider>
    </NeynarContextProvider>
  );
};

export default Wrapper;
