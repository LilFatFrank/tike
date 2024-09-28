"use client";
import { Virtuoso } from "react-virtuoso";
import { Cast, Frame } from "@/components";
import { useNeynarContext } from "@neynar/react";
import { useRouter } from "next/navigation";
import { FC, memo, useCallback, useEffect, useState } from "react";
import { useInfiniteQuery } from "react-query";

const ReplyItem = memo(({ cast, push }: { cast: any; push: any }) => {
  return (
    <span onClick={() => push(`/cast/${cast.hash}`)} className="cursor-pointer">
      {cast.embedType === "frame" ? (
        <Frame frame={cast} key={`cast-${cast.hash}`} type="reply" />
      ) : (
        <Cast cast={cast} key={`cast-${cast.hash}`} type="reply" />
      )}
    </span>
  );
});

const LoadingSkeleton = () => (
  <div className="p-4 flex items-start justify-center h-full bg-white">
    <div className="py-5 w-full">
      <div className="flex items-center flex-col justify-start w-full gap-3">
        <div className="flex items-center gap-2 w-full">
          <div className="h-[40px] w-[40px] rounded-full bg-divider animate-pulse flex-shrink-0" />
          <div className="animate-pulse grow h-[36px] bg-divider rounded-lg" />
        </div>
        <div className="animate-pulse w-full h-[360px] bg-divider rounded-lg" />
        <div className="animate-pulse w-full h-[20px] bg-divider rounded-lg" />
      </div>
    </div>
  </div>
);

interface ApiResponse {
  conversation: any;
  next: { cursor: string };
}

const Page: FC<{ params: { hash: string } }> = memo(({ params }) => {
  const { user } = useNeynarContext();
  const [cast, setCast] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { back, push } = useRouter();

  const fetchConversation = useCallback(
    async ({
      pageParam = "",
      queryKey,
    }: {
      pageParam?: string;
      queryKey: any;
    }): Promise<ApiResponse> => {
      const [_key, { hash, fid }] = queryKey;
      const response = await fetch(`/api/conversation`, {
        method: "POST",
        body: JSON.stringify({ cursor: pageParam, hash, fid }),
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
    error: conversationError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    ["casts", { fid: user?.fid || 3, hash: params.hash }],
    fetchConversation,
    {
      getNextPageParam: (lastPage) => {
        return lastPage.next?.cursor ?? false;
      },
      refetchOnWindowFocus: false,
      staleTime: 60000,
      cacheTime: 3600000,
    }
  );

  const allReplies =
    data?.pages.flatMap((page) => page.conversation.cast.direct_replies) ?? [];

  const fetchCast = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await fetch(`/api/cast`, {
        method: "POST",
        body: JSON.stringify({
          hash: params.hash,
          fid: user?.fid,
        }),
      });
      const data = await resp.json();
      if (data.error) {
        setError(true);
        return;
      }
      setCast(data);
    } catch (error) {
      console.log(error);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (params.hash) fetchCast();
  }, [params.hash, fetchCast]);
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const Header = useCallback(
    () => (
      <>
        <div className="py-3 px-4 flex items-center gap-1">
          <img
            src="/icons/back-icon.svg"
            alt="back"
            width={24}
            height={24}
            className="cursor-pointer"
            onClick={back}
            style={{ aspectRatio: "1/1" }}
            loading="lazy"
          />
          <p className="text-[20px] font-medium leading-[100%]">Post</p>
        </div>
        {cast ? (
          cast.frames ? (
            <Frame frame={cast} />
          ) : (
            <Cast cast={cast} />
          )
        ) : null}
      </>
    ),
    [cast, back]
  );

  const Footer = useCallback(() => {
    if (conversationError) {
      return (
        <p className="w-full items-center justify-center py-2 text-center text-red-500">
          Error fetching conversation. Please try again.
        </p>
      );
    }
    return isFetchingNextPage ? <LoadingSkeleton /> : null;
  }, [isFetchingNextPage, conversationError]);

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="flex-1 bg-white min-h-full">
        <div className="py-3 px-4 flex items-center gap-1">
          <img
            src="/icons/back-icon.svg"
            alt="back"
            width={24}
            height={24}
            className="cursor-pointer"
            onClick={back}
            style={{ aspectRatio: "1/1" }}
            loading="lazy"
          />
          <p className="text-[20px] font-medium leading-[100%]">Post</p>
        </div>
        <p className="w-full items-start justify-center py-2 text-center h-full bg-white">
          Could not fetch cast!
        </p>
      </div>
    );
  }

  if (conversationError) {
    return (
      <div className="flex-1 bg-white min-h-full">
        <Header />
        <p className="w-full items-center justify-center py-2 text-center text-red-500">
          Error fetching conversation. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white min-h-full">
      <Virtuoso
        style={{ height: "100vh", width: "100%" }}
        data={allReplies}
        endReached={loadMore}
        overscan={200}
        components={{
          Header,
          Footer,
        }}
        itemContent={(index, reply) => (
          <>
            <ReplyItem cast={reply} push={push} />
            {index < allReplies.length - 1 && (
              <hr className="border border-t-divider" />
            )}
          </>
        )}
      />
    </div>
  );
});

export default Page;
