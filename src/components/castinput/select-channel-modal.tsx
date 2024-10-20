"use client";
import { useNeynarContext } from "@neynar/react";
import { FC, useCallback, useMemo } from "react";
import { useInfiniteQuery } from "react-query";
import Modal from "@/components/modal";
import { Virtuoso } from "react-virtuoso";
import { useIsMobile } from "@/hooks/useIsMobile";

interface SelectChannelModalProps {
    openChannelModal: boolean,
    setOpenChannelModal: (val: boolean) => void,
    selectedChannel: string,
    setSelectedChannel: (val: string) => void,
}

const SelectChannelModal: FC<SelectChannelModalProps> = ({
    openChannelModal,
    setOpenChannelModal,
    selectedChannel,
    setSelectedChannel
}) => {

    const isMobile = useIsMobile();
    const { user } = useNeynarContext();
    const renderLoadingMore = () =>
        useCallback(
          () => (
            <div className="w-full">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse w-full h-[50px] bg-divider rounded-lg mb-2"
                />
              ))}
            </div>
          ),
          []
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
        }: {
          pageParam?: string;
          queryKey: any;
        }): Promise<{
          channels: any;
          next: { cursor: string };
        }> => {
          const [_key, { fid }] = queryKey;
          const response = await fetch(`/api/user-member-channels`, {
            method: "POST",
            body: JSON.stringify({ cursor: pageParam, fid }),
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
        fetchUserMemberChannels,
        {
          getNextPageParam: (lastPage) => lastPage.next?.cursor ?? false,
          refetchOnWindowFocus: false,
          staleTime: 60000,
          cacheTime: 3600000,
        }
      );
    
      const allUserMemberChannels = useMemo(
        () => allChannels?.pages.flatMap((page) => page.channels) ?? [],
        [allChannels]
      );
    
      const handleFetchNextPage = useCallback(() => {
        if (hasNextUserChannels && !isFetchingNextUserChannels) {
          fetchNextUserChannels();
        }
      }, [hasNextUserChannels, fetchNextUserChannels, isFetchingNextUserChannels]);

      const renderMemberChannel = useCallback((index: number) => {
        const channel = allUserMemberChannels[index];
        return channel ? (
          <div
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
        ) : null;
      }, [allUserMemberChannels]);

    return <>
    <Modal
        isOpen={openChannelModal}
        closeModal={() => setOpenChannelModal(false)}
        style={{ borderRadius: "20px 20px 0 0", padding: 0, minHeight: "40%" }}
      >
        <div className="flex-1 pt-8 pb-2 px-2">
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
            <Virtuoso
              data={allUserMemberChannels}
              endReached={handleFetchNextPage}
              itemContent={renderMemberChannel}
              useWindowScroll={isMobile}
              components={{
                Footer: isFetchingNextUserChannels
                  ? renderLoadingMore()
                  : undefined,
              }}
              style={{ height: "100vh", scrollbarWidth: "none" }}
            />
          )}
        </div>
      </Modal>
    </>
}

export default SelectChannelModal;
