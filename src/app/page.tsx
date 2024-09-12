"use client";
import { ActivityBar, Cast, Frame, UserChannels } from "@/components";
import { useNeynarContext } from "@neynar/react";
import { useRouter } from "next/navigation";
import { usePathname, useSearchParams } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "react-query";

interface ApiResponse {
  casts: any;
  next: { cursor: string };
}

export default function Home() {
  const { user } = useNeynarContext();
  const [filter, setFilter] = useState<null | "video" | "image" | "audio">(
    null
  );

  const fetchCasts = useCallback(
    async ({
      pageParam = "",
      queryKey,
    }: {
      pageParam?: string;
      queryKey: any;
    }): Promise<ApiResponse> => {
      const [_key, { fid, filter }] = queryKey;
      const response = await fetch(`/api/casts`, {
        method: "POST",
        body: JSON.stringify({ cursor: pageParam, fid, filter }),
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
  } = useInfiniteQuery(["casts", { fid: user?.fid || 3, filter }], fetchCasts, {
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const handleFetchNextPage = useCallback(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

  useEffect(() => {
    handleFetchNextPage();
  }, [data, handleFetchNextPage]);

  useEffect(() => {
    if (pathname === "/") {
      setFilter(searchParams?.get("filter") as typeof filter);
    }
  }, [searchParams, pathname]);

  const allCasts = useMemo(
    () => data?.pages.flatMap((page) => page.casts) ?? [],
    [data]
  );

  const MemoizedCast = memo(Cast);
  const MemoizedFrame = memo(Frame);

  const renderLoadingState = () => (
    <div className="p-2 flex flex-col items-start justify-start min-h-full bg-white w-full">
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
  );

  const renderError = () => (
    <p className="w-full items-center justify-center py-2 text-center">
      Error fetching casts!
    </p>
  );

  const renderCasts = () => (
    <>
      {allCasts.map((cast, castIndex, arr) =>
        cast.embeds[0].url ? (
          <span
            onClick={() =>
              router.push(`/cast/${cast.parent_hash || cast.hash}`)
            }
            key={`${cast.parent_hash || cast.hash}`}
            className="cursor-pointer"
          >
            {cast.embedType === "frame" ? (
              <MemoizedFrame frame={cast} key={`cast-${cast.hash}`} />
            ) : (
              <MemoizedCast cast={cast} key={`cast-${cast.hash}`} />
            )}
            {castIndex === arr.length - 1 ? null : (
              <hr className="border border-t-divider" />
            )}
          </span>
        ) : null
      )}
    </>
  );

  const renderLoadingMore = () => (
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
  );

  if (isLoading) return renderLoadingState();

  if (error) return renderError();

  return (
    <>
      <div className="flex-1 bg-white min-h-full">
        <ActivityBar />

        <UserChannels />

        {renderCasts()}

        {isFetchingNextPage ? renderLoadingMore() : null}

        <div ref={ref} style={{ height: "20px" }}></div>

        {allCasts && allCasts.length && !hasNextPage ? (
          <p className="w-full items-center justify-center py-2 text-center">
            End of the line!
          </p>
        ) : null}
      </div>
    </>
  );
}
