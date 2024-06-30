"use client";
import { FC, useEffect, useState } from "react";
import SearchUsers from "./search-users";
import Link from "next/link";

const tabs = [
  {
    label: "Users",
    value: "users",
  },
  {
    label: "Channels",
    value: "channels",
  },
];

const Search: FC = () => {
  const [selectedTab, setSelectedTab] = useState<"users" | "channels">("users");
  const [inputSearch, setInputSearch] = useState("");
  const [debouncedInputSearch, setDebouncedInputSearch] = useState("");
  const [allChannels, setAllChannels] = useState<
    { id: string; image_url: string }[]
  >([]);

  const fetchAllChannels = async () => {
    const res = await fetch("/api/search-channels", {
      method: "POST",
      body: JSON.stringify({ q: debouncedInputSearch }),
    });
    const data = await res.json();
    setAllChannels(data.channels);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedInputSearch(inputSearch.trim());
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [inputSearch]);

  useEffect(() => {
    if (selectedTab === "channels" && debouncedInputSearch) fetchAllChannels();
  }, [selectedTab, debouncedInputSearch]);

  return (
    <>
      <div className="flex-1 p-4">
        <div className="w-full items-center bg-frame-btn-bg relative rounded-[12px] py-2 pl-[42px] pr-4 mb-4">
          <img
            src="/icons/input-search-icon.svg"
            alt="input-search"
            width={22}
            height={22}
            className="absolute left-[16px]"
          />
          <input
            className="p-0 outline-none border-none w-full bg-inherit placeholder:text-black-40"
            placeholder="Search users, channels"
            value={debouncedInputSearch}
            onChange={(e) => setInputSearch(e.target.value)}
          />
        </div>
        <div className="flex items-start justify-start gap-2 mb-4">
          {tabs.map((t) => (
            <p
              className={`flex-grow text-center text-[16px] leading-[120%] font-600 ${
                t.value === selectedTab
                  ? "text-black border-b-2 border-b-purple"
                  : "text-tab-unselected-color"
              } pb-[2px] cursor-pointer`}
              onClick={() => setSelectedTab(t.value as typeof selectedTab)}
            >
              {t.label}
            </p>
          ))}
        </div>
        {selectedTab === "users" ? (
          <SearchUsers input={debouncedInputSearch} />
        ) : (
          allChannels.map((channel, channelIndex, arr) => (
            <Link href={`/channel/${channel.id}`}>
              <div className="w-full px-[16px] py-[20px] flex items-center justify-start gap-[10px]">
                <img
                  className="w-[40px] h-[40px] rounded-[20px] object-cover"
                  src={channel.image_url}
                  alt={channel.id}
                />
                <div className="flex flex-col items-start gap-[2px]">
                  <p className="font-bold text-[18px] leading-auto">
                    {channel.id}&nbsp;
                  </p>
                  <p className="font-normal text-[12px] leading-auto text-gray-text-1">
                    /{channel.id}
                  </p>
                </div>
              </div>
              {channelIndex === arr.length - 1 ? null : (
                <hr className="border border-t-divider" />
              )}
            </Link>
          ))
        )}
      </div>
    </>
  );
};

export default Search;
