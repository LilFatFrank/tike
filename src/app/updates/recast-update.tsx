import Link from "next/link";
import { FC } from "react";

interface RecastUpdate {
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

const RecastUpdate: FC<RecastUpdate> = ({
  icon,
  userPfp,
  userName,
  fid,
  cast,
}) => {
  return (
    <Link href={`/cast/${cast.hash}`} className="w-full">
      <div className={`w-full py-5 px-4`}>
        <div className="w-full flex items-start justify-start gap-[10px]">
          <div className="w-full flex items-start justify-start gap-[10px]">
            <img src={icon} alt={"recast"} className="w-10 h-10 rounded-full" />
            <div className="grow flex items-start justify-start gap-[10px]">
              <Link
                href={`/profile/${fid}`}
                onClick={(e) => e.stopPropagation()}
                className="w-10 h-10 flex-shrink-0"
              >
                <img
                  src={userPfp}
                  alt={userName}
                  className="w-full h-full rounded-full"
                />
              </Link>
              <div className="flex flex-col items-start justify-start gap-[6px]">
                <p className="font-bold text-[18px] leading-[22px]">
                  <Link
                    href={`/profile/${fid}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {userName}
                  </Link>
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
              <img
                src={cast.url}
                alt={"media"}
                className="w-full rounded-[10px] object-cover"
              />
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RecastUpdate;
