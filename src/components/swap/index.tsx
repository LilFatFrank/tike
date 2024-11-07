"use client";
import { Widget } from "./widget";
import { useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { Sidebar } from "@/components";
import generateColorFromAddress from "@/utils/avatar";
import { toast } from "sonner";

export default function Swap() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    <>
      <div className="flex-1 bg-white min-h-full p-5">
        <div className="w-full flex items-center justify-end">
          {address ? (
            <div
              className="flex items-center justify-center gap-2 px-2 py-1 hover:bg-purple/20 rounded-[12px] cursor-pointer"
              onClick={() => {
                setOpenSidebar(true);
              }}
            >
              <img
                src={"/icons/desktop-logo.svg"}
                alt="tike"
                width={24}
                height={24}
                className="cursor-pointer"
                loading="lazy"
                style={{ aspectRatio: "1/1" }}
              />
              <p className="text-[16px] leading-auto font-bold text-purple">
                {address.slice(0, 4)}...{address.slice(-4)}
              </p>
            </div>
          ) : null}
        </div>
        <Widget />
      </div>
      <Sidebar
        isOpen={openSidebar}
        className="md:top-[50px] rounded-[12px]"
        openFromRight
      >
        <div className="flex flex-col items-end w-fit h-full">
          <div className="py-3 px-4 flex fl items-center justify-between">
            <span
              className="py-[6px] px-2 rounded-[20px] bg-black border-none text-white font-medium leading-[120%] flex items-center cursor-pointer"
              onClick={() => setOpenSidebar(false)}
            >
              <img
                src="/icons/close-sidebar-icon.svg"
                alt="close"
                width={16}
                height={16}
                loading="lazy"
                style={{ aspectRatio: "1 / 1" }}
              />
              Close
            </span>
          </div>
          <div className="py-[10px] px-4">
            <p className="text-black/50 text-[14px] font-medium leading-[22px] text-end pb-2">
              Wallet
            </p>
            <div className="flex items-center gap-2 my-1">
              <div
                className="px-2 py-1 flex items-center justify-center gap-2 bg-purple/20 rounded-[12px] cursor-pointer"
                onClick={() => {
                  setOpenSidebar(true);
                }}
              >
                <div
                  className="w-8 h-8 rounded-full"
                  style={{
                    backgroundColor: generateColorFromAddress(address ?? ""),
                  }}
                />
                <span className="text-purple font-bold text-[16px] leading-auto">
                  {address?.slice(0, 4)}...{address?.slice(-4)}
                </span>
              </div>
              <img
                src="/icons/copy-hash-icon.svg"
                alt="copy"
                width={24}
                height={24}
                loading="lazy"
                className="cursor-pointer"
                onClick={() => {
                  navigator.clipboard.writeText(address ?? "");
                  toast.success("Address copied to clipboard");
                }}
              />
            </div>
            <div
              className="my-1 bg-bad/20 rounded-[12px] py-[8px] px-[16px] flex items-center gap-2 cursor-pointer"
              onClick={() => {
                disconnect();
                setOpenSidebar(false);
              }}
            >
              <img
                src="/icons/disconnect-icon.svg"
                alt="disconnect"
                width={22}
                height={22}
                loading="lazy"
              />
              <p className="text-bad">Disconnect</p>
            </div>
          </div>
        </div>
      </Sidebar>
    </>
  );
}
