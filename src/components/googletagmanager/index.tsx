"use client";
import { FC, useEffect, useCallback, useMemo, memo } from "react";
import Script from "next/script";
interface GoogleTagManager {
  gtmId: string;
}

const createGTMScript = (gtmId: string) => {
  return `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${gtmId}');
  `;
};

const GoogleTagManager: FC<GoogleTagManager> = memo(({ gtmId }) => {
  const trackPageView = useCallback(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "page_view",
      page: window.location.href,
    });
  }, []);

  useEffect(() => {
    trackPageView();
  }, [trackPageView]);

  const scriptContent = useMemo(() => createGTMScript(gtmId), [gtmId]);

  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${gtmId}`}
      />
      <Script
        dangerouslySetInnerHTML={{
          __html: scriptContent,
        }}
      />
    </>
  );
});

export default GoogleTagManager;
