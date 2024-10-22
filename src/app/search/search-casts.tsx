"use client";
import { EmbedRenderer, StringProcessor } from "@/components";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useRouter } from "next/navigation";
import { FC, memo, useCallback, useMemo } from "react";
import { useInfiniteQuery } from "react-query";
import { Virtuoso } from "react-virtuoso";
import { toast } from "sonner";

const CastItem = memo(
  ({
    cast,
    router,
    index,
    arr,
  }: {
    cast: any;
    router: any;
    index: number;
    arr: any;
  }) => (
    <span
      onClick={() => router.push(`/cast/${cast.parent_hash || cast.hash}`)}
      className="cursor-pointer"
    >
      <div className="w-full py-[20px] flex items-start justify-between gap-[10px]">
        <div className="grow flex flex-col items-start gap-[2px]">
          <span
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              router.push(`/profile/${cast?.author?.fid}`);
            }}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-start gap-1">
              <img
                src={cast?.author?.pfp_url}
                alt={cast?.author?.username}
                className="w-[22px] h-[22px] rounded-full object-cover"
                width={22}
                height={22}
                loading="lazy"
                style={{ aspectRatio: "1 / 1" }}
              />
              <p className="font-bold text-[18px] leading-auto">
                {cast?.author?.display_name}
              </p>
            </div>
          </span>
          <p className="font-normal text-[12px] leading-auto text-gray-text-1 break-normal text-ellipsis whitespace-nowrap overflow-hidden w-[60ch]">
            <StringProcessor
              inputString={cast?.text ?? ""}
              mentionedProfiles={cast?.mentioned_profiles}
            />
          </p>
        </div>
        <div className="w-[40px] h-[40px] rounded-[2px] flex-shrink-0">
          <EmbedRenderer
            type={cast?.embedType}
            url={cast?.embeds[0].url}
            author={cast?.author?.username}
            index={`${cast.parent_hash || cast.hash}`}
          />
        </div>
      </div>
      {index === arr.length - 1 ? null : (
        <hr className="border border-t-divider" />
      )}
    </span>
  )
);

interface ApiResponse {
  casts: any;
  next: { cursor: string };
}

interface SearchCasts {
  input: string;
}

const SearchCasts: FC<SearchCasts> = memo(({ input }) => {
  const router = useRouter();

  const fetchSearchCasts = useCallback(
    async ({
      pageParam = "",
      queryKey,
      signal,
    }: {
      pageParam?: string;
      queryKey: any;
      signal?: AbortSignal;
    }): Promise<ApiResponse> => {
      const [_key, { q }] = queryKey;
      const response = await fetch(`/api/search-casts`, {
        method: "POST",
        body: JSON.stringify({ cursor: pageParam, q }),
        signal,
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
  } = useInfiniteQuery(
    ["search-casts", { q: input }],
    ({ pageParam, queryKey, signal }) =>
      fetchSearchCasts({ pageParam, queryKey, signal }),
    {
      getNextPageParam: (lastPage) => {
        return lastPage.next?.cursor ?? false;
      },
      refetchOnWindowFocus: false,
      enabled: !!input,
      staleTime: 60000,
      cacheTime: 3600000,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      onError: (error) => {
        console.log("Error fetching casts:", error);
        toast.error("Error fetching casts!");
      },
    }
  );

  const allCasts = useMemo(
    () => data?.pages.flatMap((page) => page.casts) ?? [],
    [data]
  );

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    (index: number) => {
      const cast = allCasts[index];
      return cast?.embeds[0]?.url ? (
        <CastItem
          cast={cast}
          router={router}
          key={cast.parent_hash || cast.hash}
          arr={allCasts}
          index={index}
        />
      ) : null;
    },
    [allCasts, router]
  );

  const Footer = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <div className="p-2 flex flex-col items-start justify-start h-full gap-2 bg-white">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              className="animate-pulse w-full h-[120px] rounded-lg bg-divider"
              key={index}
            />
          ))}
        </div>
      );
    }
    return null;
  }, [isFetchingNextPage, allCasts, hasNextPage]);

  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="p-2 flex flex-col items-start justify-start h-full gap-2 bg-white">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            className="animate-pulse w-full h-[120px] rounded-lg bg-divider"
            key={index}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return null;
  }

  return (
    <div className="flex-1 bg-white min-h-full">
      <Virtuoso
        style={{ height: "100dvh", width: "100%", scrollbarWidth: "none" }}
        data={allCasts}
        endReached={loadMore}
        overscan={200}
        itemContent={renderItem}
        useWindowScroll={isMobile}
        components={{
          Footer,
        }}
      />
    </div>
  );
});

export default SearchCasts;
