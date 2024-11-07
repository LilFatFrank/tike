"use client";
import {
  FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Sidebar from "../sidebar";
import Link from "next/link";
import { useNeynarContext } from "@neynar/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const filterItems = [
  { name: "Image", param: "image", path: "?filter=image" },
  { name: "Video", param: "video", path: "?filter=video" },
  { name: "Music", param: "audio", path: "?filter=audio" },
  { name: "Frame", param: "frame", path: "/frames" },
];

const FilterItem = memo(
  ({
    name,
    icon,
    activeIcon,
    isActive,
    onClick,
  }: {
    name: string;
    icon: string;
    activeIcon: string;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <div
      className="py-1 cursor-pointer flex items-center justify-start gap-1"
      onClick={onClick}
    >
      <img
        src={isActive ? activeIcon : icon}
        alt={name}
        width={24}
        height={24}
        loading="lazy"
        style={{ aspectRatio: "1 / 1" }}
      />
      <p
        className={`${
          isActive ? "text-purple" : "text-black"
        } text-[24px] leading-[120%] font-medium`}
      >
        {name}
      </p>
    </div>
  )
);

const ActivityBar: FC = memo(() => {
  const { user } = useNeynarContext();

  const [openSidebar, setOpenSidebar] = useState(false);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [channels, setChannels] = useState<any[]>([]);
  const [errorChannels, setErrorChannels] = useState(false);
  const [filter, setFilter] = useState<
    null | "video" | "image" | "audio" | "frame"
  >(null);

  const called = useRef<boolean>(false);

  const { push } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fetchAllChannels = useCallback(async () => {
    try {
      called.current = true;
      setLoadingChannels(true);
      const res = await fetch("/api/active-channels", {
        method: "POST",
        body: JSON.stringify({ fid: user?.fid }),
      });
      const data = await res.json();
      setChannels(data.channels);
    } catch (error) {
      console.log(error);
      setErrorChannels(true);
      called.current = false;
    } finally {
      setErrorChannels(false);
      setLoadingChannels(false);
    }
  }, [user?.fid]);

  const handleSidebarOpen = useCallback(() => setOpenSidebar(true), []);
  const handleSidebarClose = useCallback(() => setOpenSidebar(false), []);

  const renderedChannels = useMemo(
    () =>
      channels.map((c) => (
        <span
          className="py-1 flex items-center justify-start gap-1 mb-1 cursor-pointer"
          key={c.id}
          onClick={() => {
            handleSidebarClose();
            push(`/channel/${c.id}`);
          }}
        >
          <img
            src={c.image_url}
            alt={c.id}
            width={22}
            height={22}
            className="rounded-[6px]"
            loading="lazy"
            style={{ aspectRatio: "1 / 1" }}
          />
          <p className="text-black text-[16px] leading-[22px] font-medium">
            {c.name}
          </p>
        </span>
      )),
    [channels, handleSidebarClose, push]
  );

  useEffect(() => {
    if (!called.current && user?.fid) fetchAllChannels();
  }, [called.current, user?.fid]);

  useEffect(() => {
    if (pathname === "/") {
      setFilter(searchParams?.get("filter") as typeof filter);
    }
    if (pathname === "/frames") {
      setFilter("frame");
    }
  }, [searchParams, pathname]);

  return (
    <>
      <div
        className={`w-full py-3 px-4 flex items-center justify-between ${
          openSidebar ? "invisible" : ""
        }`}
      >
        <img
          src="/icons/sidebar-icon.svg"
          alt="sidebar"
          width={32}
          height={32}
          className="cursor-pointer"
          loading="lazy"
          onClick={handleSidebarOpen}
          style={{ aspectRatio: "1 / 1" }}
        />
        <div className="flex items-center gap-2">
          <Link href={"/updates"}>
            <img
              src="/icons/bell-icon.svg"
              alt="bell"
              width={32}
              height={32}
              className="cursor-pointer"
              loading="lazy"
              style={{ aspectRatio: "1 / 1" }}
            />
          </Link>
          <Link href={"/pirate-mode"}>
            <img
              src="/icons/pirate-mode-icon.svg"
              alt="pirate-mode"
              width={24}
              height={24}
              className="cursor-pointer"
              loading="lazy"
            />
          </Link>
        </div>
      </div>
      <Sidebar isOpen={openSidebar}>
        <div className="flex flex-col w-fit h-full">
          <div className="py-3 px-4 flex items-center justify-between">
            <span
              className="py-[6px] px-2 rounded-[20px] bg-black border-none text-white font-medium leading-[120%] flex items-center cursor-pointer"
              onClick={handleSidebarClose}
            >
              <img
                src="/icons/close-sidebar-icon.svg"
                alt="close"
                width={16}
                height={16}
                loading="lazy"
                style={{ aspectRatio: "1 / 1" }}
              />
              Close
            </span>
          </div>
          <div className="py-[10px] px-4">
            <p className="text-black/50 text-[14px] font-medium leading-[22px]">
              Filter
            </p>
            <div
              className="py-1 cursor-pointer"
              onClick={() => {
                push("/");
                handleSidebarClose();
              }}
            >
              <p
                className={`${
                  !filter ? "text-purple" : "text-black"
                } text-[24px] leading-[120%] font-medium`}
              >
                All
              </p>
            </div>
            {filterItems.map((item) => (
              <FilterItem
                key={item.param}
                name={item.name}
                icon={`/icons/${
                  item.param === "audio" ? "music" : item.param
                }-icon.svg`}
                activeIcon={`/icons/${
                  item.param === "audio" ? "music" : item.param
                }-filter-icon.svg`}
                isActive={filter === item.param}
                onClick={() => {
                  push(item.path);
                  handleSidebarClose();
                }}
              />
            ))}
          </div>
          {loadingChannels || errorChannels ? null : (
            <div className="py-[10px] px-4">
              <p className="text-black/50 text-[14px] font-medium leading-[22px] mb-1">
                Channel
              </p>
              {renderedChannels}
            </div>
          )}
        </div>
      </Sidebar>
    </>
  );
});

export default ActivityBar;
