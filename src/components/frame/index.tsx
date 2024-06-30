"use client";
import formatNumber from "@/utils/formatNumber";
import timeAgo from "@/utils/timeAgo";
import { useNeynarContext } from "@neynar/react";
import Link from "next/link";
import { FC, useEffect, useState } from "react";

interface Frame {
  frame: any;
}

const Frame: FC<Frame> = ({ frame }) => {
  return (
    <>
      <>
        <div className="w-full px-[16px] py-[20px]">
          <div className="flex items-center justify-start gap-[10px] mb-[10px]">
            <Link href={`/profile/${frame?.author.fid}`}>
              <img
                className="w-[40px] h-[40px] rounded-[20px] object-cover"
                src={frame?.author.pfp_url}
                alt={frame?.author.username}
              />
            </Link>
            <div className="flex flex-col items-start gap-[2px]">
              <p className="font-bold text-[18px] leading-auto">
                {frame?.author.display_name}&nbsp;
              </p>
              <div className="flex items-center justify-start gap-1">
                {frame?.channel ? (
                  <span className="font-normal text-[12px] leading-auto text-gray-text-1">
                    posted in&nbsp;
                    <Link
                      href={`/channel/${frame?.channel.id}`}
                      className="font-normal text-[12px] leading-auto text-black"
                    >
                      /{frame?.channel.id}
                    </Link>
                  </span>
                ) : null}
                <span className="font-normal text-[12px] leading-auto text-gray-text-1">
                  {timeAgo(frame?.timestamp)}
                </span>
              </div>
            </div>
          </div>
          {frame?.text ? (
            <p className="text-[18px] font-medium text-black w-full mb-[4px] break-words">
              {frame?.text}
            </p>
          ) : null}
          <img
            src={frame?.frames[0]?.image}
            alt="Cast image"
            className="w-full object-contain rounded-[10px] mb-[12px]"
          />
          <Link
            className="w-full"
            href={`https://warpcast.com/${frame?.author.username}/${frame?.hash}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            <button className="frame-btn">
              <img
                src="/icons/warpcast-icon.svg"
                alt="warpcast"
                width={"20px"}
                height={"20px"}
              />
              <p className="font-medium">View in Warpcast</p>
            </button>
          </Link>
        </div>
      </>
    </>
  );
};

export default Frame;
