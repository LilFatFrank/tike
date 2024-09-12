"use client";
import { ActivityBar, Frame, UserChannels } from "@/components";
import { useNeynarContext } from "@neynar/react";
import { useRouter } from "next/navigation";
import React from "react";
import { FC, memo, useCallback, useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "react-query";

interface ApiResponse {
  casts: any;
  next: { cursor: string };
}

const Frames: FC = memo(() => {
  const { user } = useNeynarContext();
  const router = useRouter();

  const fetchFrames = useCallback(
    async ({
      pageParam = "",
      queryKey,
    }: {
      pageParam?: string;
      queryKey: any;
    }): Promise<ApiResponse> => {
      const [_key, { fid }] = queryKey;
      const response = await fetch(`/api/frames`, {
        method: "POST",
        body: JSON.stringify({ cursor: pageParam, fid }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data;
    },
    []
  );

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(["frames", { fid: user?.fid || 3 }], fetchFrames, {
    getNextPageParam: (lastPage) => {
      return lastPage.next?.cursor ?? false;
    },
    refetchOnWindowFocus: false,
    staleTime: 60000,
    cacheTime: 3600000,
  });

  const { ref, inView } = useInView({
    threshold: 0.3,
  });

  const handleFetchNextPage = useCallback(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  useEffect(() => {
    handleFetchNextPage();
  }, [data, handleFetchNextPage]);

  const allFrames = useMemo(
    () => data?.pages.flatMap((page) => page.casts) ?? [],
    [data]
  );

  if (isLoading) {
    return (
      <div className="p-2 flex items-start justify-center h-full bg-white">
        <div className="p-2 flex flex-col items-start justify-start min-h-full bg-white w-full">
          <div className="animate-pulse w-full h-[70px] bg-divider rounded-lg" />
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="py-5 w-full" key={index}>
              <div className="flex items-center flex-col justify-start w-full gap-3">
                <div className="flex items-center gap-2 w-full">
                  <div className="h-[40px] w-[40px] rounded-full bg-divider animate-pulse flex-shrink-0" />
                  <div className="animate-pulse grow h-[36px] bg-divider rounded-lg" />
                </div>
                <div className="animate-pulse w-full h-[360px] bg-divider rounded-lg" />
                <div className="animate-pulse w-full h-[20px] bg-divider rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    <p className="w-full items-center justify-center py-2 text-center">
      Error fetching Frames!
    </p>;
  }

  return (
    <div className="flex-1 bg-white min-h-full">
      <ActivityBar />

      <UserChannels />
      {allFrames.map((frame, frameIndex, arr) =>
        frame.embeds[0].url ? (
          <span
            onClick={() =>
              router.push(`/cast/${frame.parent_hash || frame.hash}`)
            }
            key={`${frame.parent_hash || frame.hash}`}
            className="cursor-pointer"
          >
            <Frame frame={frame} key={`frame-${frame.hash}`} />
            {frameIndex === arr.length - 1 ? null : (
              <hr className="border border-t-divider" />
            )}
          </span>
        ) : null
      )}

      {isFetchingNextPage ? (
        <div className="p-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="py-5 w-full" key={index}>
              <div className="flex items-center flex-col justify-start w-full gap-3">
                <div className="flex items-center gap-2 w-full">
                  <div className="h-[40px] w-[40px] rounded-full bg-divider animate-pulse flex-shrink-0" />
                  <div className="animate-pulse grow h-[36px] bg-divider rounded-lg" />
                </div>
                <div className="animate-pulse w-full h-[360px] bg-divider rounded-lg" />
                <div className="animate-pulse w-full h-[20px] bg-divider rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div ref={ref} style={{ height: "20px" }}></div>

      {allFrames && allFrames.length && !hasNextPage ? (
        <p className="w-full items-center justify-center py-2 text-center">
          End of the line!
        </p>
      ) : null}
    </div>
  );
});

export default Frames;
