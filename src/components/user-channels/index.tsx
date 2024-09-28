"use client";
import { FC, memo, useContext, useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { AppContext } from "@/context";
import { SET_USER_CHANNELS } from "@/context/actions";
import { useRouter } from "next/navigation";

interface UserChannelsProps {
  channels: any[];
  onLoadMore: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
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
          <img
            src={channel.image_url}
            alt={channel.name}
            className="w-full h-full rounded-[16px] object-cover"
            width={60}
            height={60}
            loading="lazy"
            style={{ aspectRatio: "1/1" }}
          />
        </div>
        <p className="text-[11px] font-normal w-[9ch] text-center text-ellipsis overflow-hidden whitespace-nowrap">
          {channel.name}
        </p>
      </div>
    </span>
  )
);

const UserChannels: FC<UserChannelsProps> = memo(({ channels, onLoadMore, hasNextPage, isFetchingNextPage }) => {
  const [, dispatch] = useContext(AppContext);
  const router = useRouter();

  const { ref, inView } = useInView({
    threshold: 0.3,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      onLoadMore();
    }
  }, [inView, hasNextPage, isFetchingNextPage, onLoadMore]);

  useEffect(() => {
    dispatch({
      type: SET_USER_CHANNELS,
      payload: channels,
    });
  }, [channels, dispatch]);

  return (
    <div className="pt-[10px] pb-[20px] pl-[16px] flex items-center justify-start gap-4 overflow-x-auto whitespace-nowrap no-scrollbar">
      {channels.map((channel) => (
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
