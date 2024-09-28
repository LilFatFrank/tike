"use client";
import { useRouter } from "next/navigation";
import { FC, memo, useCallback } from "react";

const FollowItem = memo(
  ({
    follow,
    icon,
    handleProfileClick,
    isLast,
  }: {
    follow: { fid: number; pfp: string; display_name: string };
    icon: string;
    handleProfileClick: (fid: number) => (e: React.MouseEvent) => void;
    isLast: boolean;
  }) => (
    <>
      <div className="w-full py-5 px-4" key={follow.fid}>
        <div className="w-full flex items-start justify-start gap-[10px]">
          <img
            src={icon}
            alt="follow"
            width={40}
            height={40}
            className="rounded-full aspect-square"
            style={{ aspectRatio: "1 / 1" }}
            loading="lazy"
          />
          <div className="grow flex items-center justify-start gap-[10px]">
            <span
              onClick={handleProfileClick(follow.fid)}
              className="w-10 h-10 flex-shrink-0 cursor-pointer"
            >
              <img
                src={follow.pfp}
                alt={follow.display_name}
                width={40}
                height={40}
                className="rounded-full aspect-square"
                style={{ aspectRatio: "1 / 1" }}
                loading="lazy"
              />
            </span>
            <p className="font-bold text-[18px] leading-[22px] flex flex-col items-start">
              <span
                onClick={handleProfileClick(follow.fid)}
                className="cursor-pointer"
              >
                {follow.display_name}
              </span>
              <span className="font-normal text-[#A1A1A1] text-[12px] leading-[auto] relative bottom-[2px]">
                followed you
              </span>
            </p>
          </div>
        </div>
      </div>
      {!isLast && <hr className="border border-t-divider" />}
    </>
  )
);

interface FollowUpdate {
  follows: {
    fid: number;
    pfp: string;
    display_name: string;
  }[];
  icon: string;
}

const FollowUpdate: FC<FollowUpdate> = memo(({ icon, follows }) => {
  const router = useRouter();
  const handleProfileClick = useCallback(
    (fid: number) => (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      router.push(`/profile/${fid}`);
    },
    [router]
  );

  return (
    <>
      {follows.map((follow, index) => (
        <FollowItem
          key={follow.fid}
          follow={follow}
          icon={icon}
          handleProfileClick={handleProfileClick}
          isLast={index === follows.length - 1}
        />
      ))}
    </>
  );
});

export default FollowUpdate;
