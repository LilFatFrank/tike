"use client";
import { Cast, Spinner } from "@/components";
import { useNeynarContext } from "@neynar/react";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "react-query";

interface ApiResponse {
  casts: any;
  next: { cursor: string };
}

const fetchCasts = async ({
  pageParam = "",
  queryKey,
}: {
  pageParam?: string;
  queryKey: any;
}): Promise<ApiResponse> => {
  const [_key, { fid }] = queryKey;
  const response = await fetch(`/api/casts`, {
    method: "POST",
    body: JSON.stringify({ cursor: pageParam, fid }),
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  return data;
};

export default function Home() {
  const { user } = useNeynarContext();

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(["casts", { fid: user?.fid || 3 }], fetchCasts, {
    getNextPageParam: (lastPage) => {
      return lastPage.next?.cursor ?? false;
    },
    refetchOnWindowFocus: false,
  });

  const { ref, inView } = useInView({
    threshold: 0.3,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {(error as Error).message}</div>;

  const allCasts = data?.pages.flatMap((page) => page.casts) ?? [];

  return (
    <>
      {allCasts.map((cast, castIndex, arr) =>
        cast.embeds[0].url ? (
          <>
            <Cast cast={cast} key={castIndex} />
            {castIndex === arr.length - 1 ? null : (
              <hr className="border border-t-divider" />
            )}
          </>
        ) : null
      )}

      {isFetchingNextPage && <Spinner />}

      <div ref={ref} style={{ height: "20px" }}></div>

      {!hasNextPage && (
        <div className="w-full items-center">End of the line!</div>
      )}
    </>
  );
}
