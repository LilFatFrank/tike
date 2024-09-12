"use client";
import { useNeynarContext } from "@neynar/react";
import { FC, memo, useCallback, useContext, useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "react-query";
import { AppContext } from "@/context";
import { SET_USER_CHANNELS } from "@/context/actions";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface ApiResponse {
  channels: any;
  next: { cursor: string };
}

const ChannelItem = memo(
  ({
    channel,
    onClick,
  }: {
    channel: { image_url: string; name: string };
    onClick: () => void;
  }) => (
    <span onClick={onClick} className="flex-shrink-0 cursor-pointer">
      <div className="flex flex-col items-center justify-center gap-1 cursor-pointer">
        <div className="w-[60px] h-[60px] rounded-[16px] border border-black-20 bg-frame-btn-bg">
          <Image
            src={channel.image_url}
            alt={channel.name}
            className="w-full h-full rounded-[16px] object-cover"
            width={60}
            height={60}
            loading="lazy"
          />
        </div>
        <p className="text-[11px] font-normal w-[9ch] text-center text-ellipsis overflow-hidden whitespace-nowrap">
          {channel.name}
        </p>
      </div>
    </span>
  )
);

const fetchChannels = async ({
  pageParam = "",
  queryKey,
}: {
  pageParam?: string;
  queryKey: any;
}): Promise<ApiResponse> => {
  const [_key, { fid }] = queryKey;
  const response = await fetch(`/api/user-channels`, {
    method: "POST",
    body: JSON.stringify({ cursor: pageParam, fid }),
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  return data;
};

const UserChannels: FC = memo(() => {
  const { user } = useNeynarContext();
  const [, dispatch] = useContext(AppContext);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(
      ["user-channels", { fid: user?.fid || 3 }],
      fetchChannels,
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

  const router = useRouter();

  const handleFetchNextPage = useCallback(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const allChannels = useMemo(
    () => data?.pages.flatMap((page) => page.channels) ?? [],
    [data]
  );

  useEffect(() => {
    if (inView && hasNextPage) {
      handleFetchNextPage();
    }
  }, [handleFetchNextPage]);

  useEffect(() => {
    dispatch({
      type: SET_USER_CHANNELS,
      payload: allChannels,
    });
  }, [allChannels, dispatch]);

  return (
    <div className="pt-[10px] pb-[20px] pl-[16px] flex items-center justify-start gap-4 overflow-x-auto whitespace-nowrap no-scrollbar">
      {allChannels.map((channel) => (
        <ChannelItem
          key={channel.id}
          channel={channel}
          onClick={() => {
            router.push(`/channel/${channel.id}`);
          }}
        />
      ))}

      {isFetchingNextPage ? (
        <div className="p-2 flex items-start justify-start gap-4 h-full bg-white">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              className="animate-pulse w-[62.5px] h-[80.5px] rounded-lg bg-divider"
              key={index}
            />
          ))}
        </div>
      ) : null}

      <div ref={ref} style={{ width: "20px", height: "20px" }}></div>
    </div>
  );
});

export default UserChannels;
