"use client";
import { useRouter } from "next/navigation";
import { FC } from "react";

interface LikeUpdate {
  icon: string;
  userName: string;
  userPfp: string;
  fid: string;
  cast: {
    hash: string;
    url?: string;
    text?: string;
  };
}

const LikeUpdate: FC<LikeUpdate> = ({ icon, userPfp, userName, fid, cast }) => {
  const router = useRouter();

  return (
    <span
      onClick={() => router.push(`/cast/${cast.hash}`)}
      className="w-full cursor-pointer"
    >
      <div className={`w-full py-5 px-4`}>
        <div className="w-full flex items-start justify-start gap-[10px]">
          <div className="w-full flex items-start justify-start gap-[10px]">
            <img src={icon} alt={"like"} className="w-10 h-10 rounded-full" />
            <div className="grow flex items-start justify-start gap-[10px]">
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  router.push(`/profile/${fid}`);
                }}
                className="w-10 h-10 flex-shrink-0"
              >
                <img
                  src={userPfp}
                  alt={userName}
                  className="w-full h-full rounded-full"
                />
              </span>
              <div className="flex flex-col items-start justify-start gap-[6px]">
                <p className="font-bold text-[18px] leading-[22px]">
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      router.push(`/profile/${fid}`);
                    }}
                  >
                    {userName}
                  </span>
                  <span className="font-normal text-[#A1A1A1] text-[12px] leading-[auto] relative bottom-[2px]">
                    &nbsp;liked
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
              <img
                src={cast.url}
                alt={"media"}
                className="w-full rounded-[10px] object-cover"
              />
            ) : null}
          </div>
        </div>
      </div>
    </span>
  );
};

export default LikeUpdate;
