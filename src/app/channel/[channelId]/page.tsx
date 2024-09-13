"use client";
import { Cast, Frame, ProfileButton, StringProcessor } from "@/components";
import formatNumber from "@/utils/formatNumber";
import { useNeynarContext } from "@neynar/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FC, memo, useCallback, useEffect, useMemo, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "react-query";

const CastItem = memo(({ cast, router }: { cast: any; router: any }) => {
  return (
    <span
      onClick={() => router.push(`/cast/${cast.parent_hash || cast.hash}`)}
      className="cursor-pointer"
    >
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
    </span>
  );
});

const CastsList = memo(({ casts, router }: { casts: any; router: any }) => {
  return casts.map((cast: any, castIndex: number, arr: any[]) =>
    cast.embeds[0].url ? (
      <div key={cast.hash}>
        <CastItem cast={cast} router={router} />
        {castIndex === arr.length - 1 ? null : (
          <hr className="border border-t-divider" />
        )}
      </div>
    ) : null
  );
});

interface ApiResponse {
  casts: any;
  next: { cursor: string };
}

const Channel: FC<{ params: { channelId: number } }> = memo(({ params }) => {
  const { user } = useNeynarContext();
  const router = useRouter();

  const fetchChannelCasts = useCallback(
    async ({
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
      staleTime: 60000,
      cacheTime: 3600000,
    }
  );

  const { ref, inView } = useInView({
    threshold: 0.1,
  });

  const handleFetchNextPage = useCallback(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  useEffect(() => {
    handleFetchNextPage();
  }, [handleFetchNextPage]);

  const allChannelCasts = useMemo(
    () => data?.pages.flatMap((page) => page.casts) ?? [],
    [data]
  );

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

  const followChannel = async () => {
    const res = await fetch("/api/follow-channel", {
      method: "POST",
      body: JSON.stringify({
        channelId: channelPro?.id,
        uuid: user?.signer_uuid,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setChannelPro({
        ...channelPro,
        ["viewer_context"]: {
          ...channelPro?.viewer_context,
          following: !channelPro?.viewer_context?.following,
        },
      });
    }
  };

  const unfollowChannel = async () => {
    const res = await fetch("/api/unfollow-channel", {
      method: "POST",
      body: JSON.stringify({
        channelId: channelPro?.id,
        uuid: user?.signer_uuid,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setChannelPro({
        ...channelPro,
        ["viewer_context"]: {
          ...channelPro?.viewer_context,
          following: !channelPro?.viewer_context?.following,
        },
      });
    }
  };

  useEffect(() => {
    if (params.channelId) fetchChannelProfile();
  }, [params.channelId]);

  const channelCastsLoader = () => {
    return (
      <div ref={ref}>
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
  };

  return (
    <div className="w-full h-full">
      <Image
        className="w-full h-full object-cover z-[-1] fixed md:w-[550px] md:rounded-[20px]"
        src="/images/profile-background.png"
        alt="background"
        width={550}
        height={550}
        quality={100}
      />
      <div className="w-full relative min-h-full top-[120px] bg-white rounded-t-[20px] py-[10px] px-[16px]">
        {errorCh ? (
          <div className="p-4 text-center">
            <p>Could not fetch channel profile</p>
          </div>
        ) : loadingCh ? (
          <div className="p-4">
            <div className="flex flex-col items-start justify-start gap-3 mt-3 w-full">
              <div className="flex items-center justify-between w-full">
                <div />
                <div className="w-1/2 rounded-[12px] h-[40px] bg-divider animate-pulse" />
              </div>
              <div className="animate-pulse w-full h-[50px] bg-divider rounded-lg" />
              <div className="animate-pulse w-full h-[70px] bg-divider rounded-lg" />
              <div className="animate-pulse w-full h-[20px] bg-divider rounded-lg" />
            </div>
          </div>
        ) : (
          <>
            <Image
              src={channelPro?.image_url}
              alt={channelPro?.id}
              className="w-[82px] h-[82px] rounded-[18px] absolute top-[-41px] left-[16px] object-cover border-4 border-white"
              width={82}
              height={82}
              quality={100}
              loading="lazy"
            />
            <div className="flex justify-end gap-2 items-center">
              {channelPro?.viewer_context?.following ? (
                <ProfileButton onClick={unfollowChannel}>
                  Unfollow
                </ProfileButton>
              ) : !channelPro?.viewer_context?.following ? (
                <ProfileButton buttonType="alternate" onClick={followChannel}>
                  Follow
                </ProfileButton>
              ) : null}
            </div>
            <div className="flex flex-col items-start justify-start gap-3 mt-[12px]">
              <div className="flex flex-col items-start gap-[2px]">
                <p className="font-bold text-[18px] leading-[auto] text-black">
                  {channelPro?.name}
                </p>
                <p className="font-medium text-[15px] leading-[auto] text-black-50">
                  /{channelPro?.id}
                </p>
              </div>
              <p className="font-normal">
                <StringProcessor
                  inputString={channelPro?.description ?? ""}
                  mentionedProfiles={[]}
                />
              </p>
              <div className="flex items-center justify-start gap-[12px]">
                <p className="text-[15px] leading-[auto] text-black-50 font-medium">
                  <span className="text-black font-bold mr-1">
                    {formatNumber(Number(channelPro?.follower_count))}
                  </span>
                  Followers
                </p>
              </div>
            </div>
            <InfiniteScroll
              loadMore={() => {}}
              hasMore={!!hasNextPage}
              initialLoad
              loader={
                isFetchingNextPage || !error ? channelCastsLoader() : undefined
              }
            >
              {isLoading ? (
                channelCastsLoader()
              ) : (
                <CastsList casts={allChannelCasts} router={router} />
              )}
            </InfiniteScroll>
          </>
        )}
        <div style={{ height: "80px" }} />
      </div>
    </div>
  );
});

export default Channel;
