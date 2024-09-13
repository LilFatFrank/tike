"use client";
import { ActivityBar, Frame, UserChannels } from "@/components";
import { useNeynarContext } from "@neynar/react";
import { useRouter } from "next/navigation";
import React from "react";
import { FC, memo, useCallback, useMemo } from "react";
import { useInfiniteQuery } from "react-query";
import { Virtuoso } from "react-virtuoso";

interface ApiResponse {
  casts: any;
  next: { cursor: string };
}

interface UserChannelsResponse {
  channels: any;
  next: { cursor: string };
}

const Frames: FC = memo(() => {
  const { user } = useNeynarContext();
  const router = useRouter();

  const fetchUserChannels = useCallback(
    async ({
      pageParam = "",
      queryKey,
    }: {
      pageParam?: string;
      queryKey: any;
    }): Promise<UserChannelsResponse> => {
      const [_key, { fid }] = queryKey;
      const response = await fetch(`/api/user-channels`, {
        method: "POST",
        body: JSON.stringify({ cursor: pageParam, fid }),
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
    fetchUserChannels,
    {
      getNextPageParam: (lastPage) => lastPage.next?.cursor ?? false,
      refetchOnWindowFocus: false,
      staleTime: 60000,
      cacheTime: 3600000,
    }
  );

  const allUserChannels = useMemo(
    () => userChannelsData?.pages.flatMap((page) => page.channels) ?? [],
    [userChannelsData]
  );

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

  const handleFetchNextPage = useCallback(() => {
    if (hasNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage]);

  const allFrames = useMemo(
    () => data?.pages.flatMap((page) => page.casts) ?? [],
    [data]
  );

  const MemoizedFrame = memo(Frame);

  const renderItem = useCallback(
    (index: number) => {
      const cast = allFrames[index];
      return (
        <span
          onClick={() => router.push(`/cast/${cast.parent_hash || cast.hash}`)}
          key={`${cast.parent_hash || cast.hash}`}
          className="cursor-pointer"
        >
          {<MemoizedFrame frame={cast} key={`cast-${cast.hash}`} />}
          {index === allFrames.length - 1 ? null : (
            <hr className="border border-t-divider" />
          )}
        </span>
      );
    },
    [allFrames, router]
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

  const Footer = useCallback(() => {
    return isFetchingNextPage ? renderLoadingMore() : null;
  }, [isFetchingNextPage]);

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

  if (isLoading) {
    return renderLoadingState();
  }

  if (error) {
    <p className="w-full items-center justify-center py-2 text-center">
      Error fetching Frames!
    </p>;
  }

  return (
    <div className="flex-1 bg-white min-h-full">
      <ActivityBar />

      <Virtuoso
        data={allFrames}
        endReached={handleFetchNextPage}
        itemContent={renderItem}
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
        style={{ height: "100dvh" }}
      />
    </div>
  );
});

export default Frames;
