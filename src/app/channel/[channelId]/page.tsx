"use client";
import { Cast, Frame, Spinner } from "@/components";
import formatNumber from "@/utils/formatNumber";
import { useNeynarContext } from "@neynar/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "react-query";

interface ApiResponse {
  casts: any;
  next: { cursor: string };
}

const fetchChannelCasts = async ({
  pageParam = "",
  queryKey,
}: {
  pageParam?: string;
  queryKey: any;
}): Promise<ApiResponse> => {
  const [_key, { viewerFid, channelId }] = queryKey;
  const response = await fetch(`/api/channel-casts`, {
    method: "POST",
    body: JSON.stringify({ cursor: pageParam, viewerFid, channelId }),
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  return data;
};

export default function Page({ params }: { params: { channelId: number } }) {
  const { user } = useNeynarContext();

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    [
      "channel-casts",
      { viewerFid: user?.fid || 3, channelId: params.channelId },
    ],
    fetchChannelCasts,
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

  const allChannelCasts = data?.pages.flatMap((page) => page.casts) ?? [];

  const [channelPro, setChannelPro] = useState<any | undefined>();
  const [errorCh, setErrorCh] = useState(false);
  const [loadingCh, setLoadingCh] = useState(false);

  const fetchChannelProfile = async () => {
    try {
      setLoadingCh(true);
      const res = await fetch(`/api/channel-profile`, {
        method: "POST",
        body: JSON.stringify({
          channelId: params.channelId,
          viewerFid: user?.fid,
        }),
      });
      const data = await res.json();
      console.log(data);
      setChannelPro(data.channel);
    } catch (error) {
      console.log(error);
      setErrorCh(true);
    } finally {
      setLoadingCh(false);
    }
  };

  useEffect(() => {
    if (params.channelId) fetchChannelProfile();
  }, [params.channelId]);

  if (error) {
    <p className="w-full items-center justify-center py-2 text-center">
      Error fetching casts!
    </p>;
  }

  return (
    <div className="w-full h-full">
      <img
        className="w-full h-full object-cover z-[-1] fixed md:w-[550px] md:rounded-[20px]"
        src="/images/profile-background.png"
        alt="background"
      />
      <div className="w-full relative min-h-full top-[120px] bg-white rounded-t-[20px] py-[10px] px-[16px]">
        {errorCh ? (
          <div className="p-4 text-center">
            <p>Could not fetch user profile</p>
          </div>
        ) : loadingCh ? (
          <div className="p-4">
            <Spinner />
          </div>
        ) : (
          <>
            <img
              src={channelPro?.image_url}
              alt={channelPro?.id}
              className="w-[82px] h-[82px] rounded-[18px] absolute top-[-41px] left-[16px] object-cover border-4 border-white"
            />
            <div className="flex flex-col items-start justify-start gap-3 mt-[40px]">
              <div className="flex flex-col items-start gap-[2px]">
                <p className="font-bold text-[18px] leading-[auto] text-black">
                  {channelPro?.name}
                </p>
                <p className="font-medium text-[15px] leading-[auto] text-black-50">
                  /{channelPro?.id}
                </p>
              </div>
              <p className="font-normal">{channelPro?.description}</p>
              <div className="flex items-center justify-start gap-[12px]">
                <p className="text-[15px] leading-[auto] text-black-50 font-medium">
                  <span className="text-black font-bold mr-1">
                    {formatNumber(Number(channelPro?.follower_count))}
                  </span>
                  Followers
                </p>
              </div>
            </div>
            {allChannelCasts.map((cast, castIndex, arr) =>
              cast.embeds[0].url ? (
                <Link href={`/cast/${cast.parent_hash || cast.hash}`}>
                  {cast.embedType === "frame" ? (
                    <Frame
                      frame={cast}
                      key={`channel-cast-${cast.hash}`}
                      style={{ paddingRight: 0, paddingLeft: 0 }}
                    />
                  ) : (
                    <Cast
                      cast={cast}
                      key={`channel-cast-${cast.hash}`}
                      style={{ paddingRight: 0, paddingLeft: 0 }}
                    />
                  )}
                  {castIndex === arr.length - 1 ? null : (
                    <hr className="border border-t-divider" />
                  )}
                </Link>
              ) : null
            )}

            {(isFetchingNextPage || isLoading) && !error ? (
              <div className="p-2">
                <Spinner />
              </div>
            ) : null}

            <div ref={ref} style={{ height: "80px" }}></div>

            {allChannelCasts && allChannelCasts.length && !hasNextPage ? (
              <p className="w-full items-center justify-center py-2 text-center">
                End of the line!
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
