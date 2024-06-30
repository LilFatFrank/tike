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

interface Profile {
  fid: number;
}

const Profile: FC<Profile> = ({ fid }) => {
  const { user } = useNeynarContext();

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

  const { ref, inView } = useInView({
    threshold: 0.3,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const allProfileCasts = data?.pages.flatMap((page) => page.casts) ?? [];

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

  useEffect(() => {
    if (user) fetchUserProfile();
  }, [user]);

  return (
    <>
      <div className="w-full h-full">
        <img
          className="fixed w-full h-full object-cover z-[-1] fixed"
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
              <div className="flex flex-col items-start justify-start gap-3 mt-[40px]">
                <div className="flex flex-col items-start gap-[2px]">
                  <p className="font-bold text-[18px] leading-[auto] text-black">
                    {userPro?.display_name}
                  </p>
                  <p className="font-medium text-[15px] leading-[auto] text-black-50">
                    @{userPro?.username}
                  </p>
                </div>
                <p className="font-normal">{userPro?.profile.bio.text}</p>
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
              {allProfileCasts.map((cast, castIndex, arr) =>
                cast.embeds[0].url ? (
                  <>
                    <Cast cast={cast} key={`profile-cast-${cast.hash}`} />
                    {castIndex === arr.length - 1 ? null : (
                      <hr className="border border-t-divider" />
                    )}
                  </>
                ) : null
              )}

              {(isFetchingNextPage || isLoading) && !error ? (
                <div className="p-2">
                  <Spinner />
                </div>
              ) : null}

              <div ref={ref} style={{ height: "20px" }}></div>

              {allProfileCasts && allProfileCasts.length && !hasNextPage ? (
                <p className="w-full items-center justify-center py-2 text-center">
                  End of the line!
                </p>
              ) : null}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
