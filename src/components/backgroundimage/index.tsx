"use client";
import { memo, useContext, useMemo } from "react";
import { AppContext } from "@/context";

const BackgroundImage = memo(() => {
  const [state] = useContext(AppContext);
  const bgImageClass = useMemo(
    () => `fixed z-[-3] ${state.pageNotFound ? "opacity-40" : "opacity-100"} top-0 left-0 right-0 bottom-0 w-full h-full object-cover`,
    [state.pageNotFound]
  );

  return (
    <img
      src="/images/desktop-bg.png"
      alt="desktop-bg"
      className={bgImageClass}
    />
  );
});

export default BackgroundImage;
