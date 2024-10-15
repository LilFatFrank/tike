"use client";
import { ProfileButton, StringProcessor } from "@/components";
import Modal from "@/components/modal";
import { useIsMobile } from "@/hooks/useIsMobile";
import formatNumber from "@/utils/formatNumber";
import { useNeynarContext } from "@neynar/react";
import { useRouter } from "next/navigation";
import { FC, memo, useCallback, useEffect, useMemo, useState } from "react";
import { useInfiniteQuery } from "react-query";
import { Virtuoso } from "react-virtuoso";
import ChannelCasts from "./channel-casts";

const Channel: FC<{ params: { channelId: string } }> = memo(({ params }) => {
  const { user } = useNeynarContext();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [openMembersListModal, setOpenMembersListModal] = useState(false);
  const [openFollowersListModal, setOpenFollowersListModal] = useState(false);
  const [relevantFollowers, setRelevantFollowers] = useState<
    | {
        hydrated: {
          image_url: string;
          fid: number;
          username: string;
        }[];
        others: number;
      }
    | undefined
  >();

  const fetchRelevantFollowers = async () => {
    try {
      const response = await fetch(`/api/channel-relevant-followers`, {
        method: "POST",
        body: JSON.stringify({
          channelId: params.channelId,
          fid: user?.fid,
        }),
      });
      const data = await response.json();
      setRelevantFollowers({
        hydrated: data.top_relevant_followers_hydrated.map((hf: any) => ({
          image_url: hf.user.pfp_url,
          fid: hf.user.fid,
          username: hf.user.username,
        })),
        others:
          data.all_relevant_followers_dehydrated.length -
          data.top_relevant_followers_hydrated.length,
      });
    } catch (error) {
      console.log("relevant followers", error);
    }
  };

  const fetchChannelFollowers = useCallback(
    async ({
      pageParam = "",
      queryKey,
    }: {
      pageParam?: string;
      queryKey: any;
    }): Promise<{
      users: any;
      next: { cursor: string };
    }> => {
      const [_key, { channelId, viewerFid }] = queryKey;
      const response = await fetch(`/api/channel-followers`, {
        method: "POST",
        body: JSON.stringify({ cursor: pageParam, channelId, viewerFid }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return await response.json();
    },
    [params.channelId]
  );

  const {
    data: allFollowers,
    fetchNextPage: fetchNextFollowers,
    hasNextPage: hasNextFollowers,
    isFetchingNextPage: isFetchingNextFollowers,
  } = useInfiniteQuery(
    [
      "channel-followers",
      { channelId: params.channelId, viewerFid: user?.fid },
    ],
    fetchChannelFollowers,
    {
      getNextPageParam: (lastPage) => lastPage.next?.cursor ?? false,
      refetchOnWindowFocus: false,
      staleTime: 60000,
      cacheTime: 3600000,
    }
  );

  const allFollowersList = useMemo(
    () => allFollowers?.pages.flatMap((page) => page.users) ?? [],
    [allFollowers]
  );

  const handleFetchNextFollowers = useCallback(() => {
    if (hasNextFollowers && !isFetchingNextFollowers) {
      fetchNextFollowers();
    }
  }, [hasNextFollowers, fetchNextFollowers, isFetchingNextFollowers]);

  const fetchChannelMembers = useCallback(
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
      const [_key, { channelId }] = queryKey;
      const response = await fetch(`/api/channel-members`, {
        method: "POST",
        body: JSON.stringify({ cursor: pageParam, channelId }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return await response.json();
    },
    [params.channelId]
  );

  const {
    data: allMembers,
    fetchNextPage: fetchNextMembers,
    hasNextPage: hasNextMembers,
    isFetchingNextPage: isFetchingNextMembers,
  } = useInfiniteQuery(
    ["channel-members", { channelId: params.channelId }],
    fetchChannelMembers,
    {
      getNextPageParam: (lastPage) => lastPage.next?.cursor ?? false,
      refetchOnWindowFocus: false,
      staleTime: 60000,
      cacheTime: 3600000,
    }
  );

  const allMembersList = useMemo(
    () => allMembers?.pages.flatMap((page) => page.channels) ?? [],
    [allMembers]
  );

  const handleFetchNextMembers = useCallback(() => {
    if (hasNextMembers && !isFetchingNextMembers) {
      fetchNextMembers();
    }
  }, [hasNextMembers, fetchNextMembers, isFetchingNextMembers]);

  const Footer = useCallback(() => {
    if (isFetchingNextMembers) {
      return (
        <div className="flex flex-col items-start justify-start gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              className="animate-pulse w-full h-[50px] rounded-lg bg-divider"
              key={index}
            />
          ))}
        </div>
      );
    }
    return null;
  }, [isFetchingNextMembers]);

  const MemberItem = memo(
    ({ user, router, isLast }: { user: any; router: any; isLast: boolean }) => (
      <span
        onClick={() => router.push(`/profile/${user.user.fid}`)}
        className="cursor-pointer mb-2 block"
      >
        <div className="w-full px-1 pb-[12px] flex items-center justify-start gap-2">
          <img
            className="w-[40px] h-[40px] rounded-[20px] object-cover"
            src={user.user.pfp_url}
            alt={user.user.username}
            width={40}
            height={40}
            loading="lazy"
            style={{ aspectRatio: "1 / 1" }}
          />
          <div className="flex flex-col items-start gap-[2px]">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-[16px] leading-[16px]">
                {user.user.display_name}
              </p>
              {user.role === "moderator" || user.role === "admin" ? (
                <>
                  <span>&#8226;</span>
                  <p className="capitalize text-purple font-semibold text-[16px]">
                    {channelPro?.lead?.fid == user.user.fid
                      ? "Admin"
                      : user.role}
                  </p>
                </>
              ) : null}
            </div>
            <p className="font-normal text-[14px] leading-[14px] text-gray-text-1">
              @{user.user.username}
            </p>
          </div>
        </div>
        {!isLast && <hr className="border-[0.5px] border-t-divider" />}
      </span>
    )
  );

  const FollowerItem = memo(
    ({ user, router, isLast }: { user: any; router: any; isLast: boolean }) => (
      <span
        onClick={() => router.push(`/profile/${user.fid}`)}
        className="cursor-pointer mb-2 block"
      >
        <div className="w-full px-1 pb-[12px] flex items-center justify-start gap-2">
          <img
            className="w-[40px] h-[40px] rounded-[20px] object-cover"
            src={user.pfp_url}
            alt={user.username}
            width={40}
            height={40}
            loading="lazy"
            style={{ aspectRatio: "1 / 1" }}
          />
          <div className="flex flex-col items-start gap-[2px]">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-[16px] leading-[16px]">
                {user.display_name}
              </p>
              {user.role === "moderator" || user.role === "admin" ? (
                <>
                  <span>&#8226;</span>
                  <p className="capitalize text-purple font-semibold text-[16px]">
                    {channelPro?.lead?.fid === user.fid ? "Admin" : user.role}
                  </p>
                </>
              ) : null}
            </div>
            <p className="font-normal text-[14px] leading-[14px] text-gray-text-1">
              @{user.username}
            </p>
          </div>
        </div>
        {!isLast && <hr className="border-[0.5px] border-t-divider" />}
      </span>
    )
  );

  const renderMember = useCallback(
    (index: number) => {
      const member = allMembersList[index];
      return (
        <MemberItem
          key={member.user.fid}
          user={member}
          router={router}
          isLast={index === allMembersList.length - 1}
        />
      );
    },
    [allMembersList, router]
  );

  const renderFollower = useCallback(
    (index: number) => {
      const follower = allFollowersList[index];
      return (
        <FollowerItem
          key={follower.fid}
          user={follower}
          router={router}
          isLast={index === allFollowersList.length - 1}
        />
      );
    },
    [allFollowersList, router]
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

  useEffect(() => {
    if (params.channelId && user?.fid) fetchRelevantFollowers();
  }, [params.channelId, user?.fid]);

  return (
    <>
      <div className="w-full h-full">
        <img
          className="w-full h-full object-cover z-[-1] fixed md:w-[550px] md:rounded-[20px]"
          src="https://tike-assets.s3.ap-south-1.amazonaws.com/profile-background.png"
          alt="background"
          width={550}
          height={550}
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
              <img
                src={channelPro?.image_url}
                alt={channelPro?.id}
                className="w-[82px] h-[82px] rounded-[18px] absolute top-[-41px] left-[16px] object-cover border-4 border-white"
                width={82}
                height={82}
                style={{ aspectRatio: "1/1" }}
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
              <div className="flex flex-col items-start justify-start gap-3 py-[12px]">
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
                  <p
                    className="text-[15px] leading-[auto] text-black-50 font-medium cursor-pointer"
                    onClick={() => setOpenMembersListModal(true)}
                  >
                    <span className="text-black font-bold mr-1">
                      {formatNumber(Number(channelPro?.member_count))}
                    </span>
                    Members
                  </p>
                  <p
                    className="text-[15px] leading-[auto] text-black-50 font-medium cursor-pointer"
                    onClick={() => setOpenFollowersListModal(true)}
                  >
                    <span className="text-black font-bold mr-1">
                      {formatNumber(Number(channelPro?.follower_count))}
                    </span>
                    Followers
                  </p>
                </div>
                {relevantFollowers ? (
                  <div className="gap-2 flex items-center justify-start w-full">
                    <div className="flex -space-x-2 max-w-[72px] min-w-[56px] flex-shrink-0">
                      {relevantFollowers.hydrated.map((h) => (
                        <img
                          src={h.image_url}
                          key={h.fid}
                          alt={h.username}
                          className="rounded-full h-6 w-6 bg-white ring-[0.5px] ring-inset ring-black-10"
                        />
                      ))}
                    </div>
                    <p className="text-[12px] text-black-50 font-medium leading-[12px]">
                      Followed by @{relevantFollowers.hydrated[0].username}, @
                      {relevantFollowers.hydrated[1].username}, @
                      {relevantFollowers.hydrated[2].username} and{" "}
                      {relevantFollowers.others} others you know
                    </p>
                  </div>
                ) : null}
              </div>
              <hr className="border-b-[0.5px] border-b-black-10 relative left-[-16px] w-[106%] overflow-x-hidden" />
              <ChannelCasts channelId={params.channelId} />
            </>
          )}
          <div style={{ height: "80px" }} />
        </div>
      </div>
      <Modal
        isOpen={openMembersListModal}
        closeModal={() => setOpenMembersListModal(false)}
        style={{ borderRadius: "20px 20px 0 0", padding: 0, minHeight: "40%" }}
      >
        <div className="flex-1 pt-4 pb-2 px-2">
          <Virtuoso
            data={allMembersList}
            endReached={handleFetchNextMembers}
            itemContent={renderMember}
            useWindowScroll={isMobile}
            components={{
              Footer,
              Header: () => (
                <p className="mb-2 text-center text-[18px] font-semibold leading-[22px]">
                  Members
                </p>
              ),
            }}
            style={{ height: "40dvh", scrollbarWidth: "none" }}
          />
        </div>
      </Modal>
      <Modal
        isOpen={openFollowersListModal}
        closeModal={() => setOpenFollowersListModal(false)}
        style={{ borderRadius: "20px 20px 0 0", padding: 0, minHeight: "40%" }}
      >
        <div className="flex-1 pt-4 pb-2 px-2">
          <Virtuoso
            data={allFollowersList}
            endReached={handleFetchNextFollowers}
            itemContent={renderFollower}
            useWindowScroll={isMobile}
            components={{
              Footer,
              Header: () => (
                <p className="mb-2 text-center text-[18px] font-semibold leading-[22px]">
                  Followers
                </p>
              ),
            }}
            style={{ height: "40dvh", scrollbarWidth: "none" }}
          />
        </div>
      </Modal>
    </>
  );
});

export default Channel;
