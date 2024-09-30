"use client";
import { memo, useContext, useMemo } from "react";
import { AppContext } from "@/context";

const BackgroundImage = memo(() => {
  const [state] = useContext(AppContext);
  const bgImageClass = useMemo(
    () => `fixed z-[-3] ${state.pageNotFound || state.appError ? "opacity-40" : "opacity-100"} top-0 left-0 right-0 bottom-0 w-full h-full object-cover`,
    [state.pageNotFound, state.appError]
  );

  return (
    <img
      src="https://tike-assets.s3.ap-south-1.amazonaws.com/desktop-bg.png"
      alt="desktop-bg"
      className={bgImageClass}
    />
  );
});

export default BackgroundImage;
