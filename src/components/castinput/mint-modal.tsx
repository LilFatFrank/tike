"use client";
import formatTime from "@/utils/formatTime";
import { useNeynarContext } from "@neynar/react";
import { ChangeEvent, FC, useMemo } from "react";
import Modal from "../modal";

interface Media {
  type: "image" | "video" | "audio";
  url: string;
  file: File;
}

interface MintModalProps {
  openMintModal: boolean;
  setOpenMintModal: (val: boolean) => void;
  isUploading: boolean;
  mintTitle: string;
  mintDescription: string;
  mintThumbnail: {
    url: string;
    file: File;
  } | null;
  setMintEnabled: (val: boolean) => void;
  media: Media | null;
  handleMintThumbnail: (e: ChangeEvent<HTMLInputElement>) => void;
  musicTitle: string;
  currentAudioTime: number;
  handleTimeUpdate: () => void;
  audioDuration: number;
  handleSeek: (e: ChangeEvent<HTMLInputElement>) => void;
  isAudioPlaying: boolean;
  togglePlayPause: () => void;
  setMintTitle: (val: string) => void;
  setMintDescription: (val: string) => void;
  mintPrice: string;
  setMintPrice: (val: string) => void;
  setOpenCountdownModal: (val: boolean) => void;
  marketCountdown: {
    label: string;
    value: number;
  };
}

const MintModal: FC<MintModalProps> = ({
  openMintModal,
  setOpenMintModal,
  isUploading,
  mintTitle,
  mintDescription,
  mintThumbnail,
  setMintEnabled,
  media,
  handleMintThumbnail,
  musicTitle,
  currentAudioTime,
  handleTimeUpdate,
  audioDuration,
  handleSeek,
  isAudioPlaying,
  togglePlayPause,
  setMintTitle,
  setMintDescription,
  mintPrice,
  setMintPrice,
  setOpenCountdownModal,
  marketCountdown,
}) => {
  const { user } = useNeynarContext();

  const audioProgressWidth = useMemo(
    () =>
      audioDuration ? Math.floor((currentAudioTime / audioDuration) * 100) : 0,
    [currentAudioTime, audioDuration]
  );

  return (
    <>
      <Modal
        isOpen={openMintModal}
        closeModal={isUploading ? undefined : () => setOpenMintModal(false)}
      >
        <div className="flex items-center justify-end my-2">
          <button
            className="border-none outline-none rounded-[22px] px-4 py-2 bg-black text-white leading-[120%] font-medium disabled:bg-black-40 disabled:text-black-50"
            disabled={!mintTitle || !mintDescription || !mintThumbnail}
            onClick={() => {
              setMintEnabled(true);
              setOpenMintModal(false);
            }}
          >
            Done
          </button>
        </div>
        <div className="flex flex-col items-center justify-center gap-5 p-2">
          {media && media.type === "audio" ? (
            <div className="p-2 rounded-[12px] bg-music-upload-color/60 flex items-center gap-2 w-full">
              <label className={`cursor-pointer`}>
                <div className="rounded-[11px] w-[70px] h-[70px]">
                  <img
                    src={
                      mintThumbnail
                        ? mintThumbnail.url
                        : "/icons/thumbnail-upload-icon.svg"
                    }
                    alt="image"
                    className="flex-shrink-0 rounded-[11px] object-cover w-[70px] h-[70px]"
                    width={70}
                    height={70}
                    loading="lazy"
                    style={{ aspectRatio: "1 / 1" }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleMintThumbnail}
                  />
                </div>
              </label>
              <div className="grow flex flex-col items-start justify-between">
                <div className="mb-1">
                  <p className="text-[12px] leading-[120%] tracking-[0.3px] font-semibold text-white">
                    {musicTitle || "Song Name"}
                  </p>
                  <p className="text-[10px] leading-[120%] tracking-[0.3px] font-semibold text-white/60">
                    @{user?.username}
                  </p>
                  <div
                    className={`py-[2px] px-1 rounded-[2px] bg-white/20 ${
                      currentAudioTime ? "visible" : "invisible"
                    } w-fit`}
                  >
                    <p className="text-[10px] leading-[120%] tracking-[0.3px] font-semibold text-white">
                      {formatTime(currentAudioTime)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full">
                  <audio
                    id="audio-element"
                    src={media.url}
                    className="hidden"
                    onTimeUpdate={handleTimeUpdate}
                  />
                  <input
                    type="range"
                    min="0"
                    max={audioDuration}
                    value={currentAudioTime}
                    onChange={handleSeek}
                    className="hidden"
                  />
                  <div className="bg-music-progress-bg w-full h-[4px] rounded-[2px]">
                    <div
                      className={`bg-white rounded-[2px] h-[4px]`}
                      style={{
                        width: `${audioProgressWidth}%`,
                      }}
                    />
                  </div>
                  <img
                    src={`/icons/music-${
                      isAudioPlaying ? "pause" : "play"
                    }-icon.svg`}
                    alt={isAudioPlaying ? "pause" : "play"}
                    className="w-[18px] h-[18px] cursor-pointer"
                    onClick={togglePlayPause}
                    width={18}
                    height={18}
                    loading="lazy"
                    style={{ aspectRatio: "1 / 1" }}
                  />
                </div>
              </div>
            </div>
          ) : null}
          <label className="flex flex-col items-start gap-1 w-full">
            <label
              className="text-[18px] leading-[22px] font-semibold"
              htmlFor="thumbnail"
            >
              Mint thumbnail*
            </label>
            <div className="p-[6px] rounded-[12px] border border-black/10 flex w-full gap-1 items-center justify-start cursor-pointer">
              <div
                className={`rounded-[12px] border border-black/10 ${
                  mintThumbnail ? "w-14 h-14" : "p-3"
                } bg-frame-btn-bg`}
              >
                <img
                  src={
                    mintThumbnail
                      ? mintThumbnail.url
                      : "/icons/upload-music-thumbnail-icon.svg"
                  }
                  alt="thumbnail"
                  className={
                    mintThumbnail
                      ? "w-full h-full object-cover rounded-[12px]"
                      : "w-8 h-8"
                  }
                  width={32}
                  height={32}
                  loading="lazy"
                />
              </div>
              <div className="grow">
                <p className="leading-[22px] mv-1">Select File</p>
                <span className="text-[14px] text-black-50 leading-[22px]">
                  PNG,JPG supported. Max size 5MB.
                </span>
              </div>
            </div>
            <input
              type="file"
              accept="image/png, image/jpeg"
              multiple
              className="hidden"
              onChange={handleMintThumbnail}
            />
          </label>
          <div className="flex flex-col items-start gap-1 w-full">
            <label
              className="text-[18px] leading-[22px] font-semibold"
              htmlFor="minttitle"
            >
              Title*
            </label>
            <input
              id="minttitle"
              name="minttitle"
              type="text"
              placeholder="Rare Digital Artwork"
              className="w-full border outline-none py-[10px] px-4 rounded-[12px] border-black/10 placeholder:text-black-20 text-black"
              value={mintTitle}
              onChange={(e) => setMintTitle(e.target.value)}
            />
          </div>
          <div className="flex flex-col items-start gap-1 w-full">
            <label
              className="text-[18px] leading-[22px] font-semibold"
              htmlFor="mintdescription"
            >
              Description*
            </label>
            <textarea
              id="mintdescription"
              name="mintdescription"
              rows={3}
              placeholder="A unique piece of digital art created exclusively for this collection."
              className="w-full border outline-none py-[10px] px-4 rounded-[12px] border-black/10 placeholder:text-black-20 text-black"
              value={mintDescription}
              onChange={(e) => setMintDescription(e.target.value)}
            />
          </div>
          <div className="flex flex-col items-start gap-1 w-full">
            <span className="flex flex-col items-start">
              <label
                className="text-[18px] leading-[22px] font-semibold"
                htmlFor="minttitle"
              >
                Mint Price
              </label>
              <span className="text-[10px] font-medium leading-[auto] text-black-60">
                Set your price to 0 to earn Creator Rewards.
              </span>
            </span>
            <div className="flex items-center gap-2 w-full">
              <input
                id="mintprice"
                name="mintprice"
                type="number"
                placeholder="0"
                className="w-full border outline-none py-[10px] px-4 rounded-[12px] border-black/10 placeholder:text-black-20 text-black remove-arrow"
                value={mintPrice}
                onChange={(e) => setMintPrice(e.target.value)}
              />
              <div className="flex items-center gap-1 flex-shrink-0">
                <img
                  src="/icons/eth-icon.svg"
                  alt="eth"
                  width={24}
                  height={24}
                  loading="lazy"
                  style={{ aspectRatio: "1 / 1" }}
                />
                <p className="text-[18px] text-black-80 leading-[120%] font-semibold">
                  ETH
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start gap-1 w-full">
            <label
              className="text-[18px] leading-[22px] font-semibold"
              htmlFor="minttitle"
            >
              Mint Duration
            </label>
            <div
              className="flex items-center cursor-pointer justify-between py-[10px] px-4 border outline-none border-black/10 rounded-[12px] w-full"
              onClick={() => setOpenCountdownModal(true)}
            >
              <p className="font-medium leading-[18px]">
                {marketCountdown.label}
              </p>
              <img
                src="/icons/chevron-down-icon.svg"
                alt="chevron-down"
                className="w-4 h-4"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default MintModal;
