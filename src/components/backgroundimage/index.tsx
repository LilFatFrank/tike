"use client";
import { memo, useContext, useMemo } from "react";
import { AppContext } from "@/context";
import Image from "next/image";

const BackgroundImage = memo(() => {
  const [state] = useContext(AppContext);
  const bgImageClass = useMemo(
    () => `fixed z-[-3] ${state.pageNotFound ? "opacity-40" : "opacity-100"}`,
    [state.pageNotFound]
  );

  return (
    <Image
      src="/images/desktop-bg.png"
      alt="desktop-bg"
      layout="fill"
      objectFit="cover"
      className={bgImageClass}
    />
  );
});

export default BackgroundImage;
