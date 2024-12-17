"use client";
import {
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import ImageCanvas from "./image-canvas";
import { AppContext } from "@/context";
import { SET_PIRATE_MODE } from "@/context/actions";
import VideoCanvas from "./video-canvas";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Modal from "@/components/modal";
import { CastInput } from "@/components";
import { useNeynarContext } from "@neynar/react";
import SignInModal from "@/components/signinmodal";

interface SearchParamsHandlers {
  handleToggleClick: () => void;
  handleToggleSwitch: (newValue: string) => void;
}

const SearchParamsWrapper = forwardRef<
  SearchParamsHandlers,
  { onToggleSwitch: (newValue: string) => void }
>(({ onToggleSwitch }, ref) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const handleToggleSwitch = useCallback(
    (newValue: string) => {
      const params = new URLSearchParams(window.location.search);
      params.set("target", newValue);
      onToggleSwitch(newValue);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, onToggleSwitch]
  );

  const handleToggleClick = useCallback(() => {
    const currentTarget = searchParams?.get("target") ?? "image";
    handleToggleSwitch(currentTarget === "image" ? "video" : "image");
  }, [searchParams, handleToggleSwitch]);

  useEffect(() => {
    if (searchParams?.has("target")) {
      handleToggleSwitch(searchParams?.get("target") ?? "image");
    } else {
      handleToggleSwitch("image");
    }
  }, [searchParams, handleToggleSwitch]);

  useImperativeHandle(
    ref,
    () => ({
      handleToggleClick,
      handleToggleSwitch,
    }),
    [handleToggleClick, handleToggleSwitch]
  );

  return null; // Return null since we don't need to render anything
});

SearchParamsWrapper.displayName = "SearchParamsWrapper";

const PirateMode = () => {
  const [, dispatch] = useContext(AppContext);
  const router = useRouter();
  const [toggleSwitch, setToggleSwitch] = useState("image");
  const [openCastModal, setOpenCastModal] = useState(false);
  const [openSignInModal, setOpenSignInModal] = useState(false);
  const { user } = useNeynarContext();

  const handlersRef = useRef<SearchParamsHandlers | null>(null);

  useEffect(() => {
    dispatch({
      type: SET_PIRATE_MODE,
      payload: true,
    });
    return () => {
      dispatch({
        type: SET_PIRATE_MODE,
        payload: false,
      });
    };
  }, [dispatch]);

  const handleToggleSwitch = useCallback((newValue: string) => {
    setToggleSwitch(newValue);
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <SearchParamsWrapper
          onToggleSwitch={handleToggleSwitch}
          ref={handlersRef}
        />
      </Suspense>

      {toggleSwitch === "image" ? <ImageCanvas /> : <VideoCanvas />}

      <div className="fixed bottom-0 left-0 z-[1] flex items-center justify-center bg-white/40 backdrop-blur-md w-full">
        <div className="flex items-center justify-center gap-2 overflow-auto">
          <div
            className="py-3 px-2 gap-2 flex flex-col items-center justify-center w-[90px] cursor-pointer"
            onClick={() => router.push("/")}
          >
            <img src="/icons/back-icon.svg" alt="back" width={24} height={24} />
            <p className="font-bold text-[14px] leading-[18px] text-black">
              Back
            </p>
          </div>

          <div
            className="py-3 px-2 gap-2 flex flex-col items-center justify-center w-[90px] cursor-pointer"
            onClick={() => handlersRef.current?.handleToggleClick()}
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
            onClick={
              user
                ? () => setOpenCastModal(true)
                : () => setOpenSignInModal(true)
            }
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

      <SignInModal
        open={openSignInModal}
        closeModal={() => setOpenSignInModal(false)}
      />
    </>
  );
};

export default PirateMode;
