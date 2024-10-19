"use client";
import { FC } from "react";
import Modal from "../modal";

const MINT_DURATION = [
  {
    label: "1 Hour",
    value: 60 * 60,
  },
  {
    label: "4 Hours",
    value: 4 * 60 * 60,
  },
  {
    label: "24 Hours",
    value: 24 * 60 * 60,
  },
  {
    label: "3 Days",
    value: 3 * 24 * 60 * 60,
  },
  {
    label: "1 Week",
    value: 7 * 24 * 60 * 60,
  },
  {
    label: "1 Month",
    value: 30 * 24 * 60 * 60,
  },
  {
    label: "3 Months",
    value: 90 * 24 * 60 * 60,
  },
  {
    label: "Open",
    value: 0,
  },
];

type MarketCountdown = {
  label: string;
  value: number;
};

interface MarketCountdownModalProps {
  openCountdownModal: boolean;
  setOpenCountdownModal: (val: boolean) => void;
  marketCountdown: MarketCountdown;
  setMarketCountdown: (md: MarketCountdown) => void;
}

const MarketCountdownModal: FC<MarketCountdownModalProps> = ({
  openCountdownModal,
  setOpenCountdownModal,
  marketCountdown,
  setMarketCountdown,
}) => {
  return (
    <>
      <Modal
        isOpen={openCountdownModal}
        closeModal={() => setOpenCountdownModal(false)}
      >
        <div className="flex-1 pt-8 pb-2 px-2">
          <p className="mb-2 text-center text-[18px] font-semibold leading-[22px]">
            Mint Duration
          </p>
          {MINT_DURATION.map((md) => (
            <div
              key={md.label}
              className={`w-full mb-1 px-2 py-[10px] cursor-pointer rounded-[12px] ${
                marketCountdown.value === md.value
                  ? "bg-frame-btn-bg ring-inset ring-1 ring-black/10"
                  : ""
              } hover:bg-frame-btn-bg`}
            >
              <p
                className="font-medium leading-[22px]"
                onClick={() => {
                  setMarketCountdown(md);
                  setOpenCountdownModal(false);
                }}
              >
                {md.label}
              </p>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default MarketCountdownModal;
