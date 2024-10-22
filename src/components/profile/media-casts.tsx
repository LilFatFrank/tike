"use client";
import { EmbedRenderer } from "@/components";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useNeynarContext } from "@neynar/react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useInfiniteQuery } from "react-query";
import { Virtuoso } from "react-virtuoso";
import { toast } from "sonner";

interface ApiResponse {
  casts: any;
  next: { cursor: string };
}

export default function MediaCasts({ fid }: { fid: string }) {
  const { user } = useNeynarContext();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchProfileCasts = useCallback(
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
      const response = await fetch(`/api/profile-casts`, {
        method: "POST",
        body: JSON.stringify({ cursor: pageParam, fid, viewerFid }),
        signal
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
    ["media-casts", { fid: fid, viewerFid: user?.fid || 3 }],
    ({ pageParam, queryKey, signal }) => fetchProfileCasts({ pageParam, queryKey, signal }),
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
        toast.error("Error fetching media casts!");
      },
    }
  );

  const router = useRouter();

  const allCasts = useMemo(
    () => data?.pages.flatMap((page) => page.casts) ?? [],
    [data]
  );

  const handleFetchNextPage = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage && !isLoadingMore) {
      setIsLoadingMore(true);
      await fetchNextPage();
      setIsLoadingMore(false);
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, isLoadingMore]);

  const renderLoadingState = () => (
    <div className="pt-2">
      <div
        className="grid grid-cols-3 gap-2 w-full"
        key={`profile-media-loader`}
      >
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            className="aspect-square rounded-[12px] bg-divider animate-pulse w-full"
            key={index}
          />
        ))}
      </div>
    </div>
  );

  const renderError = () => (
    <p className="w-full py-2 text-center bg-white min-h-full">
      Error fetching casts!
    </p>
  );

  const renderItem = useCallback(
    (index: number) => {
      const startIndex = index * 3;
      const endIndex = Math.min(startIndex + 3, allCasts.length);

      const rowItems = allCasts.slice(startIndex, endIndex).map((cast, idx) => {
        if (!cast) return null;

        return (
          <div
            key={`media-${cast.hash}`}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              router.push(`/cast/${cast.parent_hash || cast.hash}`);
            }}
            className="cursor-pointer w-full aspect-square rounded-[12px] mb-2"
            style={{ width: `33%` }}
          >
            <EmbedRenderer
              type={
                cast.embedType === "audio" || cast.embedType === "frame"
                  ? "image"
                  : cast.embedType
              }
              url={
                cast.embedType === "frame"
                  ? cast?.frames[0]?.image
                  : cast.embedType === "audio"
                  ? cast?.embeds[1]?.url
                  : cast?.embeds[0]?.url
              }
              author={cast?.author?.username}
              className={`object-cover w-full h-full ${
                cast.embedType === "youtube" ? "min-h-[auto]" : ""
              }`}
            />
          </div>
        );
      });

      return (
        <div className="flex flex-row gap-2 w-full" key={`row-${index}`}>
          {rowItems}
        </div>
      );
    },
    [allCasts, router]
  );

  const Footer = useCallback(() => {
    return isFetchingNextPage ? renderLoadingMore() : null;
  }, [isFetchingNextPage]);

  const renderLoadingMore = () => (
    <>
      <div
        className="grid grid-cols-3 gap-2 w-full"
        key={`profile-media-loader`}
      >
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            className="aspect-square rounded-[12px] bg-divider animate-pulse w-full"
            key={index}
          />
        ))}
      </div>
    </>
  );

  const isMobile = useIsMobile();

  if (isLoading) return renderLoadingState();

  if (error) return renderError();

  return (
    <Virtuoso
      totalCount={Math.ceil(allCasts.length / 3)}
      data={allCasts}
      itemContent={renderItem}
      endReached={handleFetchNextPage}
      components={{
        Footer,
      }}
      useWindowScroll={isMobile}
      style={{
        height: "100vh",
        scrollbarWidth: "none",
        marginTop: "8px",
      }}
    />
  );
}
