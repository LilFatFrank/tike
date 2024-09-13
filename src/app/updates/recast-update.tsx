"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FC, memo, useCallback } from "react";

interface RecastUpdate {
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

const RecastUpdate: FC<RecastUpdate> = memo(
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

    return (
      <span onClick={handleCastClick} className="w-full cursor-pointer">
        <div className={`w-full py-5 px-4`}>
          <div className="w-full flex items-start justify-start gap-[10px]">
            <div className="w-full flex items-start justify-start gap-[10px]">
              <Image
                src={icon}
                alt={"recast"}
                className="w-10 h-10 rounded-full"
                width={40}
                height={40}
                loading="lazy"
                style={{ aspectRatio: "1 / 1" }}
              />
              <div className="grow flex items-start justify-start gap-[10px]">
                <span
                  onClick={handleCastClick}
                  className="w-10 h-10 flex-shrink-0 cursor-pointer"
                >
                  <Image
                    src={userPfp}
                    alt={userName}
                    className="w-full h-full rounded-full"
                    width={40}
                    height={40}
                    loading="lazy"
                    style={{ aspectRatio: "1 / 1" }}
                  />
                </span>
                <div className="flex flex-col items-start justify-start gap-[6px]">
                  <p className="font-bold text-[18px] leading-[22px]">
                    <span
                      onClick={handleProfileClick}
                      className="cursor-pointer"
                    >
                      {userName}
                    </span>
                    <span className="font-normal text-[#A1A1A1] text-[12px] leading-[auto] relative bottom-[2px]">
                      &nbsp;recasted
                    </span>
                  </p>
                  {cast.text ? (
                    <p className="grow text-[#A1A1A1] text-[12px] leading-[auto] line-clamp-2 break-normal">
                      {cast.text}
                    </p>
                  ) : null}
                </div>
              </div>
              {cast.url ? (
                <Image
                  src={cast.url}
                  alt={"media"}
                  className="w-full rounded-[10px] object-cover"
                  width={40}
                  height={40}
                  loading="lazy"
                  style={{ aspectRatio: "1 / 1" }}
                />
              ) : null}
            </div>
          </div>
        </div>
      </span>
    );
  }
);

export default RecastUpdate;
