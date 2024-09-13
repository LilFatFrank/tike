import { useNeynarContext } from "@neynar/react";
import React, { FC, memo, useCallback, useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "react-query";
import LikeUpdate from "./like-update";
import ReplyUpdate from "./reply-update";
import RecastUpdate from "./recast-update";
import FollowUpdate from "./follow-update";
import { Virtuoso } from "react-virtuoso";

const NotificationItem = memo(
  ({
    notification,
    index,
    arr,
  }: {
    notification: any;
    index: number;
    arr: any[];
  }) => {
    switch (notification.type) {
      case "likes":
        return (
          <>
            <LikeUpdate
              cast={{
                hash: notification.cast.hash,
                parent_hash: notification.cast.parent_hash,
                text: notification.cast.text,
              }}
              fid={notification.reactions[0].user.fid}
              icon="/icons/like-update-icon.svg"
              userName={notification.reactions[0].user.display_name}
              userPfp={notification.reactions[0].user.pfp_url}
              key={`like-${index}`}
            />

            {index !== arr.length - 1 && (
              <hr className="border border-t-divider" />
            )}
          </>
        );
      case "reply":
        return (
          <>
            <ReplyUpdate
              cast={{
                hash: notification.cast.hash,
                parent_hash: notification.cast.parent_hash,
                text: notification.cast.text,
              }}
              fid={notification.cast.author.fid}
              icon="/icons/reply-update-icon.svg"
              userName={notification.cast.author.display_name}
              userPfp={notification.cast.author.pfp_url}
              key={`reply-${index}`}
            />

            {index !== arr.length - 1 && (
              <hr className="border border-t-divider" />
            )}
          </>
        );
      case "recasts":
        return (
          <>
            <RecastUpdate
              cast={{
                hash: notification.cast.hash,
                parent_hash: notification.cast.parent_hash,
                text: notification.cast.text,
              }}
              fid={notification.cast.author.fid}
              icon="/icons/recast-update-icon.svg"
              userName={notification.reactions[0].user.display_name}
              userPfp={notification.reactions[0].user.pfp_url}
              key={`recast-${index}`}
            />

            {index !== arr.length - 1 && (
              <hr className="border border-t-divider" />
            )}
          </>
        );
      case "follows":
        return (
          <>
            <FollowUpdate
              icon="/icons/follow-update-icon.svg"
              follows={notification.follows.map((f: any) => ({
                pfp: f.user.pfp_url,
                display_name: f.user.display_name,
                fid: f.user.fid,
              }))}
            />

            {index !== arr.length - 1 && (
              <hr className="border border-t-divider" />
            )}
          </>
        );
      default:
        return null;
    }
  }
);

interface ApiResponse {
  notifications: any;
  next: { cursor: string };
}

const fetchNotifications = async ({
  pageParam = "",
  queryKey,
}: {
  pageParam?: string;
  queryKey: any;
}): Promise<ApiResponse> => {
  const [_key, { fid, filter }] = queryKey;
  const response = await fetch(`/api/for-you-notifications`, {
    method: "POST",
    body: JSON.stringify({ cursor: pageParam, fid, filter }),
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  return data;
};

const ForYou: FC = memo(() => {
  const { user } = useNeynarContext();

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    ["notifications", { fid: user?.fid || 3 }],
    fetchNotifications,
    {
      getNextPageParam: (lastPage) => {
        return lastPage.next?.cursor ?? false;
      },
      refetchOnWindowFocus: false,
      staleTime: 60000,
      cacheTime: 3600000,
    }
  );

  const handleFetchNextPage = useCallback(() => {
    if (hasNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage]);

  const allNotifications = useMemo(
    () => data?.pages.flatMap((page) => page.notifications) ?? [],
    [data]
  );

  const Footer = useCallback(() => {
    return isFetchingNextPage ? renderLoadingMore() : null;
  }, [isFetchingNextPage]);

  const renderLoadingMore = () => (
    <div className="p-2 flex flex-col items-start justify-start gap-2 h-full bg-white">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          className="animate-pulse w-full h-[80px] rounded-lg bg-divider"
          key={index}
        />
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-2 flex flex-col items-start justify-start gap-2 h-full bg-white">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            className="animate-pulse w-full h-[80px] rounded-lg bg-divider"
            key={index}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="w-full items-center justify-center py-2 text-center">
        Error fetching updates!
      </p>
    );
  }

  return (
    <>
      <Virtuoso
        style={{ height: "100dvh" }}
        data={allNotifications}
        endReached={handleFetchNextPage}
        itemContent={(index, notification) => (
          <NotificationItem
            notification={notification}
            index={index}
            arr={allNotifications}
          />
        )}
        components={{ Footer }}
      />
    </>
  );
});

export default ForYou;
