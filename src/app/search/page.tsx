"use client";
import { FC, memo, useCallback, useEffect, useMemo, useState } from "react";
import SearchUsers from "./search-users";
import formatNumber from "@/utils/formatNumber";
import { useNeynarContext } from "@neynar/react";
import SearchCasts from "./search-casts";
import { useRouter } from "next/navigation";
import Image from "next/image";

const tabs = [
  {
    label: "Users",
    value: "users",
  },
  {
    label: "Channels",
    value: "channels",
  },
  {
    label: "Casts",
    value: "casts",
  },
];

const Search: FC = memo(() => {
  const { user } = useNeynarContext();
  const router = useRouter();

  const [selectedTab, setSelectedTab] = useState<
    "users" | "channels" | "casts"
  >("users");
  const [inputSearch, setInputSearch] = useState("");
  const [debouncedInputSearch, setDebouncedInputSearch] = useState("");
  const [allChannels, setAllChannels] = useState<
    { id: string; image_url: string; name: string }[]
  >([]);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [errorChannels, setErrorChannels] = useState(false);
  const [changeView, setChangeView] = useState(false);
  const [trendingChannels, setTrendingChannels] = useState<
    {
      channel: {
        id: string;
        image_url: string;
        name: string;
        follower_count: number;
        description: string;
      };
    }[]
  >([]);
  const [powerUsers, setPowerUsers] = useState<
    {
      pfp_url: string;
      fid: string;
      follower_count: number;
      username: string;
      display_name: string;
    }[]
  >([]);
  const [loadingPage, setLoadingPage] = useState(false);

  const fetchTrendingChannels = useCallback(async () => {
    try {
      const res = await fetch("/api/trending-channels");
      const data = await res.json();
      setTrendingChannels(data.channels);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const fetchPowerUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/power-users", {
        method: "POST",
        body: JSON.stringify({ viewerFid: user?.fid }),
      });
      const data = await res.json();
      setPowerUsers(data.users);
    } catch (error) {
      console.log(error);
    }
  }, [user?.fid]);

  const fetchAllChannels = useCallback(async () => {
    try {
      setLoadingChannels(true);
      const res = await fetch("/api/search-channels", {
        method: "POST",
        body: JSON.stringify({ q: debouncedInputSearch }),
      });
      const data = await res.json();
      setAllChannels(data.channels);
    } catch (error) {
      console.log(error);
      setErrorChannels(true);
    } finally {
      setErrorChannels(false);
      setLoadingChannels(false);
    }
  }, [debouncedInputSearch]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputSearch(e.target.value);
    },
    []
  );

  const handleCancelSearch = useCallback(() => {
    setChangeView(false);
    setInputSearch("");
  }, []);

  const handleTabChange = useCallback((value: typeof selectedTab) => {
    setSelectedTab(value);
    setInputSearch("");
  }, []);

  const filteredChannels = useMemo(() => {
    return allChannels.map((channel, channelIndex, arr) => (
      <span
        onClick={() => router.push(`/channel/${channel.id}`)}
        className="cursor-pointer"
      >
        <div className="w-full px-[16px] py-[20px] flex items-center justify-start gap-[10px]">
          <Image
            className="w-[40px] h-[40px] rounded-[20px] object-cover"
            src={channel.image_url}
            alt={channel.id}
            width={40}
            height={40}
            loading="lazy"
            style={{ aspectRatio: "1 / 1" }}
          />
          <div className="flex flex-col items-start gap-[2px]">
            <p className="font-bold text-[18px] leading-auto">
              {channel.name}&nbsp;
            </p>
            <p className="font-normal text-[12px] leading-auto text-gray-text-1">
              /{channel.id}
            </p>
          </div>
        </div>
        {channelIndex === arr.length - 1 ? null : (
          <hr className="border border-t-divider" />
        )}
      </span>
    ));
  }, [allChannels, debouncedInputSearch]);

  const renderedTrendingChannels = useMemo(() => {
    return trendingChannels.map((tc) => (
      <span
        onClick={() => router.push(`/channel/${tc.channel.id}`)}
        key={tc.channel.id}
        className="cursor-pointer"
      >
        <div className="flex items-center gap-3 w-[160px]">
          <Image
            src={tc.channel.image_url}
            alt={tc.channel.id}
            className="w-[70px] h-[70px] rounded-[20px] border-none object-cover"
            width={40}
            height={40}
            loading="lazy"
            style={{ aspectRatio: "1 / 1" }}
          />
          <div className="flex flex-col items-start justify-start gap-1 max-w-[80px]">
            <div className="w-full">
              <p className="font-bold leading-[20px] text-ellipsis whitespace-nowrap overflow-hidden w-full">
                {tc.channel.name}
              </p>
              <p className="font-medium text-[6px]">
                {formatNumber(tc.channel.follower_count)} followers
              </p>
            </div>
            <p className="text-black-50 text-[6px] text-ellipsis whitespace-nowrap overflow-hidden w-full">
              {tc.channel.description}
            </p>
          </div>
        </div>
      </span>
    ));
  }, [trendingChannels]);

  const renderedPowerUsers = useMemo(() => {
    return powerUsers.map((pu) => (
      <span
        onClick={() => router.push(`/profile/${pu.fid}`)}
        key={pu.fid}
        className="cursor-pointer"
      >
        <div className="flex flex-col items-center w-[90px] gap-[6px]">
          <Image
            src={pu.pfp_url}
            alt={pu.username}
            className={
              "w-[70px] h-[70px] rounded-full border-none object-cover"
            }
            width={70}
            height={70}
            loading="lazy"
            style={{ aspectRatio: "1 / 1" }}
          />
          <div className="w-full text-center">
            <p className="font-bold text-[10px] leading-[120%] text-ellipsis whitespace-nowrap overflow-hidden w-full">
              {pu.display_name}
            </p>
            <p className="text-black-50 text-[6px] text-ellipsis whitespace-nowrap overflow-hidden w-full mb-1">
              @{pu.username}
            </p>
            <p className="font-medium text-[6px]">
              {formatNumber(pu.follower_count)} followers
            </p>
          </div>
        </div>
      </span>
    ));
  }, [powerUsers]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedInputSearch(inputSearch.trim());
    }, 700);

    return () => {
      clearTimeout(handler);
    };
  }, [inputSearch]);

  useEffect(() => {
    if (selectedTab === "channels" && debouncedInputSearch) fetchAllChannels();
    if (!debouncedInputSearch) setAllChannels([]);
  }, [selectedTab, debouncedInputSearch]);

  useEffect(() => {
    const pageLoad = async () => {
      setLoadingPage(true);
      try {
        await fetchTrendingChannels();
        await fetchPowerUsers();
      } catch (e) {
        console.log(e);
      } finally {
        setLoadingPage(false);
      }
    };

    pageLoad();
  }, []);

  if (loadingPage)
    return (
      <div className="p-2 flex flex-col items-start justify-start min-h-full bg-white w-full">
        <div className="animate-pulse w-full h-[40px] bg-divider rounded-lg mb-5" />
        <div className="animate-pulse w-1/2 h-[20px] bg-divider rounded-lg mb-2" />
        <div className="animate-pulse w-full h-[300px] bg-divider rounded-lg mb-6" />
        <div className="animate-pulse w-1/2 h-[20px] bg-divider rounded-lg mb-2" />
        <div className="animate-pulse w-full h-[360px] bg-divider rounded-lg" />
      </div>
    );

  return (
    <>
      <div className="flex-1 p-4 bg-white min-h-dvh">
        <div className="w-full flex items-center gap-1 mb-4">
          <div className="w-full grow items-center bg-frame-btn-bg relative rounded-[12px] py-2 pl-[42px] pr-4">
            <Image
              src="/icons/input-search-icon.svg"
              alt="input-search"
              width={22}
              height={22}
              className="absolute left-[16px]"
              loading="lazy"
              style={{ aspectRatio: "1 / 1" }}
            />
            <input
              className="p-0 outline-none border-none w-full bg-inherit placeholder:text-black-40"
              placeholder="Search users, channels"
              value={inputSearch}
              onChange={handleInputChange}
              onFocus={() => setChangeView(true)}
            />
          </div>
          {changeView ? (
            <button
              onClick={handleCancelSearch}
              className="grow bg-none text-black-50 p-0 m-0 border-none outline-none"
            >
              Cancel
            </button>
          ) : null}
        </div>
        {changeView ? (
          <>
            <div className="flex items-start justify-start gap-2 mb-4">
              {tabs.map((t) => (
                <p
                  className={`flex-grow text-center text-[16px] leading-[120%] font-600 ${
                    t.value === selectedTab
                      ? "text-black border-b-2 border-b-purple"
                      : "text-tab-unselected-color"
                  } pb-[2px] cursor-pointer`}
                  onClick={() => handleTabChange(t.value as typeof selectedTab)}
                >
                  {t.label}
                </p>
              ))}
            </div>
            {selectedTab === "users" ? (
              <SearchUsers input={debouncedInputSearch} />
            ) : selectedTab === "casts" ? (
              <SearchCasts input={debouncedInputSearch} />
            ) : loadingChannels ? (
              <div className="p-2 flex flex-col items-start justify-start gap-2 h-full bg-white">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div
                    className="animate-pulse w-full h-[80px] rounded-lg bg-divider"
                    key={index}
                  />
                ))}
              </div>
            ) : errorChannels ? null : (
              filteredChannels
            )}
          </>
        ) : (
          <>
            <div className="flex w-full flex-col gap-6 items-start justify-start">
              {trendingChannels.length ? (
                <div className="w-full flex flex-col items-start justify-start gap-2">
                  <div className="flex items-center gap-[6px]">
                    <Image
                      src="/icons/trending-channels-icon.svg"
                      alt="trending-channels"
                      width={22}
                      height={22}
                      loading="lazy"
                      style={{ aspectRatio: "1 / 1" }}
                    />
                    <p className="font-medium text-[20px] leading-[24px]">
                      Trending Channels
                    </p>
                  </div>
                  <div className="w-full overflow-x-auto no-scrollbar">
                    <div className="grid grid-rows-3 grid-flow-col gap-5">
                      {renderedTrendingChannels}
                    </div>
                  </div>
                </div>
              ) : null}
              {powerUsers.length ? (
                <div className="w-full flex flex-col items-start justify-start gap-2">
                  <div className="flex items-center gap-[6px]">
                    <Image
                      src="/icons/power-users-icon.svg"
                      alt="power-users"
                      width={22}
                      height={22}
                      loading="lazy"
                      style={{ aspectRatio: "1 / 1" }}
                      className="rounded-full"
                    />
                    <p className="font-medium text-[20px] leading-[24px]">
                      People to follow
                    </p>
                  </div>
                  <div className="w-full overflow-x-auto no-scrollbar">
                    <div className="grid grid-rows-3 grid-flow-col gap-4">
                      {renderedPowerUsers}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </>
  );
});

export default Search;
