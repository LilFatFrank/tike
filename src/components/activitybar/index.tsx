"use client";
import { FC, useEffect, useRef, useState } from "react";
import Sidebar from "../sidebar";
import Link from "next/link";
import { useNeynarContext } from "@neynar/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const ActivityBar: FC = () => {
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

  const fetchAllChannels = async () => {
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
  };

  useEffect(() => {
    if (!called.current) fetchAllChannels();
  }, [called.current]);

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
          onClick={() => setOpenSidebar(true)}
        />
        <Link href={"/updates"}>
          <img
            src="/icons/bell-icon.svg"
            alt="bell"
            width={32}
            height={32}
            className="cursor-pointer"
          />
        </Link>
      </div>
      <Sidebar isOpen={openSidebar}>
        <div className="flex flex-col w-fit h-full">
          <div className="py-3 px-4 flex items-center justify-between">
            <span
              className="py-[6px] px-2 rounded-[20px] bg-black border-none text-white font-medium leading-[120%] flex items-center cursor-pointer"
              onClick={() => setOpenSidebar(false)}
            >
              <img
                src="/icons/close-sidebar-icon.svg"
                alt="close"
                width={16}
                height={16}
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
                setOpenSidebar(false);
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
            <div
              className="py-1 cursor-pointer flex items-center justify-start gap-1"
              onClick={() => {
                push("?filter=image");
                setOpenSidebar(false);
              }}
            >
              <img
                src={
                  filter === "image"
                    ? "/icons/image-filter-icon.svg"
                    : "/icons/image-icon.svg"
                }
                alt={"image"}
                width={24}
                height={24}
              />
              <p
                className={`${
                  filter === "image" ? "text-purple" : "text-black"
                } text-[24px] leading-[120%] font-medium`}
              >
                Image
              </p>
            </div>
            <div
              className="py-1 cursor-pointer flex items-center justify-start gap-1"
              onClick={() => {
                push("?filter=video");
                setOpenSidebar(false);
              }}
            >
              <img
                src={
                  filter === "video"
                    ? "/icons/video-filter-icon.svg"
                    : "/icons/video-icon.svg"
                }
                alt={"video"}
                width={24}
                height={24}
              />
              <p
                className={`${
                  filter === "video" ? "text-purple" : "text-black"
                } text-[24px] leading-[120%] font-medium`}
              >
                Video
              </p>
            </div>
            <div
              className="py-1 cursor-pointer flex items-center justify-start gap-1"
              onClick={() => {
                push("?filter=audio");
                setOpenSidebar(false);
              }}
            >
              <img
                src={
                  filter === "audio"
                    ? "/icons/music-filter-icon.svg"
                    : "/icons/music-icon.svg"
                }
                alt={"music"}
                width={24}
                height={24}
              />
              <p
                className={`${
                  filter === "audio" ? "text-purple" : "text-black"
                } text-[24px] leading-[120%] font-medium`}
              >
                Music
              </p>
            </div>
            <div
              className="py-1 cursor-pointer flex items-center justify-start gap-1"
              onClick={() => {
                push("/frames");
                setOpenSidebar(false);
              }}
            >
              <img
                src={
                  pathname === "/frames"
                    ? "/icons/frame-filter-icon.svg"
                    : "/icons/frame-icon.svg"
                }
                alt={"frame"}
                width={24}
                height={24}
              />
              <p
                className={`${
                  pathname === "/frames" ? "text-purple" : "text-black"
                } text-[24px] leading-[120%] font-medium`}
              >
                Frame
              </p>
            </div>
          </div>
          {loadingChannels || errorChannels ? null : (
            <div className="py-[10px] px-4">
              <p className="text-black/50 text-[14px] font-medium leading-[22px] mb-1">
                Channel
              </p>
              {channels.map((c) => (
                <span
                  className="py-1 flex items-center justify-start gap-1 mb-1 cursor-pointer"
                  key={c.id}
                  onClick={() => {
                    setOpenSidebar(false);
                    push(`/channel/${c.id}`);
                  }}
                >
                  <img
                    src={c.image_url}
                    alt={c.id}
                    width={22}
                    height={22}
                    className="rounded-[6px]"
                  />
                  <p className="text-black text-[16px] leading-[22px] font-medium">
                    {c.name}
                  </p>
                </span>
              ))}
            </div>
          )}
        </div>
      </Sidebar>
    </>
  );
};

export default ActivityBar;
