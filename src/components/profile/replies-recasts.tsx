"use client";
import { Cast, Frame } from "@/components";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useNeynarContext } from "@neynar/react";
import { useRouter } from "next/navigation";
import { memo, useCallback, useMemo } from "react";
import { useInfiniteQuery } from "react-query";
import { Virtuoso } from "react-virtuoso";
import { toast } from "sonner";

interface ApiResponse {
  casts: any;
  next: { cursor: string };
}

export default function RepliesRecasts({ fid }: { fid: string }) {
  const { user } = useNeynarContext();

  const fetchRepliesRecasts = useCallback(
    async ({
      pageParam = "",
      queryKey,
      signal,
    }: {
      pageParam?: string;
      queryKey: any;
      signal?: AbortSignal;
    }): Promise<ApiResponse> => {
      const [_key, { fid, viewerFid }] = queryKey;
      const response = await fetch(`/api/replies-recasts`, {
        method: "POST",
        body: JSON.stringify({ cursor: pageParam, fid, viewerFid }),
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
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
  } = useInfiniteQuery(
    ["replies-recasts", { fid: fid, viewerFid: user?.fid || 3 }],
    ({ pageParam, queryKey, signal }) =>
      fetchRepliesRecasts({ pageParam, queryKey, signal }),
    {
      getNextPageParam: (lastPage) => {
        return lastPage.next?.cursor ?? false;
      },
      refetchOnWindowFocus: false,
      staleTime: 60000,
      cacheTime: 3600000,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      onError: (err) => {
        console.log(err);
        toast.error("Error fetching replies and recasts!");
      },
    }
  );

  const router = useRouter();

  const handleFetchNextPage = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

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
    <p className="w-full py-2 text-center bg-white min-h-full">
      Error fetching casts!
    </p>
  );

  const renderItem = useCallback(
    (index: number) => {
      const cast = allCasts[index];
      return (
        <span
          onClick={() => router.push(`/cast/${cast.parent_hash || cast.hash}`)}
          key={`replies-recast-${cast.parent_hash || cast.hash}`}
          className="cursor-pointer"
        >
          {cast.embedType === "frame" ? (
            <MemoizedFrame
              frame={cast}
              key={`cast-${cast.hash}`}
              style={{ paddingLeft: "0px", paddingRight: "0px" }}
            />
          ) : (
            <MemoizedCast
              cast={cast}
              key={`cast-${cast.hash}`}
              style={{ paddingLeft: "0px", paddingRight: "0px" }}
            />
          )}
          {index === allCasts.length - 1 ||
          (cast.embedType === "frame" && !cast.frames) ? null : (
            <hr className="border border-t-divider" />
          )}
        </span>
      );
    },
    [allCasts, router]
  );

  const Footer = useCallback(() => {
    return isFetchingNextPage ? renderLoadingMore() : null;
  }, [isFetchingNextPage]);

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

  const isMobile = useIsMobile();

  if (isLoading) return renderLoadingState();

  if (error) return renderError();

  return (
    <Virtuoso
      data={allCasts}
      endReached={handleFetchNextPage}
      itemContent={renderItem}
      useWindowScroll={isMobile}
      components={{
        Footer,
      }}
      style={{ height: "100dvh", scrollbarWidth: "none" }}
    />
  );
}
