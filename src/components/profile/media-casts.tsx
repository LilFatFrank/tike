"use client";
import { EmbedRenderer } from "@/components";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useNeynarContext } from "@neynar/react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useInfiniteQuery } from "react-query";
import { VirtuosoGrid } from "react-virtuoso";

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
    }: {
      pageParam?: string;
      queryKey: any;
    }): Promise<ApiResponse> => {
      const [_key, { fid, viewerFid }] = queryKey;
      const response = await fetch(`/api/profile-casts`, {
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
    ["media-casts", { fid: fid, viewerFid: user?.fid || 3 }],
    fetchProfileCasts,
    {
      getNextPageParam: (lastPage) => {
        return lastPage.next?.cursor ?? false;
      },
      refetchOnWindowFocus: false,
      staleTime: 60000,
      cacheTime: 3600000,
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
      if (!data) return null;
      const cast = allCasts[index];

      return (
        <div
          key={`media-${cast.hash}`}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            router.push(`/cast/${cast.parent_hash || cast.hash}`);
          }}
          className="cursor-pointer w-full aspect-square rounded-[12px] grid-item"
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
            className={`object-cover w-full h-full ${cast.embedType === "youtube" ? "min-h-[auto]" : ""}`}
            key={`profile-media-${cast.hash}`}
          />
        </div>
      );
    },
    [data, router]
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

  const totalItemCount =
    data?.pages.reduce((sum, page) => sum + page.casts.length, 0) ?? 0;

  return (
    <VirtuosoGrid
      useWindowScroll={isMobile}
      totalCount={totalItemCount}
      overscan={200}
      components={{
        Footer,
      }}
      itemContent={renderItem}
      endReached={handleFetchNextPage}
      style={{
        height: isMobile ? undefined : 800,
        scrollbarWidth: "none",
      }}
      listClassName="grid grid-cols-3 gap-2 mt-4 mb-2 grid-container"
    />
  );
}
