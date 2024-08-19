import Link from "next/link";
import { FC } from "react";

interface FollowUpdate {
  follows: {
    fid: number;
    pfp: string;
    display_name: string;
  }[];
  icon: string;
}

const FollowUpdate: FC<FollowUpdate> = ({ icon, follows }) => {
  return follows.map((f, i, arr) => (
    <>
      <div className={`w-full py-5 px-4`} key={f.fid}>
        <div className="w-full flex items-start justify-start gap-[10px]">
          <div className="w-full flex items-start justify-start gap-[10px]">
            <img src={icon} alt={"follow"} className="w-10 h-10 rounded-full" />
            <div className="grow flex items-center justify-start gap-[10px]">
              <Link
                href={`/profile/${f.fid}`}
                onClick={(e) => e.stopPropagation()}
                className="w-10 h-10 flex-shrink-0"
              >
                <img
                  src={f.pfp}
                  alt={f.display_name}
                  className="w-full h-full rounded-full"
                />
              </Link>
              <p className="font-bold text-[18px] leading-[22px] flex flex-col items-start">
                <Link
                  href={`/profile/${f.fid}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {f.display_name}
                </Link>
                <span className="font-normal text-[#A1A1A1] text-[12px] leading-[auto] relative bottom-[2px]">
                  followed you
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
      {i === arr.length - 1 ? null : <hr className="border border-t-divider" />}
    </>
  ));
};

export default FollowUpdate;
