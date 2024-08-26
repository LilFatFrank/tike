"use client";
import timeAgo from "@/utils/timeAgo";
import { useNeynarContext } from "@neynar/react";
import Link from "next/link";
import { CSSProperties, FC, useState } from "react";
import { toast } from "sonner";
import StringProcessor from "../stringprocessor";

interface Frame {
  frame: any;
  style?: CSSProperties;
  type?: "default" | "reply";
}

const Frame: FC<Frame> = ({ frame, style, type }) => {
  const { user } = useNeynarContext();

  const [frameInput, setFrameInput] = useState<string>("");

  const postFrameAction = async (req: any) => {
    try {
      const resp = await fetch(`/api/post-frame`, {
        method: "POST",
        body: JSON.stringify(req),
      });
      console.log(resp);
    } catch (error) {
      console.log(error);
      toast.error("Error interacting with frame!");
    }
  };

  return (
    <>
      <div className="w-full px-[16px] py-[20px]" style={{ ...style }}>
        <div className="flex items-center justify-start gap-[10px] mb-[10px]">
          <Link
            href={`/profile/${frame?.author.fid}`}
            onClick={(e) => e.stopPropagation()}
          >
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
              {type !== "reply" && frame?.channel ? (
                <span className="font-normal text-[12px] leading-auto text-gray-text-1">
                  posted in&nbsp;
                  <Link
                    href={`/channel/${frame?.channel.id}`}
                    className="font-normal text-[12px] leading-auto text-black"
                    onClick={(e) => e.stopPropagation()}
                  >
                    /{frame?.channel.id}
                  </Link>
                </span>
              ) : (
                <span className="font-normal text-[12px] leading-auto text-gray-text-1">
                  @{frame?.author?.username}
                </span>
              )}
              <span className="font-normal text-[12px] leading-auto text-gray-text-1">
                {timeAgo(frame?.timestamp)}
              </span>
            </div>
          </div>
        </div>
        {frame?.text ? (
          <p className="text-[18px] font-medium text-black w-full mb-[4px] break-words">
            <StringProcessor inputString={frame?.text} mentionedProfiles={frame?.mentioned_profiles} />
          </p>
        ) : null}
        <img
          src={frame?.frames[0]?.image}
          alt="Cast image"
          className="w-full object-contain rounded-[10px] mb-[12px]"
        />
        {/* {frame?.frames[0]?.input &&
        Object.keys(frame?.frames[0]?.input)?.length ? (
          <input
            className="border border-frame-btn-bg rounded-[12px] py-2 px-4 outline-none w-full bg-inherit placeholder:text-black-40 mb-1"
            placeholder={frame?.frames[0]?.input.text}
          />
        ) : null}
        {frame?.frames[0]?.buttons?.map((b: any, i: number, arr: []) => (
          <button
            className={`frame-btn ${i === arr.length - 1 ? "" : "mb-1"}`}
            key={b.index}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <p className="font-medium">{b.title}</p>
          </button>
        ))} */}
        <Link
          className="w-full"
          href={`https://warpcast.com/${frame?.author.username}/${frame?.hash}`}
          target="_blank"
          rel="noreferrer noopener"
          onClick={(e) => e.stopPropagation()}
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
  );
};

export default Frame;
