"use client";
import Modal from "../modal";
import { FC, memo } from "react";
import { useNeynarContext } from "@neynar/react";
import formatTime from "@/utils/formatTime";

interface MusicUploadModalProps {
  openMusicUploadModal: boolean;
  setOpenMusicUploadModal: (open: boolean) => void;
  media: any;
  setMedia: (media: any) => void;
  audioThumbnailMedia: any;
  setAudioThumbnailMedia: (media: any) => void;
  musicTitle: string;
  setMusicTitle: (title: string) => void;
  isUploading: boolean;
  handlePost: () => void;
  handleAudioThumbnailMedia: (e: any) => void;
  handleTimeUpdate: (e: any) => void;
  handleSeek: (e: any) => void;
  audioDuration: number;
  currentAudioTime: number;
  audioProgressWidth: number;
  isAudioPlaying: boolean;
  togglePlayPause: () => void;
}

const MusicUploadModal: FC<MusicUploadModalProps> = memo(
  ({
    openMusicUploadModal,
    setOpenMusicUploadModal,
    media,
    setMedia,
    audioThumbnailMedia,
    setAudioThumbnailMedia,
    musicTitle,
    setMusicTitle,
    isUploading,
    handlePost,
    handleAudioThumbnailMedia,
    handleTimeUpdate,
    handleSeek,
    audioDuration,
    currentAudioTime,
    audioProgressWidth,
    isAudioPlaying,
    togglePlayPause,
  }) => {
    const { user } = useNeynarContext();
    return (
      <Modal
        isOpen={openMusicUploadModal}
        closeModal={(e) => {
          setOpenMusicUploadModal(false);
          setMedia(null);
          setAudioThumbnailMedia(null);
          e?.stopPropagation();
        }}
      >
        <div className="flex justify-end">
          <button
            className="border-none outline-none rounded-[18px] px-2 py-1 bg-frame-btn-bg"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setOpenMusicUploadModal(false);
            }}
          >
            <img
              src="/icons/close-upload-view-icon.svg"
              alt="close"
              className="w-8 h-8"
              width={32}
              height={32}
              loading="lazy"
              style={{ aspectRatio: "1/1" }}
            />
          </button>
        </div>
        <div
          className="pt-2 px-2 pb-8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-center text-[18px] leading-[22px] font-semibold mb-2">
            Music Upload
          </p>
          <div className="flex flex-col w-full gap-5">
            {media ? (
              <div className="p-2 rounded-[12px] bg-music-upload-color/60 flex items-center gap-2">
                <label className={`cursor-pointer`}>
                  <div
                    className="rounded-[11px] w-[70px] h-[70px]"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <img
                      src={
                        audioThumbnailMedia
                          ? audioThumbnailMedia.url
                          : "/icons/thumbnail-upload-icon.svg"
                      }
                      alt="image"
                      className="flex-shrink-0 rounded-[11px] object-cover w-[70px] h-[70px]"
                      width={70}
                      height={70}
                      loading="lazy"
                      style={{ aspectRatio: "1/1" }}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleAudioThumbnailMedia}
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
                  <div
                    className="flex items-center gap-2 w-full"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
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
                      style={{ aspectRatio: "1/1" }}
                    />
                  </div>
                </div>
              </div>
            ) : null}
            <div className="flex flex-col items-start gap-1 w-full">
              <label
                className="text-[18px] leading-[22px] font-semibold"
                htmlFor="songname"
              >
                Title
              </label>
              <input
                id="songname"
                name="songname"
                type="text"
                placeholder="Heartless"
                className="w-full border outline-none py-[10px] px-4 rounded-[12px] border-black/10 placeholder:text-black-20 text-black"
                value={musicTitle}
                onChange={(e) => setMusicTitle(e.target.value)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              />
            </div>
            <label
              className="flex flex-col items-start gap-1 w-full"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <label
                className="text-[18px] leading-[22px] font-semibold"
                htmlFor="artist"
              >
                Cover Image
              </label>
              <div className="p-[6px] rounded-[12px] border border-black/10 flex w-full gap-1 items-center justify-start cursor-pointer">
                <div
                  className={`rounded-[12px] border border-black/10 ${
                    audioThumbnailMedia ? "w-14 h-14" : "p-3"
                  } bg-frame-btn-bg`}
                >
                  <img
                    src={
                      audioThumbnailMedia
                        ? audioThumbnailMedia.url
                        : "/icons/upload-music-thumbnail-icon.svg"
                    }
                    alt="thumbnail"
                    className={
                      audioThumbnailMedia
                        ? "w-full h-full object-cover rounded-[12px]"
                        : "w-8 h-8"
                    }
                    loading="lazy"
                  />
                </div>
                <div className="grow">
                  <p className="leading-[22px] mv-1">Select File</p>
                  <span className="text-[14px] text-black-50 leading-[22px]">
                    PNG,JPG and GIF supported. Max size 5MB.
                  </span>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleAudioThumbnailMedia}
              />
            </label>
            <button
              className="w-full border-none outline-none rounded-[12px] px-4 py-2 bg-black text-white leading-[120%] font-medium disabled:bg-black-40 disabled:text-black-50"
              disabled={
                !audioThumbnailMedia || !media || isUploading || !musicTitle
              }
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePost();
              }}
            >
              {isUploading ? "Uploading..." : "Post"}
            </button>
          </div>
        </div>
      </Modal>
    );
  }
);

export default MusicUploadModal;
