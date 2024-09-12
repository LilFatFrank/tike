"use client";
import { useNeynarContext } from "@neynar/react";
import { FC, memo, ReactNode } from "react";
import SignIn from "../signin";
import RadioPlayer from "../radio-player";
import BackgroundImage from "../backgroundimage";

interface Platform {
  children: ReactNode;
}

const Platform: FC<Platform> = memo(({ children }) => {
  const { user } = useNeynarContext();

  return (
    <>
      <BackgroundImage />
      {!user ? <SignIn /> : children}
      <div className="hidden xl:block">
        <RadioPlayer />
      </div>
    </>
  );
});

export default Platform;
