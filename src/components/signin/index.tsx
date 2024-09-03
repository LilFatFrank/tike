"use client";
import {
  NeynarAuthButton,
  SIWN_variant,
  useNeynarContext,
} from "@neynar/react";
import { FC } from "react";

const SignIn: FC = () => {
  return (
    <>
      <div className="w-full h-full relative flex flex-col items-center justify-end">
        <div className="fixed w-full h-full bg-sign-in-bg z-[-2] md:w-[550px] md:rounded-t-[20px] md:h-[calc(100dvh-40px)]" />
        <img
          src="/images/signin-background.png"
          alt="signin"
          className="fixed z-[-1] object-cover w-full h-full md:w-[550px] md:rounded-t-[20px] md:h-[calc(100dvh-40px)]"
        />
        <p className="font-satisfy font-normal text-white text-[40px] leading-[120%] absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
          Tike
        </p>
        <div className="flex flex-col items-left justify-center w-[90%] gap-4">
          <p className="font-extrabold text-[40px] leading-[48px] text-white">
            Your hub for fun, creativity, and community.
          </p>
          <div className="relative z-20 flex w-full cursor-pointer items-center overflow-hidden rounded-[100px] mb-[40px]">
            <div className="animate-rotate absolute inset-0 h-full w-full rounded-full bg-[conic-gradient(white_20deg,transparent_120deg)]" />
            <div className="absolute inset-[1px] rounded-[99px] bg-sign-in-bg" />
            <div className="relative z-20 w-full bg-auth-btn-bg rounded-[100px]">
              <NeynarAuthButton
                variant={SIWN_variant.FARCASTER}
                className="login-btn backdrop-blur-(10px) font-grotesk z-20"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;
