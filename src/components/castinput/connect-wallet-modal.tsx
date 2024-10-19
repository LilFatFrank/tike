"use client";
import { FC, useCallback, useState } from "react";
import Modal from "../modal";
import { useConnect } from "wagmi";
import { coinbaseWallet } from "wagmi/connectors";
import { toast } from "sonner";

interface ConnectWalletProps {
  openConnectModal: boolean;
  setOpenConnectModal: (val: boolean) => void;
}

const ConnectWalletModal: FC<ConnectWalletProps> = ({
  openConnectModal,
  setOpenConnectModal,
}) => {
  const { connectAsync } = useConnect();
  const [connectingWallet, setConnectingWallet] = useState(false);

  const handleConnectWallet = useCallback(() => {
    setConnectingWallet(true);
    connectAsync({
      connector: coinbaseWallet({
        appName: "tike-social",
        preference: "all",
        version: "4",
        appLogoUrl: "https://app.tike.social/icons/desktop-logo.svg",
      }),
    })
      .then(() => {
        toast.success("Wallet connected successfully!");
        setOpenConnectModal(false);
      })
      .catch((error) => {
        console.log(error);
        toast.error("Error connecting Wallet");
      })
      .finally(() => {
        setConnectingWallet(false);
      });
  }, [openConnectModal, connectingWallet]);

  return (
    <>
      <Modal
        isOpen={openConnectModal}
        closeModal={() => setOpenConnectModal(false)}
      >
        <div className="pt-2 px-2 pb-8">
          <p className="text-center text-[18px] leading-[22px] font-semibold mb-12">
            Connect wallet to mint
          </p>
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex items-center -space-x-3">
              <img
                src="/icons/tike-logo-icon.svg"
                alt="logo"
                className="w-14 h-14 rounded-full"
              />
              <img
                src="/icons/smart-wallet-logo-icon.svg"
                alt="smart-wallet"
                className="w-14 h-14 rounded-full"
              />
            </div>
            <div className="text-center">
              <p className="text-[20px] font-medium leading-[28px]">
                {connectingWallet ? "Connecting" : "Connect"} to Tike
              </p>
              <p className="text-[#5B616E] text-[16px] font-normal">
                Tike.social
              </p>
            </div>
          </div>
          {connectingWallet ? null : (
            <div className="pt-4 pb-4 px-6 flex items-center justify-center gap-3">
              <button
                className="w-full rounded-[100px] bg-frame-btn-bg text-[#0A0B0D] font-normal leading-[24px] py-4 px-8"
                onClick={() => setOpenConnectModal(false)}
              >
                Cancel
              </button>
              <button
                className="w-full rounded-[100px] bg-[#0052FF] text-[#FFFFFF] font-normal leading-[24px] py-4 px-8"
                onClick={handleConnectWallet}
              >
                Connect
              </button>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default ConnectWalletModal;
