"use client";
import { useNeynarContext } from "@neynar/react";
import { FC, ReactNode, useContext } from "react";
import SignIn from "../signin";
import RadioPlayer from "../radio-player";
import { AppContext } from "@/context";

interface Platform {
  children: ReactNode;
}

const Platform: FC<Platform> = ({ children }) => {
  const [state] = useContext(AppContext);
  const { user } = useNeynarContext();

  return (
    <>
      <img
        src="/images/desktop-bg.png"
        alt="desktop-bg"
        className={`fixed z-[-3] top-0 left-0 right-0 bottom-0 object-cover h-dvh w-dvw ${
          state.pageNotFound ? "opacity-40" : "opacity-100"
        }`}
      />
      {!user ? <SignIn /> : children}
      <div className="hidden xl:block">
        <RadioPlayer />
      </div>
    </>
  );
};

export default Platform;
