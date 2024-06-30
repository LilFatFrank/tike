"use client";
import { useNeynarContext } from "@neynar/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FC } from "react";
const links = [
  {
    icon: "/icons/home-icon.svg",
    selected: "/icons/home-filled-icon.svg",
    label: "Home",
    path: "/",
  },
  {
    icon: "/icons/search-icon.svg",
    selected: "/icons/search-filled-icon.svg",
    label: "Search",
    path: "/search",
  },
  {
    icon: "/icons/create-icon.svg",
    selected: "/icons/create-filled-icon.svg",
    label: "Create",
    path: "/create",
  },
  {
    icon: "/icons/frames-icon.svg",
    selected: "/icons/frames-filled-icon.svg",
    label: "Frames",
    path: "/frames",
  },
  {
    icon: "/icons/profile-icon.svg",
    selected: "/icons/profile-filled-icon.svg",
    label: "Profile",
    path: "/profile",
  },
];

const Footer: FC = () => {
  const pathname = usePathname();

  const { user } = useNeynarContext();

  if (!user) return null;

  return (
    <>
      <footer className="w-dvw fixed bottom-0 py-2 border-t-[1px] border-t-divider bg-white flex items-center justify-around">
        {links.map((l) => (
          <Link
            key={l.label}
            href={l.path}
            className={"flex flex-col items-center justify-center gap-2 p-2"}
          >
            <img
              src={pathname === l.path ? l.selected : l.icon}
              alt={`${l.label}-icon`}
              width={24}
              height={24}
            />
            <p className="font-bold text-[12px] leading-[16px] text-black">{l.label}</p>
          </Link>
        ))}
      </footer>
      <div className="w-full h-[80px]"></div>
    </>
  );
};

export default Footer;
