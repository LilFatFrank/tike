"use client";
import { useCallback, useContext, useEffect, useState } from "react";
import ImageCanvas from "./image-canvas";
import { AppContext } from "@/context";
import { SET_PIRATE_MODE } from "@/context/actions";
import VideoCanvas from "./video-canvas";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Modal from "@/components/modal";
import { CastInput } from "@/components";

const PirateMode = () => {
  const [, dispatch] = useContext(AppContext);
  const router = useRouter();
  const [toggleSwitch, setToggleSwitch] = useState("image");
  const [openCastModal, setOpenCastModal] = useState(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    dispatch({
      type: SET_PIRATE_MODE,
      payload: true,
    });
  }, [dispatch]);

  const handleToggleClick = useCallback(() => {
    handleToggleSwitch(
      searchParams?.has("target") && searchParams?.get("target") === "image"
        ? "video"
        : "image"
    );
  }, [searchParams]);

  const handleToggleSwitch = (newValue: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("target", newValue);
    setToggleSwitch(newValue);
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    if (searchParams?.has("target")) {
      handleToggleSwitch(searchParams?.get("target") ?? "image");
    } else {
      handleToggleSwitch("image");
    }
  }, [searchParams]);

  return (
    <>
      {toggleSwitch === "image" ? <ImageCanvas /> : <VideoCanvas />}
      <div className="fixed bottom-0 left-0 z-[1] flex items-center justify-center bg-white/40 backdrop-blur-md w-full">
        <div className="flex items-center justify-center gap-2 overflow-auto">
          <div
            className="py-3 px-2 gap-2 flex flex-col items-center justify-center w-[90px] cursor-pointer"
            onClick={() => {
              router.push("/");
              dispatch({
                type: SET_PIRATE_MODE,
                payload: false,
              });
            }}
          >
            <img src="/icons/back-icon.svg" alt="back" width={24} height={24} />
            <p className="font-bold text-[14px] leading-[18px] text-black">
              Back
            </p>
          </div>
          <div
            className="py-3 px-2 gap-2 flex flex-col items-center justify-center w-[90px] cursor-pointer"
            onClick={() => handleToggleClick()}
          >
            <img
              src="/icons/switch-icon.svg"
              alt="switch"
              width={24}
              height={24}
            />
            <p className="font-bold text-[14px] leading-[18px] text-black">
              Switch
            </p>
          </div>
          <div
            className="py-3 px-2 gap-2 flex flex-col items-center justify-center w-[90px] cursor-pointer"
            onClick={() => setOpenCastModal(true)}
          >
            <img
              src="/icons/create-icon.svg"
              alt="create"
              width={24}
              height={24}
            />
            <p className="font-bold text-[14px] leading-[18px] text-black">
              Create
            </p>
          </div>
          {/* <div className="py-3 px-2 gap-2 flex flex-col items-center justify-center w-[90px] cursor-pointer">
            <img src="/icons/chat-icon.svg" alt="chat" width={24} height={24} />
            <p className="font-bold text-[14px] leading-[18px] text-black">
              Chat
            </p>
          </div> */}
        </div>
      </div>
      <Modal
        isOpen={openCastModal}
        closeModal={() => setOpenCastModal(false)}
        style={{ background: "#F0EEEF", height: "90vh", overflow: "hidden" }}
      >
        <CastInput
          hideClose={true}
          customWrapperStyle={{
            width: "100%",
            height: "100%",
            minHeight: "auto",
          }}
        />
      </Modal>
    </>
  );
};

export default PirateMode;
