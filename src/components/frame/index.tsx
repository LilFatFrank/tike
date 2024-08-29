"use client";
import timeAgo from "@/utils/timeAgo";
import { useNeynarContext } from "@neynar/react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  const [frameInput, setFrameInput] = useState<string>("");
  const [castOptionType, setCastOptionType] = useState<"delete" | "copy-hash">(
    "delete"
  );
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [openCastOptions, setOpenCastOptions] = useState(false);

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

  const deleteCast = async () => {
    try {
      const res = await fetch(`/api/delete-cast`, {
        method: "POST",
        body: JSON.stringify({
          hash: frame?.hash,
          uuid: user?.signer_uuid,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDeleteSuccess(true);
        toast.success("Cast Deleted!");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error deleting cast!");
    }
  };

  return deleteSuccess ? (
    <>
      <div className="w-full px-[16px] py-[20px]" style={{ ...style }}>
        <div className="flex items-center justify-between w-full">
          This frame was deleted!
        </div>
      </div>
    </>
  ) : (
    <>
      <div className="w-full px-[16px] py-[20px]" style={{ ...style }}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center justify-start gap-[10px] mb-[10px]">
            <span
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                router.push(`/profile/${frame?.author?.fid}`);
              }}
              className="cursor-pointer"
            >
              <img
                className="w-[40px] h-[40px] rounded-[20px] object-cover"
                src={frame?.author?.pfp_url}
                alt={frame?.author?.username}
              />
            </span>
            <div className="flex flex-col items-start gap-[2px]">
              <p className="font-bold text-[18px] leading-auto">
                {frame?.author?.display_name}&nbsp;
              </p>
              <div className="flex items-center justify-start gap-1">
                {type !== "reply" && frame?.channel ? (
                  <span className="font-normal text-[12px] leading-auto text-gray-text-1">
                    posted in&nbsp;
                    <span
                      className="font-normal text-[12px] leading-auto text-black cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        router.push(`/channel/${frame?.channel.id}`);
                      }}
                    >
                      /{frame?.channel.id}
                    </span>
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
          {frame?.author?.fid === user?.fid ? (
            <div className="relative">
              <img
                src="/icons/cast-more-icon.svg"
                alt="cast-more"
                className="w-6 h-6 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setOpenCastOptions(!openCastOptions);
                }}
              />
              <div
                className={`absolute right-0 top-full bg-white transition-all duration-300 ease-in-out rounded-[18px] shadow-comment-upload-media-modal w-[150px] ${
                  openCastOptions
                    ? "opacity-100 visible z-[99]"
                    : "opacity-0 invisible z-[-1]"
                }`}
              >
                <div className="flex flex-col w-full items-center justify-center p-2 rounded-[18px] gap-1">
                  <div
                    className={`cursor-pointer w-full px-2 py-[10px] flex items-center justify-start gap-[2px] rounded-[12px] hover:bg-frame-btn-bg ${
                      castOptionType === "delete"
                        ? "bg-frame-btn-bg ring-inset ring-1 ring-black/10"
                        : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setCastOptionType("delete");
                      deleteCast();
                    }}
                  >
                    <img
                      src="/icons/delete-post-icon.svg"
                      alt="delete"
                      className="w-6 h-6"
                    />
                    <span className="font-medium leading-[22px]">
                      Delete Post
                    </span>
                  </div>
                  <div
                    className={`cursor-pointer w-full px-2 py-[10px] flex items-center justify-start gap-[2px] rounded-[12px] hover:bg-frame-btn-bg ${
                      castOptionType === "copy-hash"
                        ? "bg-frame-btn-bg ring-inset ring-1 ring-black/10"
                        : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setCastOptionType("copy-hash");
                      window.navigator.clipboard.writeText(frame?.hash);
                      toast.success("Hash copied!");
                    }}
                  >
                    <img
                      src="/icons/copy-hash-icon.svg"
                      alt="delete"
                      className="w-6 h-6"
                    />
                    <span className="font-medium leading-[22px]">
                      Copy Hash
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
        {frame?.text ? (
          <p className="text-[18px] font-medium text-black w-full mb-[4px] break-words">
            <StringProcessor
              inputString={frame?.text}
              mentionedProfiles={frame?.mentioned_profiles}
            />
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
        <span
          className="w-full cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            window.open(
              `https://warpcast.com/${frame?.author.username}/${frame?.hash}`,
              "_blank",
              "noreferrer noopener"
            );
          }}
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
        </span>
      </div>
    </>
  );
};

export default Frame;
