"use client";
import { ActivityBar, Frame, Spinner, UserChannels } from "@/components";
import { useNeynarContext } from "@neynar/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "react-query";

interface ApiResponse {
  casts: any;
  next: { cursor: string };
}

const fetchFrames = async ({
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
};

export default function Frames() {
  const { user } = useNeynarContext();
  const router = useRouter();

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
  });

  const { ref, inView } = useInView({
    threshold: 0.3,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const allFrames = data?.pages.flatMap((page) => page.casts) ?? [];

  if (isLoading) {
    return (
      <div className="p-2 flex items-start justify-center h-full bg-white">
        <Spinner />
      </div>
    );
  }

  if (error) {
    <p className="w-full items-center justify-center py-2 text-center">
      Error fetching Frames!
    </p>;
  }

  return (
    <div className="flex-1 bg-white min-h-full">
      <ActivityBar />

      <UserChannels />
      {allFrames.map((frame, frameIndex, arr) =>
        frame.embeds[0].url ? (
          <span
            onClick={() =>
              router.push(`/cast/${frame.parent_hash || frame.hash}`)
            }
            key={`${frame.parent_hash || frame.hash}`}
            className="cursor-pointer"
          >
            <Frame frame={frame} key={`frame-${frame.hash}`} />
            {frameIndex === arr.length - 1 ? null : (
              <hr className="border border-t-divider" />
            )}
          </span>
        ) : null
      )}

      {isFetchingNextPage ? (
        <div className="p-2">
          <Spinner />
        </div>
      ) : null}

      <div ref={ref} style={{ height: "20px" }}></div>

      {allFrames && allFrames.length && !hasNextPage ? (
        <p className="w-full items-center justify-center py-2 text-center">
          End of the line!
        </p>
      ) : null}
    </div>
  );
}
