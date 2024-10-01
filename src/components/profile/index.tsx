"use client";
import { useNeynarContext } from "@neynar/react";
import { IUser } from "@neynar/react/dist/types/common";
import {
  FC,
  memo,
  useCallback,
  useEffect,
  useState,
} from "react";
import formatNumber from "@/utils/formatNumber";
import StringProcessor from "../stringprocessor";
import ProfileButton from "../profilebutton";
import { toast } from "sonner";
import EditProfile from "./edit-profile";
import ProfileCasts from "./profile-casts";
import RepliesRecasts from "./replies-recasts";
import MediaCasts from "./media-casts";

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
          src="https://tike-assets.s3.ap-south-1.amazonaws.com/profile-background.png"
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
              <img
                src={userPro?.pfp_url ?? ""}
                alt={userPro?.username ?? ""}
                className="w-[82px] h-[82px] rounded-[41px] absolute top-[-41px] left-[16px] object-cover border-4 border-white"
                width={82}
                height={82}
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
                        <img
                          src="/icons/cast-more-icon.svg"
                          alt="more"
                          className="w-[18px] h-[18px] cursor-pointer"
                          width={18}
                          height={18}
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
                            <img
                              src="/icons/copy-hash-icon.svg"
                              alt="delete"
                              className="w-6 h-6"
                              width={24}
                              height={24}
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
                              loading="lazy"
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
                    maxLength={120}
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
                    key={t.value}
                  >
                    {t.label}
                  </p>
                ))}
              </div>
              {selectedTab === "casts" ? (
                <ProfileCasts fid={fid.toString()} />
              ) : selectedTab === "media" ? (
                <MediaCasts fid={fid.toString()} />
              ) : selectedTab === "recasts_replies" ? (
                <RepliesRecasts fid={fid.toString()} />
              ) : null}
            </>
          )}
          <div style={{ height: "80px" }} />
        </div>
      </div>
      <EditProfile
        isOpen={openEditProfile}
        onClose={() => setOpenEditProfile(false)}
        userPro={userPro}
        refetch={() => {
          fetchUserProfile();
        }}
      />
    </>
  );
});

export default memo(Profile);
