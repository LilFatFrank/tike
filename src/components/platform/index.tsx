"use client";
import { useNeynarContext } from "@neynar/react";
import { FC, ReactNode } from "react";
import SignIn from "../signin";

interface Platform {
  children: ReactNode;
}

const Platform: FC<Platform> = ({ children }) => {
  const { user } = useNeynarContext();

  return <>{!user ? <SignIn /> : children}</>;
};

export default Platform;
