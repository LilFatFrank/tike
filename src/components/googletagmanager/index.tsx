"use client";
import { FC, useEffect } from "react";

interface GoogleTagManager {
  gtmId: string;
}

export const GoogleTagManager: FC<GoogleTagManager> = ({ gtmId }) => {
  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "page_view",
      page: window.location.href,
    });
  }, [gtmId]);

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${gtmId}`}
      ></script>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gtmId}');
          `,
        }}
      />
    </>
  );
};