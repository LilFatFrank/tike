"use client";
import { memo } from "react";

interface ErrorProps {
  type?: "error" | "404";
  message: string;
  buttonLabel?: string;
  buttonAction?: () => void;
}

const Error: React.FC<ErrorProps> = memo(({
  type,
  message,
  buttonLabel,
  buttonAction,
}) => {
  return (
    <>
      <img
        src={
          type === "404" ? "https://tike-assets.s3.ap-south-1.amazonaws.com/404-image.png" : "https://tike-assets.s3.ap-south-1.amazonaws.com/error-image.png"
        }
        alt={type === "404" ? "404" : "error"}
        className="fixed w-full h-full md:w-[550px] md:h-[calc(100dvh-40px)] object-cover z-[-2]"
        width={550}
        height={550}
      />
      <div className="flex flex-col items-center justify-end gap-[10px] h-full pb-[90px] max-w-[400px] mx-auto text-center">
        <p className="text-white text-[24px] font-semibold leading-[28px]">
          {message}
        </p>
        {
          <button
            onClick={buttonAction}
            className={`${
              buttonAction && buttonLabel ? "visible" : "invisible"
            } h-[64px] w-full border-none outline-none rounded-[100px] px-4 py-2 bg-black text-white leading-[120%] font-medium`}
          >
            {buttonLabel}
          </button>
        }
      </div>
    </>
    );
  }
);

export default Error;
