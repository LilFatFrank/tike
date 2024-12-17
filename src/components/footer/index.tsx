"use client";
import { AppContext } from "@/context";
import { useNeynarContext } from "@neynar/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FC, useContext, useState } from "react";
import SignInModal from "@/components/signinmodal";
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
    icon: "/icons/hub-icon.svg",
    selected: "/icons/hub-filled-icon.svg",
    label: "Hub",
    path: "/hub",
  },
  {
    icon: "/icons/profile-icon.svg",
    selected: "/icons/profile-filled-icon.svg",
    label: "Profile",
    path: "/profile",
  },
];

const Footer: FC = () => {
  const [state] = useContext(AppContext);
  const pathname = usePathname();

  const [openSignInModal, setOpenSignInModal] = useState(false);

  const { user } = useNeynarContext();

  if (state.pirateMode) return null;

  if (pathname === "/create" || state.pageNotFound) return null;

  return (
    <>
      <footer className="w-dvw md:w-[550px] fixed bottom-0 py-2 border-t-[1px] border-t-divider bg-white/80 flex items-center backdrop-blur-lg">
        {links.map((l) =>
          (l.label === "Profile" || l.label === "Create") && !user ? (
            <>
              <span
                key={l.label}
                className="grow flex-shrink-0 basis-1/5 flex flex-col items-center justify-center gap-2 p-2 cursor-pointer"
                onClick={() => setOpenSignInModal(true)}
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <img
                    src={pathname === l.path ? l.selected : l.icon}
                    alt={`${l.label}-icon`}
                    width={20}
                    height={20}
                    loading="lazy"
                    style={{ aspectRatio: "1/1" }}
                  />
                </div>
                <p className="font-bold text-[12px] leading-[16px] text-black">
                  {l.label}
                </p>
              </span>
            </>
          ) : (
            <Link
              key={l.label}
              href={l.path}
              className={
                "grow flex-shrink-0 basis-1/5 flex flex-col items-center justify-center gap-2 p-2"
              }
            >
              {l.path === "/hub" ? (
                <>
                  <div className="w-6 h-6 flex items-center justify-center">
                    <img
                      src={pathname === l.path ? l.selected : l.icon}
                      alt={`${l.label}-icon`}
                      width={20}
                      height={20}
                      loading="lazy"
                      style={{ aspectRatio: "1/1" }}
                    />
                  </div>
                  <p className="font-bold text-[12px] leading-[16px] text-black">
                    {l.label}
                  </p>
                </>
              ) : (
                <>
                  <img
                    src={pathname === l.path ? l.selected : l.icon}
                    alt={`${l.label}-icon`}
                    width={24}
                    height={24}
                    loading="lazy"
                    style={{ aspectRatio: "1/1" }}
                  />
                  <p className="font-bold text-[12px] leading-[16px] text-black">
                    {l.label}
                  </p>
                </>
              )}
            </Link>
          )
        )}
      </footer>
      <div className="w-full h-[80px]"></div>
      <SignInModal
        open={openSignInModal}
        closeModal={() => setOpenSignInModal(false)}
      />
    </>
  );
};

export default Footer;
