"use client";
import { NeynarAuthButton, SIWN_variant } from "@neynar/react";
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
        <NeynarAuthButton
          variant={SIWN_variant.FARCASTER}
          className="login-btn bg-auth-btn-bg mb-[40px] w-[90%] font-grotesk"
        />
      </div>
    </>
  );
};

export default SignIn;
