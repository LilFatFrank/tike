"use client";
import { useNeynarContext } from "@neynar/react";
import { IUser } from "@neynar/react/dist/types/common";
import {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  FC,
  useEffect,
  useState,
} from "react";
import Spinner from "../spinner";
import { useInfiniteQuery } from "react-query";
import { useInView } from "react-intersection-observer";
import Cast from "../cast";
import formatNumber from "@/utils/formatNumber";
import Frame from "../frame";
import StringProcessor from "../stringprocessor";
import { useRouter } from "next/navigation";
import EmbedRenderer from "../embedrenderer";

interface Button
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  buttonType?: "default" | "alternate";
}

const Button: FC<Button> = ({ buttonType = "default", ...props }) => {
  return (
    <button
      className={`py-2 px-4 text-[20px] leading-[22px] font-medium rounded-[16px] ${
        buttonType === "alternate"
          ? "bg-black text-white"
          : "bg-white text-black ring-1 ring-inset ring-black"
      }`}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
};

interface ApiResponse {
  casts: any;
  next: { cursor: string };
}

const fetchProfileCasts = async ({
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
};

const fetchRecastsReplies = async ({
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
};

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

const Profile: FC<Profile> = ({ fid }) => {
  const { user, logoutUser } = useNeynarContext();
  const [selectedTab, setSelectedTab] = useState<
    "casts" | "recasts_replies" | "media"
  >("casts");

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    ["profile-casts", { fid: fid, viewerFid: user?.fid || 3 }],
    fetchProfileCasts,
    {
      getNextPageParam: (lastPage) => {
        return lastPage.next?.cursor ?? false;
      },
      refetchOnWindowFocus: false,
    }
  );

  const {
    data: rrData,
    isLoading: rrIsLoading,
    error: rrError,
    fetchNextPage: rrFetchNextPage,
    hasNextPage: rrHasNextPage,
    isFetchingNextPage: rrIsFetchingNextPage,
  } = useInfiniteQuery(
    ["replies-recasts", { fid: fid, viewerFid: user?.fid || 3 }],
    fetchRecastsReplies,
    {
      getNextPageParam: (lastPage) => {
        return lastPage.next?.cursor ?? false;
      },
      refetchOnWindowFocus: false,
      enabled: selectedTab === "recasts_replies",
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

  useEffect(() => {
    if (
      (selectedTab === "casts" || selectedTab === "media") &&
      (inView || mInView) &&
      hasNextPage
    ) {
      fetchNextPage();
    }
  }, [inView, mInView, hasNextPage, fetchNextPage, selectedTab]);

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
              <Spinner />
            </div>
          ) : (
            <>
              <img
                src={userPro?.pfp_url}
                alt={userPro?.username}
                className="w-[82px] h-[82px] rounded-[41px] absolute top-[-41px] left-[16px] object-cover border-4 border-white"
              />
              <div className="flex justify-end">
                {user?.fid === Number(fid) ? (
                  <Button onClick={logoutUser}>Log out</Button>
                ) : userPro?.viewer_context?.following ? (
                  <Button onClick={unfollowUser}>Unfollow</Button>
                ) : !userPro?.viewer_context?.following ? (
                  <Button buttonType="alternate" onClick={followUser}>
                    Follow
                  </Button>
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
                    onClick={() => {
                      setSelectedTab(t.value as typeof selectedTab);
                    }}
                  >
                    {t.label}
                  </p>
                ))}
              </div>
              {selectedTab === "casts" ? (
                <>
                  {allProfileCasts.map((cast, castIndex, arr) =>
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
                  )}

                  {(isFetchingNextPage || isLoading) && !error ? (
                    <div className="p-2">
                      <Spinner />
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
                  <div className="grid grid-cols-3 gap-2 w-full py-5">
                    {allProfileCasts.map((cast) =>
                      cast.embedType === "frame" || cast.embedType === "youtube" ? null : (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            router.push(
                              `/cast/${cast.parent_hash || cast.hash}`
                            );
                          }}
                          key={`profile-cast-${cast.hash}`}
                          className="cursor-pointer w-full aspect-square rounded-[12px]"
                        >
                          <EmbedRenderer
                            type={
                              cast.embedType === "audio"
                                ? "image"
                                : cast.embedType
                            }
                            url={
                              cast.embedType === "audio"
                                ? cast?.embeds[1]?.url
                                : cast?.embeds[0]?.url
                            }
                            className={"object-cover"}
                          />
                        </span>
                      )
                    )}
                  </div>

                  {(isFetchingNextPage || isLoading) && !error ? (
                    <div className="p-2">
                      <Spinner />
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
                  {allRepliesRecasts.map((cast, castIndex, arr) =>
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
                  )}

                  {(rrIsFetchingNextPage || rrIsLoading) && !rrError ? (
                    <div className="p-2">
                      <Spinner />
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
    </>
  );
};

export default Profile;
