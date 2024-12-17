import { FC, memo } from "react";
import Modal from "../modal";
import {
  NeynarAuthButton,
  SIWN_variant,
  useNeynarContext,
} from "@neynar/react";

const AuthButton = memo(() => (
  <NeynarAuthButton
    variant={SIWN_variant.FARCASTER}
    icon={
      <img
        src="/icons/farcaster-sign-in-icon.svg"
        alt="sign-in-farcaster"
        width={24}
        height={24}
        loading="lazy"
        className="w-[24px] h-[24px]"
        style={{ aspectRatio: "1/1" }}
      />
    }
    className="login-btn backdrop-blur-(10px) rounded-[100px] font-grotesk z-20"
  />
));

interface SignInModal {
  open: boolean;
  closeModal: () => void;
}

const SignInModal: FC<SignInModal> = ({ open, closeModal }) => {
  const { user } = useNeynarContext();

  if (user) return null;

  return (
    <>
      <Modal isOpen={open} style={{ padding: "64px 24px 24px" }}>
        <div className="relative">
          <button
            className="absolute border-none outline-none rounded-[18px] px-2 py-1 bg-frame-btn-bg right-0 top-[-40px]"
            onClick={closeModal}
          >
            <img
              src="/icons/close-upload-view-icon.svg"
              alt="close"
              className="w-8 h-8"
              width={32}
              height={32}
              loading="lazy"
              style={{ aspectRatio: "1 / 1" }}
            />
          </button>
          <div className="flex flex-col gap-4 items-center justify-center w-full">
            <p className="text-[#0865FE] text-[40px] font-[800] leading-[48px]">
              You need a Farcaster account to interact
            </p>
            <AuthButton />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SignInModal;
