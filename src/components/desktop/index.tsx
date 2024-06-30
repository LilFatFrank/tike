"use client";
import { FC, useState } from "react";
import validator from "validator";

const Desktop: FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");

  const signup = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/email-signup", {
        method: "Post",
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.created) {
        setSuccess(true);
        return;
      }
      setError(true);
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
      setEmail("");
    }
  };

  return (
    <>
      <main className="hidden md:flex flex-col items-center justify-start w-dvw h-dvh p-5">
        <img
          src="/icons/desktop-logo.svg"
          alt="desktop-logo"
          className="lg:mb-[98px] md:mb-[138px]"
        />
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="font-medium font-grotesk text-[48px] leading-[120%] text-center text-black">
            Tike is best experienced
            <br />
            on Mobile
          </p>
          <p className="text-black-70 text-center font-medium font-grotesk leading-[150%]">
            Desktop version coming soon!
          </p>
          <div className="flex flex-col items-center justify-center gap-[6px] w-[320px]">
            <div className="flex items-center justify-between pl-[22px] py-[2px] pr-[2px] rounded-[100px] border border-black-20 gap-2">
              <input
                className="outline-none border-none p-0 m-0 placeholder:text-black-20 text-black font-grotesk w-full"
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
              <button
                className="max-w-[148px] py-1 px-[10px] rounded-[100px] bg-black-80 text-signup-button-text-color font-grotesk w-full h-[42px] disabled:cursor-not-allowed disabled:bg-black-40 disabled:text-black-50"
                disabled={
                  error || loading || !email || !validator.isEmail(email)
                }
                onClick={signup}
              >
                {loading ? "Signing up..." : "Stay updated"}
              </button>
            </div>
            <span className="font-grotesk font-medium text-[10px] leading-[150%] text-black-60">
              {email && !validator.isEmail(email) ? (
                "Enter a valid email"
              ) : success ? (
                "Let's goo! You will hear from us soon :)"
              ) : error ? (
                "Try again"
              ) : (
                <>&nbsp;</>
              )}
            </span>
          </div>
        </div>
        <img
          src="/images/desktop-landing.png"
          alt="landing"
          width={900}
          height={900}
          className="relative top-[-60px] z-[-1]"
        />
      </main>
    </>
  );
};

export default Desktop;
