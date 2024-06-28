"use client";
import { NeynarContextProvider, Theme } from "@neynar/react";
import { FC, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Platform } from "@/components";

const queryClient = new QueryClient();

interface Wrapper {
  children: ReactNode;
}

const Wrapper: FC<Wrapper> = ({ children }) => {
  return (
    <NeynarContextProvider
      settings={{
        clientId: process.env.NEXT_PUBLIC_CLIENT_ID || "",
        defaultTheme: Theme.Dark,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <Platform>{children}</Platform>
      </QueryClientProvider>
    </NeynarContextProvider>
  );
};

export default Wrapper;
