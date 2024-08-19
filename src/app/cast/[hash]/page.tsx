"use client";
import { Cast, Frame, Spinner } from "@/components";
import { useNeynarContext } from "@neynar/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "react-query";

interface ApiResponse {
  conversation: any;
  next: { cursor: string };
}

const fetchConversation = async ({
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
};

export default function Page({ params }: { params: { hash: string } }) {
  const { user } = useNeynarContext();

  const [cast, setCast] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { back } = useRouter();

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
    }
  );

  const { ref, inView } = useInView({
    threshold: 0.3,
  });

  const allReplies =
    data?.pages.flatMap((page) => page.conversation.cast.direct_replies) ?? [];

  const fetchCast = async () => {
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
  };

  useEffect(() => {
    if (params.hash) fetchCast();
  }, [params.hash]);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (loading)
    return (
      <div className="p-4 flex items-start justify-center h-full bg-white">
        <Spinner />
      </div>
    );

  if (error)
    return (
      <p className="w-full items-center justify-center py-2 text-center">
        Could not fetch cast!
      </p>
    );

  return (
    <div className="flex-1 bg-white">
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
            <Link href={`/cast/${cast.hash}`}>
              {cast.embedType === "frame" ? (
                <Frame frame={cast} key={`cast-${cast.hash}`} type="reply" />
              ) : (
                <Cast cast={cast} key={`cast-${cast.hash}`} type="reply" />
              )}
              {castIndex === arr.length - 1 ? null : (
                <hr className="border border-t-divider" />
              )}
            </Link>
          ))}

          {isFetchingNextPage || isLoading ? (
            <div className="p-2">
              <Spinner />
            </div>
          ) : null}

          <div ref={ref} style={{ height: "20px" }}></div>
        </>
      )}
    </div>
  );
}
