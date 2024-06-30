"use client";
import formatNumber from "@/utils/formatNumber";
import timeAgo from "@/utils/timeAgo";
import Link from "next/link";
import { FC } from "react";

interface Frame {
  frame: any;
}

const Frame: FC<Frame> = ({ frame }) => {
  return (
    <>
      <>
        <div className="w-full px-[16px] py-[20px]">
          <div className="flex items-center justify-start gap-[10px] mb-[10px]">
            <Link href={`/profile/${frame.author.fid}`}>
              <img
                className="w-[40px] h-[40px] rounded-[20px] object-cover"
                src={frame.author.pfp_url}
                alt={frame.author.username}
              />
            </Link>
            <div className="flex flex-col items-start gap-[2px]">
              <p className="font-bold text-[18px] leading-auto">
                {frame.author.display_name}&nbsp;
              </p>
              <div className="flex items-center justify-start gap-1">
                {frame.channel ? (
                  <span className="font-normal text-[12px] leading-auto text-gray-text-1">
                    posted in&nbsp;
                    <Link
                      href={`/channel/${frame.channel.id}`}
                      className="font-normal text-[12px] leading-auto text-black"
                    >
                      /{frame.channel.id}
                    </Link>
                  </span>
                ) : null}
                <span className="font-normal text-[12px] leading-auto text-gray-text-1">
                  {timeAgo(frame.timestamp)}
                </span>
              </div>
            </div>
          </div>
          {frame.text ? (
            <p className="text-[18px] font-medium text-black w-full mb-[4px] break-words">
              {frame.text}
            </p>
          ) : null}
          <img
            src={frame?.frames[0]?.image}
            alt="Cast image"
            className="w-full object-contain rounded-[10px] mb-[12px]"
          />
          <Link
            className="w-full"
            href={`https://warpcast.com/${frame.author.username}/${frame.hash}`}
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
          <div className="w-full flex items-center justify-between mt-[16px]">
            <div className="flex items-center justify-start gap-[14px]">
              <div className="flex items-center gap-[2px] cursor-pointer">
                <img src="/icons/like.svg" alt="like" width={24} height={24} />
                <p className="text-[14px] leading-auto font-normal">
                  {formatNumber(frame.reactions.likes_count)}
                </p>
              </div>
              <div className="flex items-center gap-[2px] cursor-not-allowed opacity-[0.4]">
                <img
                  src="/icons/comment.svg"
                  alt="comment"
                  width={24}
                  height={24}
                />
                <p className="text-[14px] leading-auto font-normal">
                  {formatNumber(frame.replies.count)}
                </p>
              </div>
              <div className="flex items-center gap-[2px] cursor-pointer">
                <img
                  src="/icons/recast.svg"
                  alt="recast"
                  width={24}
                  height={24}
                />
                <p className="text-[14px] leading-auto font-normal">
                  {formatNumber(frame.reactions.recasts_count)}
                </p>
              </div>
            </div>
            <button
              className="bg-none border-none m-0 p-0"
              onClick={() =>
                window.navigator.clipboard.writeText(
                  `https://warpcast.com/${frame.author.username}/${frame.hash}`
                )
              }
            >
              <img src="/icons/share.svg" alt="share" width={24} height={24} />
            </button>
          </div>
        </div>
      </>
    </>
  );
};

export default Frame;
