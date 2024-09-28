"use client";
import { useRouter } from "next/navigation";
import { FC, memo, useCallback, useMemo } from "react";

interface ReplyUpdate {
  icon: string;
  userName: string;
  userPfp: string;
  fid: string;
  cast: {
    parent_hash: string;
    hash: string;
    url?: string;
    text?: string;
  };
}

const ReplyUpdate: FC<ReplyUpdate> = memo(
  ({ icon, userPfp, userName, fid, cast }) => {
    const router = useRouter();

    const handleCastClick = useCallback(
      () => router.push(`/cast/${cast.parent_hash || cast.hash}`),
      [router, cast.parent_hash, cast.hash]
    );

    const handleProfileClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        router.push(`/profile/${fid}`);
      },
      [router, fid]
    );

    const renderedContent = useMemo(
      () => (
        <div className="flex flex-col items-start justify-start gap-[6px]">
          <p className="font-bold text-[18px] leading-[22px]">
            <span onClick={handleProfileClick} className="cursor-pointer">
              {userName}
            </span>
            <span className="font-normal text-[#A1A1A1] text-[12px] leading-[auto] relative bottom-[2px]">
              &nbsp;replied
            </span>
          </p>
          {cast.text && (
            <p className="grow text-[#A1A1A1] text-[12px] leading-[auto] line-clamp-2 break-normal">
              {cast.text}
            </p>
          )}
        </div>
      ),
      [userName, handleProfileClick, cast.text]
    );

    return (
      <div
        onClick={handleCastClick}
        className="w-full py-5 px-4 cursor-pointer"
      >
        <div className="flex items-start gap-[10px]">
          <img
            src={icon}
            alt="reply"
            width={40}
            height={40}
            className="rounded-full"
            loading="lazy"
            style={{ aspectRatio: "1 / 1" }}
          />
          <div className="grow flex items-start gap-[10px]">
            <span
              onClick={handleProfileClick}
              className="flex-shrink-0 cursor-pointer"
            >
              <img
                src={userPfp}
                alt={userName}
                width={40}
                height={40}
                className="rounded-full"
                loading="lazy"
                style={{ aspectRatio: "1 / 1" }}
              />
            </span>
            {renderedContent}
          </div>
          {cast.url && (
            <img
              src={cast.url}
              alt="media"
              width={200}
              height={200}
              className="w-full rounded-[10px] object-cover"
              loading="lazy"
              style={{ aspectRatio: "1 / 1" }}
            />
          )}
        </div>
      </div>
    );
  }
);

export default ReplyUpdate;
