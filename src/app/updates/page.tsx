"use client";
import { FC, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import ForYou from "./for-you";

const Updates: FC = () => {
  const [selectedTab, setSelectedTab] = useState<
    "all" | "for-you" | "watchlist"
  >("all");

  const { back } = useRouter();
  const handleBack = useCallback(() => back(), [back]);

  return (
    <>
      <div className="flex-1 bg-white min-h-full">
        <div className="w-full py-3 px-4 flex items-center justify-start gap-1">
          <img
            src="/icons/back-icon.svg"
            alt="back"
            width={24}
            height={24}
            className="cursor-pointer"
            onClick={handleBack}
            loading="lazy"
          />
          <p className="text-[20px] font-medium leading-[100%]">Updates</p>
        </div>
        {/* <div className="py-[10px] px-2 flex items-center justify-start gap-1">
          <div
            className={`py-2 px-4 rounded-[12px] ${
              selectedTab === "all" ? "bg-black" : "bg-frame-btn-bg"
            } border-none cursor-pointer`}
            onClick={() => setSelectedTab("all")}
          >
            <p
              className={`text-[16px] font-medium leading-[22px] ${
                selectedTab === "all" ? "text-white" : "text-black"
              }`}
            >
              All
            </p>
          </div>
          <div
            className={`py-2 px-4 rounded-[12px] ${
              selectedTab === "for-you" ? "bg-black" : "bg-frame-btn-bg"
            } border-none cursor-pointer flex items-center gap-1`}
            onClick={() => setSelectedTab("for-you")}
          >
            <img
              src={
                selectedTab === "for-you"
                  ? "/icons/for-you-selected-icon.svg"
                  : "/icons/for-you-icon.svg"
              }
              alt="for-you"
              width={22}
              height={22}
            />
            <p
              className={`text-[16px] font-medium leading-[22px] ${
                selectedTab === "for-you" ? "text-white" : "text-black"
              }`}
            >
              For You
            </p>
          </div>
          <div
            className={`py-2 px-4 rounded-[12px] ${
              selectedTab === "watchlist" ? "bg-black" : "bg-frame-btn-bg"
            } border-none cursor-pointer flex items-center gap-1`}
            onClick={() => setSelectedTab("watchlist")}
          >
            <img
              src={
                selectedTab === "watchlist"
                  ? "/icons/watchlist-selected-icon.svg"
                  : "/icons/watchlist-icon.svg"
              }
              alt="for-you"
              width={22}
              height={22}
            />
            <p
              className={`text-[16px] font-medium leading-[22px] ${
                selectedTab === "watchlist" ? "text-white" : "text-black"
              }`}
            >
              Watchlist
            </p>
          </div>
        </div> */}
        {/* {selectedTab === "for-you" ? */} <ForYou /> {/* : null} */}
      </div>
    </>
  );
};

export default Updates;
