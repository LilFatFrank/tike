"use client";
import { Cast, Frame } from "@/components";
import { useNeynarContext } from "@neynar/react";
import { useRouter } from "next/navigation";
import { FC, Fragment, memo, useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
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

  const { ref, inView } = useInView({
    threshold: 0.3,
  });

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
  }, [params.hash]);

  useEffect(() => {
    if (params.hash) fetchCast();
  }, [params.hash, fetchCast]);

  const handleFetchNextPage = useCallback(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  useEffect(() => {
    handleFetchNextPage();
  }, [handleFetchNextPage]);

  if (loading) return <LoadingSkeleton />;

  if (error)
    return (
      <p className="w-full items-start justify-center py-2 text-center h-full bg-white">
        Could not fetch cast!
      </p>
    );

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

      {conversationError ? (
        <p className="w-full items-center justify-center py-2 text-center">
          Error fetching conversation!
        </p>
      ) : (
        <>
          {allReplies.map((cast, castIndex, arr) => (
            <Fragment key={cast.hash}>
              <ReplyItem cast={cast} push={push} />
              {castIndex === arr.length - 1 ? null : (
                <hr className="border border-t-divider" />
              )}
            </Fragment>
          ))}

          {isFetchingNextPage || isLoading ? <LoadingSkeleton /> : null}

          <div ref={ref} style={{ height: "20px" }}></div>
        </>
      )}
    </div>
  );
});

export default Page;
