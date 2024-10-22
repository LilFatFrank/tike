"use client";
import { useNeynarContext } from "@neynar/react";
import { FC, memo, useCallback, useMemo } from "react";
import { useInfiniteQuery } from "react-query";
import Modal from "@/components/modal";
import { useIsMobile } from "@/hooks/useIsMobile";
import { toast } from "sonner";
import InfiniteScroll from "react-infinite-scroller";

interface SelectChannelModalProps {
  openChannelModal: boolean;
  setOpenChannelModal: (val: boolean) => void;
  selectedChannel: string;
  setSelectedChannel: (val: string) => void;
}

const SelectChannelModal: FC<SelectChannelModalProps> = ({
  openChannelModal,
  setOpenChannelModal,
  selectedChannel,
  setSelectedChannel,
}) => {
  const isMobile = useIsMobile();
  const { user } = useNeynarContext();

  const renderLoadingMore = () => (
    <div className="w-full">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse w-full h-[50px] bg-divider rounded-lg mb-2"
        />
      ))}
    </div>
  );

  const renderLoadingChannels = () => (
    <div className="w-full">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse w-full h-[50px] bg-divider rounded-lg mb-2"
        />
      ))}
    </div>
  );

  const fetchUserMemberChannels = useCallback(
    async ({
      pageParam = "",
      queryKey,
      signal,
    }: {
      pageParam?: string;
      queryKey: any;
      signal?: AbortSignal;
    }): Promise<{
      channels: any;
      next: { cursor: string };
    }> => {
      const [_key, { fid }] = queryKey;
      const response = await fetch(`/api/user-member-channels`, {
        method: "POST",
        body: JSON.stringify({ cursor: pageParam, fid }),
        signal,
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return await response.json();
    },
    []
  );

  const {
    data: allChannels,
    isLoading: isLoadingMemberChannels,
    fetchNextPage: fetchNextUserChannels,
    hasNextPage: hasNextUserChannels,
    isFetchingNextPage: isFetchingNextUserChannels,
  } = useInfiniteQuery(
    ["user-member-channels", { fid: user?.fid || 3 }],
    ({ pageParam, queryKey, signal }) =>
      fetchUserMemberChannels({ pageParam, queryKey, signal }),
    {
      getNextPageParam: (lastPage) => lastPage.next?.cursor ?? false,
      refetchOnWindowFocus: false,
      staleTime: 60000,
      cacheTime: 3600000,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      onError: (err) => {
        console.log(err);
        toast.error("Error fetching channels list!");
      },
    }
  );

  const allUserMemberChannels = useMemo(
    () => allChannels?.pages.flatMap((page) => page.channels) ?? [],
    [allChannels]
  );

  const renderMemberChannel = useCallback(
    (channel: any, index: number) => {
      if (!channel) {
        console.log(index, "No channel found!");
        return null;
      }
      return (
        <div
          key={channel.channel.id}
          className={`w-full px-2 py-[10px] flex items-center justify-start gap-2 cursor-pointer ${
            index === allUserMemberChannels.length - 1 ? "" : "mb-1"
          } rounded-[12px] ${
            selectedChannel === channel?.channel?.id
              ? "bg-frame-btn-bg ring-inset ring-1 ring-black/10"
              : ""
          } hover:bg-frame-btn-bg`}
          onClick={() => {
            setSelectedChannel(channel?.channel?.id);
            setOpenChannelModal(false);
          }}
        >
          <img
            src={channel?.channel?.image_url}
            className="w-[24px] h-[24px] rounded-[20px] object-cover"
            width={24}
            height={24}
            loading="lazy"
            alt={channel?.channel?.id}
            style={{ aspectRatio: "1 / 1" }}
          />
          <p className="font-medium leading-[22px]">
            {channel?.channel?.id}&nbsp;
          </p>
        </div>
      );
    },
    [selectedChannel, setSelectedChannel, setOpenChannelModal]
  );

  const loadMore = useCallback(() => {
    if (hasNextUserChannels && !isFetchingNextUserChannels) {
      fetchNextUserChannels().catch((error) => {
        console.log(error);
        toast.error("Error fetching next set of channels!");
      });
    }
  }, [hasNextUserChannels, isFetchingNextUserChannels, fetchNextUserChannels]);

  return (
    <Modal
      isOpen={openChannelModal}
      closeModal={() => setOpenChannelModal(false)}
      style={{ borderRadius: "20px 20px 0 0", padding: 0, height: "60%", scrollbarWidth: "none" }}
    >
      <div className="flex-1 pt-8 pb-2 px-2" style={{ height: "100%", scrollbarWidth: "none" }}>
        <p className="mb-2 text-center text-[18px] font-semibold leading-[22px]">
          Select Channel
        </p>
        <div
          className={`w-full px-2 py-[10px] flex items-center justify-start gap-2 cursor-pointer mb-1 rounded-[12px] ${
            selectedChannel === ""
              ? "bg-frame-btn-bg ring-inset ring-1 ring-black/10"
              : ""
          } hover:bg-frame-btn-bg`}
          onClick={() => {
            setSelectedChannel("");
            setOpenChannelModal(false);
          }}
        >
          <img
            src={"/icons/home-icon.svg"}
            className="w-[24px] h-[24px] rounded-[20px] object-cover"
            width={24}
            height={24}
            loading="lazy"
            alt={"none"}
            style={{ aspectRatio: "1 / 1" }}
          />
          <p className="font-medium leading-[22px]">None</p>
        </div>
        {isLoadingMemberChannels ? (
          renderLoadingChannels()
        ) : (
          <div className="overflow-y-auto" style={{ height: "calc(100%-60px)", scrollbarWidth: "none" }}>
            <InfiniteScroll
              pageStart={0}
              loadMore={loadMore}
              hasMore={hasNextUserChannels}
              loader={renderLoadingMore()}
              useWindow={true}
            >
              {allUserMemberChannels.map((channel, index) => renderMemberChannel(channel, index))}
            </InfiniteScroll>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default memo(SelectChannelModal);