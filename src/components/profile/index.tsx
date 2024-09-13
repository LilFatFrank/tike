"use client";
import { useNeynarContext } from "@neynar/react";
import { IUser } from "@neynar/react/dist/types/common";
import { FC, memo, useCallback, useEffect, useState } from "react";
import { useInfiniteQuery } from "react-query";
import { useInView } from "react-intersection-observer";
import Cast from "../cast";
import formatNumber from "@/utils/formatNumber";
import Frame from "../frame";
import StringProcessor from "../stringprocessor";
import { useRouter } from "next/navigation";
import EmbedRenderer from "../embedrenderer";
import ProfileButton from "../profilebutton";
import { toast } from "sonner";
import EditProfile from "./edit-profile";
import Image from "next/image";

const CastsList = memo(({ casts, router }: { casts: any; router: any }) => {
  return casts.map((cast: any, castIndex: number, arr: any[]) =>
    cast.embeds[0].url ? (
      <span
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          router.push(`/cast/${cast.parent_hash || cast.hash}`);
        }}
        key={cast.hash}
        className="cursor-pointer"
      >
        {cast.embedType === "frame" ? (
          <Frame
            frame={cast}
            key={`profile-cast-${cast.hash}`}
            style={{ paddingRight: 0, paddingLeft: 0 }}
          />
        ) : (
          <Cast
            cast={cast}
            key={`profile-cast-${cast.hash}`}
            style={{ paddingRight: 0, paddingLeft: 0 }}
          />
        )}
        {castIndex === arr.length - 1 ? null : (
          <hr className="border border-t-divider" />
        )}
      </span>
    ) : null
  );
});

const MediaList = memo(({ casts, router }: { casts: any; router: any }) => {
  return (
    <div className="grid grid-cols-3 gap-2 w-full py-5">
      {casts.map((cast: any) =>
        cast.embedType === "frame" || cast.embedType === "youtube" ? null : (
          <span
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              router.push(`/cast/${cast.parent_hash || cast.hash}`);
            }}
            key={`profile-cast-${cast.hash}`}
            className="cursor-pointer w-full aspect-square rounded-[12px]"
          >
            <EmbedRenderer
              type={cast.embedType === "audio" ? "image" : cast.embedType}
              url={
                cast.embedType === "audio"
                  ? cast?.embeds[1]?.url
                  : cast?.embeds[0]?.url
              }
              author={cast?.author?.username}
              className={"object-cover"}
            />
          </span>
        )
      )}
    </div>
  );
});

const RecastsRepliesList = memo(
  ({ casts, router }: { casts: any; router: any }) => {
    return casts.map((cast: any, castIndex: number, arr: any[]) =>
      cast.embeds[0].url ? (
        <span
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            router.push(`/cast/${cast.parent_hash || cast.hash}`);
          }}
          key={cast.hash}
          className="cursor-pointer"
        >
          {cast.embedType === "frame" ? (
            <Frame
              frame={cast}
              key={`profile-cast-${cast.hash}`}
              style={{ paddingRight: 0, paddingLeft: 0 }}
            />
          ) : (
            <Cast
              cast={cast}
              key={`profile-cast-${cast.hash}`}
              style={{ paddingRight: 0, paddingLeft: 0 }}
            />
          )}
          {castIndex === arr.length - 1 ? null : (
            <hr className="border border-t-divider" />
          )}
        </span>
      ) : null
    );
  }
);

interface ApiResponse {
  casts: any;
  next: { cursor: string };
}

const tabs = [
  {
    label: "Casts",
    value: "casts",
  },
  {
    label: "Recasts + Replies",
    value: "recasts_replies",
  },
  {
    label: "Media",
    value: "media",
  },
];

interface Profile {
  fid: number;
}

const Profile: FC<Profile> = memo(({ fid }) => {
  const { user, logoutUser } = useNeynarContext();
  const [selectedTab, setSelectedTab] = useState<
    "casts" | "recasts_replies" | "media"
  >("casts");
  const [openProfileOptions, setOpenProfileOptions] = useState(false);
  const [profileOptionType, setProfileOptionType] = useState<
    "log-out" | "copy-profile" | ""
  >("");
  const [openEditProfile, setOpenEditProfile] = useState(false);

  const fetchProfileCasts = useCallback(
    async ({
      pageParam = "",
      queryKey,
    }: {
      pageParam?: string;
      queryKey: any;
    }): Promise<ApiResponse> => {
      const [_key, { fid, viewerFid }] = queryKey;
      const response = await fetch(`/api/profile-casts`, {
        method: "POST",
        body: JSON.stringify({ cursor: pageParam, fid, viewerFid }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data;
    },
    []
  );

  const fetchRecastsReplies = useCallback(
    async ({
      pageParam = "",
      queryKey,
    }: {
      pageParam?: string;
      queryKey: any;
    }): Promise<ApiResponse> => {
      const [_key, { fid, viewerFid }] = queryKey;
      const response = await fetch(`/api/replies-recasts`, {
        method: "POST",
        body: JSON.stringify({ cursor: pageParam, fid, viewerFid }),
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
    refetch,
  } = useInfiniteQuery(
    ["profile-casts", { fid: fid, viewerFid: user?.fid || 3 }],
    fetchProfileCasts,
    {
      getNextPageParam: (lastPage) => {
        return lastPage.next?.cursor ?? false;
      },
      refetchOnWindowFocus: false,
      staleTime: 60000,
      cacheTime: 3600000,
    }
  );

  const {
    data: rrData,
    isLoading: rrIsLoading,
    error: rrError,
    fetchNextPage: rrFetchNextPage,
    hasNextPage: rrHasNextPage,
    isFetchingNextPage: rrIsFetchingNextPage,
    refetch: rrRefetch,
  } = useInfiniteQuery(
    ["replies-recasts", { fid: fid, viewerFid: user?.fid || 3 }],
    fetchRecastsReplies,
    {
      getNextPageParam: (lastPage) => {
        return lastPage.next?.cursor ?? false;
      },
      refetchOnWindowFocus: false,
      enabled: selectedTab === "recasts_replies",
      staleTime: 60000,
      cacheTime: 3600000,
    }
  );

  const { ref, inView } = useInView({
    threshold: 0.3,
  });
  const { ref: rrRef, inView: rrInView } = useInView({
    threshold: 0.3,
  });
  const { ref: mRef, inView: mInView } = useInView({
    threshold: 0.3,
  });

  const router = useRouter();

  const handleFetchNextPage = useCallback(() => {
    if (
      (selectedTab === "casts" || selectedTab === "media") &&
      (inView || mInView) &&
      hasNextPage
    ) {
      fetchNextPage();
    } else if (selectedTab === "recasts_replies" && rrInView && rrHasNextPage) {
      rrFetchNextPage();
    }
  }, [
    selectedTab,
    inView,
    mInView,
    hasNextPage,
    fetchNextPage,
    rrInView,
    rrHasNextPage,
    rrFetchNextPage,
  ]);

  useEffect(() => {
    handleFetchNextPage();
  }, [handleFetchNextPage]);

  useEffect(() => {
    if (selectedTab === "recasts_replies" && rrInView && rrHasNextPage) {
      rrFetchNextPage();
    }
  }, [rrInView, rrHasNextPage, rrFetchNextPage, selectedTab]);

  const allProfileCasts = data?.pages.flatMap((page) => page.casts) ?? [];
  const allRepliesRecasts = rrData?.pages.flatMap((page) => page.casts) ?? [];

  const [userPro, setUserPro] = useState<IUser>();
  const [errorPro, setErrorPro] = useState(false);
  const [loadingPro, setLoadingPro] = useState(false);

  const handleTabChange = useCallback((tab: typeof selectedTab) => {
    setSelectedTab(tab);
  }, []);

  const handleProfileOptionsToggle = useCallback(() => {
    setOpenProfileOptions((prev) => !prev);
  }, []);

  const handleCopyProfileLink = useCallback(() => {
    window.navigator.clipboard.writeText(
      `${window.location.origin}/profile/${userPro?.fid}`
    );
    toast.success("Profile Link copied!");
  }, [userPro?.fid]);

  const fetchUserProfile = async () => {
    try {
      setLoadingPro(true);
      const res = await fetch(`/api/profile`, {
        method: "POST",
        body: JSON.stringify({
          fid,
          viewerFid: user?.fid,
        }),
      });
      const data = await res.json();
      setUserPro(data.user);
    } catch (error) {
      console.log(error);
      setErrorPro(true);
    } finally {
      setLoadingPro(false);
    }
  };

  const followUser = async () => {
    const res = await fetch("/api/post-follow", {
      method: "POST",
      body: JSON.stringify({ fid: userPro?.fid, uuid: user?.signer_uuid }),
    });
    const data = await res.json();
    if (data.success) {
      setUserPro({
        ...(userPro as IUser),
        ["viewer_context"]: {
          ...userPro?.viewer_context,
          following: !userPro?.viewer_context?.following,
        } as IUser["viewer_context"],
      });
    }
  };

  const unfollowUser = async () => {
    const res = await fetch("/api/delete-follow", {
      method: "POST",
      body: JSON.stringify({ fid: userPro?.fid, uuid: user?.signer_uuid }),
    });
    const data = await res.json();
    if (data.success) {
      setUserPro({
        ...(userPro as IUser),
        ["viewer_context"]: {
          ...userPro?.viewer_context,
          following: !userPro?.viewer_context?.following,
        } as IUser["viewer_context"],
      });
    }
  };

  useEffect(() => {
    if (user) fetchUserProfile();
  }, [user]);

  return (
    <>
      <div className="w-full h-full">
        <img
          className="w-full h-full object-cover z-[-1] fixed md:w-[550px] md:rounded-[20px]"
          src="/images/profile-background.png"
          alt="background"
        />
        <div className="w-full relative min-h-full top-[120px] bg-white rounded-t-[20px] py-[10px] px-[16px]">
          {errorPro ? (
            <div className="p-4 text-center">
              <p>Could not fetch user profile</p>
            </div>
          ) : loadingPro ? (
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
                src={userPro?.pfp_url ?? ""}
                alt={userPro?.username ?? ""}
                className="w-[82px] h-[82px] rounded-[41px] absolute top-[-41px] left-[16px] object-cover border-4 border-white"
                width={82}
                height={82}
                quality={100}
                loading="lazy"
                style={{ aspectRatio: "1/1" }}
              />
              <div className="flex justify-end gap-2 items-center">
                {user?.fid === Number(fid) ? (
                  <ProfileButton
                    onClick={() => setOpenEditProfile(true)}
                    buttonType="edit"
                  >
                    Edit Profile
                  </ProfileButton>
                ) : userPro?.viewer_context?.following ? (
                  <ProfileButton onClick={unfollowUser}>Unfollow</ProfileButton>
                ) : !userPro?.viewer_context?.following ? (
                  <ProfileButton buttonType="alternate" onClick={followUser}>
                    Follow
                  </ProfileButton>
                ) : null}
                {user?.fid === Number(fid) ? (
                  <>
                    <div className="relative">
                      <div
                        className="rounded-full bg-[#00000005] border-black-20 border-[1px] p-2"
                        onClick={handleProfileOptionsToggle}
                      >
                        <Image
                          src="/icons/cast-more-icon.svg"
                          alt="more"
                          className="w-[18px] h-[18px] cursor-pointer"
                          width={18}
                          height={18}
                          quality={100}
                          loading="lazy"
                          style={{ aspectRatio: "1/1" }}
                        />
                      </div>
                      <div
                        className={`absolute right-0 top-full bg-white transition-all duration-300 ease-in-out rounded-[18px] shadow-comment-upload-media-modal w-[190px] ${
                          openProfileOptions
                            ? "opacity-100 visible z-[99]"
                            : "opacity-0 invisible z-[-1]"
                        }`}
                      >
                        <div className="flex flex-col w-full items-center justify-center p-2 rounded-[18px] gap-1">
                          <div
                            className={`cursor-pointer w-full px-2 py-[10px] flex items-center justify-start gap-[2px] rounded-[12px] hover:bg-frame-btn-bg ${
                              profileOptionType === "copy-profile"
                                ? "bg-frame-btn-bg ring-inset ring-1 ring-black/10"
                                : ""
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setProfileOptionType("copy-profile");
                              handleCopyProfileLink();
                            }}
                          >
                            <Image
                              src="/icons/copy-hash-icon.svg"
                              alt="delete"
                              className="w-6 h-6"
                              width={24}
                              height={24}
                              quality={100}
                              loading="lazy"
                              style={{ aspectRatio: "1/1" }}
                            />
                            <span className="font-medium leading-[22px]">
                              Copy Profile Link
                            </span>
                          </div>
                          <div
                            className={`cursor-pointer w-full px-2 py-[10px] flex items-center justify-start gap-[2px] rounded-[12px] hover:bg-frame-btn-bg ${
                              profileOptionType === "log-out"
                                ? "bg-frame-btn-bg ring-inset ring-1 ring-black/10"
                                : ""
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setProfileOptionType("log-out");
                              logoutUser();
                            }}
                          >
                            <img
                              src="/icons/log-out-icon.svg"
                              alt="delete"
                              className="w-6 h-6"
                            />
                            <span className="font-medium leading-[22px]">
                              Log out
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
              <div className="flex flex-col items-start justify-start gap-3 mt-[12px]">
                <div className="flex flex-col items-start gap-[2px]">
                  <p className="font-bold text-[18px] leading-[auto] text-black">
                    {userPro?.display_name}
                  </p>
                  <p className="font-medium text-[15px] leading-[auto] text-black-50 flex items-center gap-1">
                    @{userPro?.username}
                    {userPro?.viewer_context?.followed_by ? (
                      <>
                        <div className="py-[2px] px-1 rounded-md bg-frame-btn-bg">
                          <p className="text-black-60 text-[10px]">
                            Follows you
                          </p>
                        </div>
                      </>
                    ) : null}
                  </p>
                </div>
                <p className="font-normal">
                  <StringProcessor
                    inputString={userPro?.profile.bio.text ?? ""}
                    mentionedProfiles={[]}
                  />
                </p>
                <div className="flex items-center justify-start gap-[12px]">
                  <p className="text-[15px] leading-[auto] text-black-50 font-medium">
                    <span className="font-bold text-black mr-1">
                      {formatNumber(Number(userPro?.following_count))}
                    </span>
                    Following
                  </p>
                  <p className="text-[15px] leading-[auto] text-black-50 font-medium">
                    <span className="text-black font-bold mr-1">
                      {formatNumber(Number(userPro?.follower_count))}
                    </span>
                    Followers
                  </p>
                </div>
              </div>
              <div className="flex items-end justify-start gap-2 mt-9">
                {tabs.map((t) => (
                  <p
                    className={`grow basis-1/2 text-center font-semibold text-[16px] leading-[120%] font-600 ${
                      t.value === selectedTab
                        ? "text-black border-b-2 border-b-purple"
                        : "text-tab-unselected-color"
                    } pb-[2px] cursor-pointer`}
                    onClick={() =>
                      handleTabChange(t.value as typeof selectedTab)
                    }
                  >
                    {t.label}
                  </p>
                ))}
              </div>
              {selectedTab === "casts" ? (
                <>
                  {<CastsList casts={allProfileCasts} router={router} />}
                  {(isFetchingNextPage || isLoading) && !error ? (
                    <div className="p-2">
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
                  ) : null}
                  <div ref={ref} style={{ height: "80px" }}></div>
                  {allProfileCasts && allProfileCasts.length && !hasNextPage ? (
                    <p className="w-full items-center justify-center py-2 text-center">
                      End of the line!
                    </p>
                  ) : null}
                </>
              ) : selectedTab === "media" ? (
                <>
                  {<MediaList casts={allProfileCasts} router={router} />}

                  {(isFetchingNextPage || isLoading) && !error ? (
                    <div className="grid grid-cols-3 gap-2 w-full">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div
                          className="aspect-square rounded-[12px] bg-divider animate-pulse w-full"
                          key={index}
                        />
                      ))}
                    </div>
                  ) : null}

                  <div ref={mRef} style={{ height: "80px" }}></div>

                  {allProfileCasts && allProfileCasts.length && !hasNextPage ? (
                    <p className="w-full items-center justify-center py-2 text-center">
                      End of the line!
                    </p>
                  ) : null}
                </>
              ) : (
                <>
                  {
                    <RecastsRepliesList
                      casts={allRepliesRecasts}
                      router={router}
                    />
                  }

                  {(rrIsFetchingNextPage || rrIsLoading) && !rrError ? (
                    <div className="p-2">
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
                  ) : null}

                  <div ref={rrRef} style={{ height: "80px" }}></div>

                  {allRepliesRecasts &&
                  allRepliesRecasts.length &&
                  !rrHasNextPage ? (
                    <p className="w-full items-center justify-center py-2 text-center">
                      End of the line!
                    </p>
                  ) : null}
                </>
              )}
            </>
          )}
        </div>
      </div>
      <EditProfile
        isOpen={openEditProfile}
        onClose={() => setOpenEditProfile(false)}
        userPro={userPro}
        refetch={() => {
          fetchUserProfile();
          refetch();
          rrRefetch();
        }}
      />
    </>
  );
});

export default Profile;
