"use client";
import { useNeynarContext } from "@neynar/react";
import { FC, ReactNode } from "react";
import SignIn from "../signin";
import RadioPlayer from "../radio-player";

interface Platform {
  children: ReactNode;
}

const Platform: FC<Platform> = ({ children }) => {
  const { user } = useNeynarContext();

  return (
    <>
      {!user ? <SignIn /> : children}
      <div className="hidden lg:block">
        <RadioPlayer />
      </div>
    </>
  );
};

export default Platform;
