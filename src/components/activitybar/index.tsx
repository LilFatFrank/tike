"use client";
import {
  FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  Suspense,
} from "react";
import Sidebar from "../sidebar";
import Link from "next/link";
import { useNeynarContext } from "@neynar/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import SignInModal from "../signinmodal";

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

interface SearchParamsHandlers {
  setFilterFromParams: (filter: "video" | "image" | "audio" | "frame" | null) => void;
}

const SearchParamsWrapper = forwardRef<
  SearchParamsHandlers,
  { onFilterChange: (filter: "video" | "image" | "audio" | "frame" | null) => void }
>(({ onFilterChange }, ref) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/") {
      onFilterChange(searchParams?.get("filter") as "video" | "image" | "audio" | null);
    }
    if (pathname === "/frames") {
      onFilterChange("frame");
    }
  }, [searchParams, pathname, onFilterChange]);

  useImperativeHandle(ref, () => ({
    setFilterFromParams: onFilterChange
  }), [onFilterChange]);

  return null;
});

SearchParamsWrapper.displayName = 'SearchParamsWrapper';

const ActivityBar: FC = memo(() => {
  const { user } = useNeynarContext();

  const [openSidebar, setOpenSidebar] = useState(false);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [channels, setChannels] = useState<any[]>([]);
  const [errorChannels, setErrorChannels] = useState(false);
  const [openSignInModal, setOpenSignInModal] = useState(false);
  const [filter, setFilter] = useState<
    null | "video" | "image" | "audio" | "frame"
  >(null);

  const called = useRef<boolean>(false);

  const { push } = useRouter();
  const searchParamsRef = useRef<SearchParamsHandlers>(null);

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

  const handleFilterChange = useCallback((newFilter: typeof filter) => {
    setFilter(newFilter);
  }, []);

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

  return (
    <>
      <Suspense fallback={null}>
        <SearchParamsWrapper 
          ref={searchParamsRef}
          onFilterChange={handleFilterChange}
        />
      </Suspense>

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
          {user ? (
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
          ) : (
            <span
              className="cursor-pointer"
              onClick={() => setOpenSignInModal(true)}
            >
              <img
                src="/icons/bell-icon.svg"
                alt="bell"
                width={32}
                height={32}
                className="cursor-pointer"
                loading="lazy"
                style={{ aspectRatio: "1 / 1" }}
              />
            </span>
          )}
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
          {loadingChannels ||
          errorChannels ||
          renderedChannels.length === 0 ? null : (
            <div className="py-[10px] px-4">
              <p className="text-black/50 text-[14px] font-medium leading-[22px] mb-1">
                Channel
              </p>
              {renderedChannels}
            </div>
          )}
        </div>
      </Sidebar>
      <SignInModal
        open={openSignInModal}
        closeModal={() => setOpenSignInModal(false)}
      />
    </>
  );
});

export default ActivityBar;
