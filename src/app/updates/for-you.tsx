import { Spinner } from "@/components";
import { useNeynarContext } from "@neynar/react";
import { FC, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "react-query";
import LikeUpdate from "./like-update";
import ReplyUpdate from "./reply-update";
import RecastUpdate from "./recast-update";
import FollowUpdate from "./follow-update";

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

const ForYou: FC = () => {
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
    }
  );

  const { ref, inView } = useInView({
    threshold: 0.3,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const allNotifications =
    data?.pages.flatMap((page) => page.notifications) ?? [];

  if (isLoading) {
    return (
      <div className="p-2 flex items-start justify-center h-full bg-white">
        <Spinner />
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
      {allNotifications.map((an, i, arr) => (
        <>
          {an.type === "likes" ? (
            <LikeUpdate
              cast={{ hash: an.cast.hash, text: an.cast.text }}
              fid={an.reactions[0].user.fid}
              icon="/icons/like-update-icon.svg"
              userName={an.reactions[0].user.display_name}
              userPfp={an.reactions[0].user.pfp_url}
              key={`like-${i}`}
            />
          ) : an.type === "reply" ? (
            <ReplyUpdate
              cast={{ hash: an.cast.hash, text: an.cast.text }}
              fid={an.cast.author.fid}
              icon="/icons/reply-update-icon.svg"
              userName={an.cast.author.display_name}
              userPfp={an.cast.author.pfp_url}
              key={`reply-${i}`}
            />
          ) : an.type === "recasts" ? (
            <RecastUpdate
              cast={{ hash: an.cast.hash, text: an.cast.text }}
              fid={an.cast.author.fid}
              icon="/icons/recast-update-icon.svg"
              userName={an.reactions[0].user.display_name}
              userPfp={an.reactions[0].user.pfp_url}
              key={`recast-${i}`}
            />
          ) : an.type === "follows" ? (
            <FollowUpdate
              icon="/icons/follow-update-icon.svg"
              follows={an.follows.map((f: any) => ({
                pfp: f.user.pfp_url,
                display_name: f.user.display_name,
                fid: f.user.fid,
              }))}
            />
          ) : null}
          {i === arr.length - 1 ? null : (
            <hr className="border border-t-divider" />
          )}
        </>
      ))}

      {isFetchingNextPage ? (
        <div className="p-2">
          <Spinner />
        </div>
      ) : null}

      <div ref={ref} style={{ height: "20px" }}></div>

      {allNotifications && allNotifications.length && !hasNextPage ? (
        <p className="w-full items-center justify-center py-2 text-center">
          End of the line!
        </p>
      ) : null}
    </>
  );
};

export default ForYou;
