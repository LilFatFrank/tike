"use client";
import { ActivityBar, Cast, Frame, UserChannels } from "@/components";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useNeynarContext } from "@neynar/react";
import { useRouter } from "next/navigation";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Suspense,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useMemo,
  useState,
} from "react";
import { useInfiniteQuery } from "react-query";
import { Virtuoso } from "react-virtuoso";
import { toast } from "sonner";

interface SearchParamsHandlers {
  setFilterFromParams: (filter: "video" | "image" | "audio" | null) => void;
}

const SearchParamsWrapper = forwardRef<
  SearchParamsHandlers,
  { onFilterChange: (filter: "video" | "image" | "audio" | null) => void }
>(({ onFilterChange }, ref) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/") {
      const filterValue = searchParams?.get("filter") as
        | "video"
        | "image"
        | "audio"
        | null;
      onFilterChange(filterValue);
    }
  }, [searchParams, pathname, onFilterChange]);

  useImperativeHandle(
    ref,
    () => ({
      setFilterFromParams: onFilterChange,
    }),
    [onFilterChange]
  );

  return null;
});

SearchParamsWrapper.displayName = "SearchParamsWrapper";

interface ApiResponse {
  casts: any;
  next: { cursor: string };
}

interface UserChannelsResponse {
  channels: any;
  next: { cursor: string };
}

export default function Home() {
  const { user } = useNeynarContext();
  const [filter, setFilter] = useState<null | "video" | "image" | "audio">(
    null
  );
  const searchParamsRef = useRef<SearchParamsHandlers>(null);
  const router = useRouter();

  const handleFilterChange = useCallback((newFilter: typeof filter) => {
    setFilter(newFilter);
  }, []);

  const fetchUserChannels = useCallback(
    async ({
      pageParam = "",
      queryKey,
      signal,
    }: {
      pageParam?: string;
      queryKey: any;
      signal?: AbortSignal;
    }): Promise<UserChannelsResponse> => {
      const [_key, { fid }] = queryKey;
      const response = await fetch(`/api/user-channels`, {
        method: "POST",
        body: JSON.stringify({ cursor: pageParam, fid }),
        signal,
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return await response.json();
    },
    []
  );

  const {
    data: userChannelsData,
    fetchNextPage: fetchNextUserChannels,
    hasNextPage: hasNextUserChannels,
    isFetchingNextPage: isFetchingNextUserChannels,
  } = useInfiniteQuery(
    ["user-channels", { fid: user?.fid || 3 }],
    ({ pageParam, queryKey, signal }) =>
      fetchUserChannels({ pageParam, queryKey, signal }),
    {
      getNextPageParam: (lastPage) => lastPage.next?.cursor ?? false,
      refetchOnWindowFocus: false,
      staleTime: 60000,
      cacheTime: 3600000,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      onError: (error) => {
        console.error("Error fetching casts:", error);
        toast.error("Error fetching casts!");
      },
    }
  );

  const allUserChannels = useMemo(
    () => userChannelsData?.pages.flatMap((page) => page.channels) ?? [],
    [userChannelsData]
  );

  const fetchCasts = useCallback(
    async ({
      pageParam = "",
      queryKey,
      signal,
    }: {
      pageParam?: string;
      queryKey: any;
      signal?: AbortSignal;
    }): Promise<ApiResponse> => {
      const [_key, { fid, filter }] = queryKey;
      const response = await fetch(`/api/casts`, {
        method: "POST",
        body: JSON.stringify({ cursor: pageParam, fid, filter }),
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
    ["casts", { fid: user?.fid || 3, filter }],
    ({ pageParam, queryKey, signal }) =>
      fetchCasts({ pageParam, queryKey, signal }),
    {
      getNextPageParam: (lastPage) => {
        return lastPage.next?.cursor ?? false;
      },
      refetchOnWindowFocus: false,
      staleTime: 60000,
      cacheTime: 3600000,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      onError: (error) => {
        console.error("Error fetching casts:", error);
        toast.error("Error fetching casts!");
      },
    }
  );

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
          key={`${cast.parent_hash || cast.hash}`}
          className="cursor-pointer"
        >
          {cast.embedType === "frame" ? (
            <MemoizedFrame frame={cast} key={`cast-${cast.hash}`} />
          ) : (
            <MemoizedCast cast={cast} key={`cast-${cast.hash}`} />
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

  if (error) return renderError();

  return (
    <>
      <div className="flex-1 bg-white min-h-full">
        <Suspense fallback={null}>
          <SearchParamsWrapper
            ref={searchParamsRef}
            onFilterChange={handleFilterChange}
          />
        </Suspense>

        <ActivityBar />

        {isLoading ? (
          renderLoadingState()
        ) : (
          <Virtuoso
            data={allCasts}
            endReached={handleFetchNextPage}
            itemContent={renderItem}
            useWindowScroll={isMobile}
            components={{
              Footer,
              Header: () => (
                <UserChannels
                  channels={allUserChannels}
                  onLoadMore={fetchNextUserChannels}
                  hasNextPage={!!hasNextUserChannels}
                  isFetchingNextPage={isFetchingNextUserChannels}
                />
              ),
            }}
            style={{ height: "100dvh", scrollbarWidth: "none" }}
          />
        )}
      </div>
    </>
  );
}
