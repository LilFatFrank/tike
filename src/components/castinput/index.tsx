"use client";
import {
  useState,
  useEffect,
  ChangeEvent,
  FC,
  ClipboardEvent as ReactClipboardEvent,
  useContext,
  memo,
  useCallback,
  useMemo,
} from "react";
import { AiOutlineClose } from "react-icons/ai";
import axios from "axios";
import Modal from "../modal";
import { useNeynarContext } from "@neynar/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppContext } from "@/context";
import formatTime from "@/utils/formatTime";
import Image from "next/image";

interface Media {
  type: "image" | "video" | "audio";
  url: string;
  file: File;
}

const CastInput: FC = memo(() => {
  const [state] = useContext(AppContext);
  const [text, setText] = useState("");
  const [media, setMedia] = useState<Media | null>(null);
  const [audioThumbnailMedia, setAudioThumbnailMedia] = useState<{
    url: string;
    file: File;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [openChannelModal, setOpenChannelModal] = useState(false);
  const [channelSearch, setChannelSearch] = useState("");
  const [debouncedChannelSearch, setDebouncedChannelSearch] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("");
  const [allChannels, setAllChannels] = useState<
    { id: string; image_url: string }[]
  >([]);
  const [openMusicUploadModal, setOpenMusicUploadModal] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentAudioTime, setCurrentAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [musicTitle, setMusicTitle] = useState("");

  const { user } = useNeynarContext();
  const router = useRouter();

  const handleTextChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
    },
    []
  );

  const handleMediaChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      let type: "video" | "audio" | "image" = "image";
      if (file.type.startsWith("video")) {
        type = "video";
      } else if (file.type.startsWith("audio")) {
        type = "audio";
        setOpenMusicUploadModal(true);
      }
      setMedia({ type, url, file });
    }
  }, []);

  const handleAudioThumbnailMedia = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        setAudioThumbnailMedia({
          url: URL.createObjectURL(files[0]),
          file: files[0],
        });
      }
    },
    []
  );

  const handlePaste = useCallback(
    (e: ReactClipboardEvent) => {
      if (media) return;

      const items = e.clipboardData?.items;
      if (items) {
        const newMedia = Array.from(items)
          .map((item) => {
            if (
              item.type.startsWith("image") ||
              item.type.startsWith("video")
            ) {
              const file = item.getAsFile();
              if (file) {
                const url = URL.createObjectURL(file);
                let type: "video" | "audio" | "image" = "image";
                if (file.type.startsWith("video")) {
                  type = "video";
                } else if (file.type.startsWith("audio")) {
                  type = "audio";
                }
                return { type, url, file };
              }
            }
            return null;
          })
          .filter(Boolean) as Media[];

        if (newMedia.length > 0) {
          setMedia(newMedia[0]);
        }

        // Check for text content
        const textItem = Array.from(items).find(
          (item) => item.kind === "string" && item.type === "text/plain"
        );
        if (textItem) {
          textItem.getAsString((pastedText) => {
            setText((prevText) => prevText + pastedText);
          });
        }
      }
    },
    [media]
  );

  const removeMedia = useCallback(() => {
    setMedia(null);
  }, []);

  const handleUploadToPinata = useCallback(async (file: File) => {
    try {
      const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pinataOptions", '{"cidVersion": 1}');
      formData.append("pinataMetadata", `{"name": "${file.name}"}`);

      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT_KEY}`,
        },
      });

      return `${process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL}/ipfs/${response.data.IpfsHash}`;
    } catch (error) {
      console.log("Error uploading to pinata", error);
      toast.error("Error uploading media");
      throw error;
    }
  }, []);

  const handlePost = useCallback(async () => {
    setIsUploading(true);

    try {
      if (media) {
        const fileUrl = await handleUploadToPinata(media.file);
        let thumbnailUrl: string | null = null;
        if (audioThumbnailMedia) {
          thumbnailUrl = await handleUploadToPinata(audioThumbnailMedia.file);
        }

        if (fileUrl) {
          const response = await axios.post(
            "/api/create",
            {
              uuid: user?.signer_uuid,
              channelId: selectedChannel,
              text: media.type === "audio" ? musicTitle : text,
              fileUrl,
              thumbnailUrl,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (response.data.success) router.push("/profile");
        } else {
          toast.error("Error uploading media");
        }
      }
    } catch (error) {
      console.error("Error uploading media", error);
      toast.error("Error uploading media");
    } finally {
      setIsUploading(false);
      setText("");
      setMedia(null);
      setSelectedChannel("");
    }
  }, [media, selectedChannel, musicTitle, user?.signer_uuid, router]);

  const fetchAllChannels = useCallback(async () => {
    try {
      const res = await fetch("/api/search-channels", {
        method: "POST",
        body: JSON.stringify({ q: debouncedChannelSearch }),
      });
      const data = await res.json();
      setAllChannels(data.channels);
    } catch (err) {
      console.log(err);
    }
  }, [debouncedChannelSearch]);

  const togglePlayPause = useCallback(() => {
    const audio = document.getElementById("audio-element") as HTMLAudioElement;
    if (audio.paused) {
      audio.play();
      setIsAudioPlaying(true);
    } else {
      audio.pause();
      setIsAudioPlaying(false);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const audio = document.getElementById("audio-element") as HTMLAudioElement;
    setCurrentAudioTime(audio.currentTime);
    setAudioDuration(audio.duration);
  }, []);

  const handleSeek = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const audio = document.getElementById("audio-element") as HTMLAudioElement;
    audio.currentTime = parseFloat(e.target.value);
    setCurrentAudioTime(audio.currentTime);

    const min = parseFloat(e.target.min);
    const max = parseFloat(e.target.max);
    const value = ((parseFloat(e.target.value) - min) / (max - min)) * 100;
    e.target.style.background = `linear-gradient(to right, white ${value}%, #3D7F41 ${value}%)`;
  }, []);

  useEffect(() => {
    const handlePasteEvent = (e: ClipboardEvent) =>
      handlePaste(e as unknown as ReactClipboardEvent);
    document.addEventListener("paste", handlePasteEvent);
    return () => {
      document.removeEventListener("paste", handlePasteEvent);
    };
  }, [handlePaste]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedChannelSearch(channelSearch.trim());
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [channelSearch]);

  useEffect(() => {
    fetchAllChannels();
  }, [fetchAllChannels]);

  const isPostDisabled = useMemo(
    () => !media || isUploading,
    [media, isUploading]
  );

  const audioProgressWidth = useMemo(
    () =>
      audioDuration ? Math.floor((currentAudioTime / audioDuration) * 100) : 0,
    [currentAudioTime, audioDuration]
  );

  return (
    <>
      <div className="bg-[#F0EEEF] w-dvw md:w-auto md:min-h-full min-h-dvh h-auto flex flex-col">
        <div className="grow p-2 bg-white rounded-[20px] shadow-cast-upload">
          <div className="w-full flex items-center justify-between mb-[40px]">
            <button
              className="border-none outline-none rounded-[18px] px-2 py-1 bg-frame-btn-bg"
              onClick={() => router.back()}
            >
              <Image
                src="/icons/close-upload-view-icon.svg"
                alt="close"
                className="w-8 h-8"
                width={32}
                height={32}
                quality={100}
                loading="lazy"
                style={{ aspectRatio: "1 / 1" }}
              />
            </button>
            <button
              className="border-none outline-none rounded-[22px] px-4 py-2 bg-black text-white leading-[120%] font-medium disabled:bg-black-40 disabled:text-black-50"
              disabled={isPostDisabled}
              onClick={handlePost}
            >
              {isUploading ? "Uploading..." : "Post"}
            </button>
          </div>
          <div className={`flex items-center justify-start gap-2 mb-[12px]`}>
            <Image
              src={user?.pfp_url ?? ""}
              alt={user?.display_name ?? ""}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              width={40}
              height={40}
              quality={100}
              loading="lazy"
              style={{ aspectRatio: "1 / 1" }}
            />
            <div>
              <p className="font-[800] text-black text-[18px] leading-[21.6px]">
                {user?.display_name}
              </p>
              <div
                className="flex items-center gap-[2px] cursor-pointer"
                onClick={() => setOpenChannelModal(true)}
              >
                <span className="text-purple font-bold text-[14px] leading-[120%]">
                  {selectedChannel ? `/${selectedChannel}` : "Select Channel"}
                </span>
                <Image
                  src="/icons/channel-chevron-down-icon.svg"
                  alt="channel-down"
                  className="w-[14px] h-[14px]"
                  width={14}
                  height={14}
                  quality={100}
                  loading="lazy"
                  style={{ aspectRatio: "1 / 1" }}
                />
              </div>
            </div>
          </div>
          <textarea
            className="w-full outline-none resize-none placeholder:text-black-40"
            placeholder="What's happening?"
            value={text}
            onChange={handleTextChange}
            rows={3}
          />
          <div className="flex flex-wrap gap-2 mt-1 w-full">
            {media && media.type !== "audio" ? (
              <div className="flex flex-wrap gap-2 mt-2 w-full">
                <div key={media.url} className="relative w-full">
                  {media.type === "image" ? (
                    <img
                      src={media.url}
                      alt="media"
                      className="w-full object-cover rounded-lg"
                      loading="lazy"
                    />
                  ) : media.type === "video" ? (
                    <video
                      src={media.url}
                      controls
                      className="w-full object-cover rounded-lg"
                    />
                  ) : null}
                  <button
                    className="absolute top-1 right-1 bg-black text-white rounded-full p-1"
                    onClick={removeMedia}
                  >
                    <AiOutlineClose />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div className="pt-1 pb-6 px-2 flex items-center justify-start gap-1">
          <label
            className={`cursor-pointer ${
              isUploading || media ? "cursor-not-allowed opacity-[0.4]" : ""
            }`}
          >
            <div className="py-1 px-2 rounded-[18px] bg-[#DDDBDC]">
              <Image
                src="/icons/image-upload-icon.svg"
                alt="image"
                className="w-8 h-8"
                width={32}
                height={32}
                quality={100}
                loading="lazy"
                style={{ aspectRatio: "1 / 1" }}
              />
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={
                  isUploading || media ? undefined : (e) => handleMediaChange(e)
                }
              />
            </div>
          </label>
          <label
            className={`cursor-pointer ${
              isUploading || media ? "cursor-not-allowed opacity-[0.4]" : ""
            }`}
          >
            <div className="py-1 px-2 rounded-[18px] bg-[#DDDBDC]">
              <Image
                src="/icons/video-upload-icon.svg"
                alt="video"
                className="w-8 h-8"
                width={32}
                height={32}
                quality={100}
                loading="lazy"
                style={{ aspectRatio: "1 / 1" }}
              />
              <input
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={
                  isUploading || media ? undefined : (e) => handleMediaChange(e)
                }
              />
            </div>
          </label>
          <label
            className={`cursor-pointer ${
              isUploading || media ? "cursor-not-allowed opacity-[0.4]" : ""
            }`}
          >
            <div className="py-1 px-2 rounded-[18px] bg-[#DDDBDC]">
              <Image
                src="/icons/music-upload-icon.svg"
                alt="music"
                className="w-8 h-8"
                width={32}
                height={32}
                quality={100}
                loading="lazy"
                style={{ aspectRatio: "1 / 1" }}
              />
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={
                  isUploading || media ? undefined : (e) => handleMediaChange(e)
                }
              />
            </div>
          </label>
        </div>
      </div>
      <Modal
        isOpen={openMusicUploadModal}
        closeModal={() => {
          setOpenMusicUploadModal(false);
          setMedia(null);
          setAudioThumbnailMedia(null);
        }}
      >
        <div className="pt-2 px-2 pb-8">
          <p className="text-center text-[18px] leading-[22px] font-semibold mb-2">
            Music Upload
          </p>
          <div className="flex flex-col w-full gap-5">
            {media ? (
              <div className="p-2 rounded-[12px] bg-music-upload-color/60 flex items-center gap-2">
                <label className={`cursor-pointer`}>
                  <div className="rounded-[11px] w-[70px] h-[70px]">
                    <Image
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
                      quality={100}
                      style={{ aspectRatio: "1 / 1" }}
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
                    <Image
                      src={`/icons/music-${
                        isAudioPlaying ? "pause" : "play"
                      }-icon.svg`}
                      alt={isAudioPlaying ? "pause" : "play"}
                      className="w-[18px] h-[18px] cursor-pointer"
                      onClick={togglePlayPause}
                      width={18}
                      height={18}
                      loading="lazy"
                      quality={100}
                      style={{ aspectRatio: "1 / 1" }}
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
              />
            </div>
            <label className="flex flex-col items-start gap-1 w-full">
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
                  <Image
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
                    width={32}
                    height={32}
                    loading="lazy"
                    quality={100}
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
              onClick={handlePost}
            >
              {isUploading ? "Uploading..." : "Post"}
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={openChannelModal}
        closeModal={() => setOpenChannelModal(false)}
        style={{ borderRadius: "20px 20px 0 0", padding: 0, minHeight: "40%" }}
      >
        <div className="flex-1 pt-8 pb-2 px-2">
          <p className="mb-2 text-center text-[18px] font-semibold leading-[22px]">
            Select Channel
          </p>
          <div className="w-full items-center bg-frame-btn-bg relative rounded-[12px] py-2 pl-[42px] pr-4 mb-1">
            <Image
              src="/icons/input-search-icon.svg"
              alt="input-search"
              width={22}
              height={22}
              className="absolute left-[16px]"
              loading="lazy"
              quality={100}
              style={{ aspectRatio: "1 / 1" }}
            />
            <input
              className="p-0 outline-none border-none w-full bg-inherit placeholder:text-black-40"
              placeholder="Search channels"
              value={channelSearch}
              onChange={(e) => setChannelSearch(e.target.value)}
            />
          </div>
          <div
            className={`w-full px-2 py-[10px] flex items-center justify-start gap-2 cursor-pointer mb-1 rounded-[12px] ${
              selectedChannel === ""
                ? "bg-frame-btn-bg ring-inset ring-1 ring-black/10"
                : ""
            } hover:bg-frame-btn-bg`}
            onClick={() => {
              setSelectedChannel("");
              setOpenChannelModal(false);
            }}
          >
            <Image
              src={"/icons/home-icon.svg"}
              className="w-[24px] h-[24px] rounded-[20px] object-cover"
              width={24}
              height={24}
              loading="lazy"
              quality={100}
              alt={"none"}
              style={{ aspectRatio: "1 / 1" }}
            />
            <p className="font-medium leading-[22px]">None</p>
          </div>
          {allChannels && allChannels.length
            ? allChannels?.map((channel, channelIndex, arr) => (
                <>
                  <div
                    className={`w-full px-2 py-[10px] flex items-center justify-start gap-2 cursor-pointer ${
                      channelIndex === arr.length - 1 ? "" : "mb-1"
                    } rounded-[12px] ${
                      selectedChannel === channel.id
                        ? "bg-frame-btn-bg ring-inset ring-1 ring-black/10"
                        : ""
                    } hover:bg-frame-btn-bg`}
                    onClick={() => {
                      setSelectedChannel(channel.id);
                      setOpenChannelModal(false);
                    }}
                  >
                    <Image
                      src={channel.image_url}
                      className="w-[24px] h-[24px] rounded-[20px] object-cover"
                      width={24}
                      height={24}
                      loading="lazy"
                      quality={100}
                      alt={channel.id}
                      style={{ aspectRatio: "1 / 1" }}
                    />
                    <p className="font-medium leading-[22px]">
                      {channel.id}&nbsp;
                    </p>
                  </div>
                </>
              ))
            : state.userChannels.length
            ? state.userChannels.map((channel, channelIndex, arr) => (
                <>
                  <div
                    className={`w-full px-2 py-[10px] flex items-center justify-start gap-2 cursor-pointer ${
                      channelIndex === arr.length - 1 ? "" : "mb-1"
                    } rounded-[12px] ${
                      selectedChannel === channel.id
                        ? "bg-frame-btn-bg ring-inset ring-1 ring-black/10"
                        : ""
                    } hover:bg-frame-btn-bg`}
                    onClick={() => {
                      setSelectedChannel(channel.id);
                      setOpenChannelModal(false);
                    }}
                  >
                    <Image
                      src={channel.image_url}
                      className="w-[24px] h-[24px] rounded-[20px] object-cover"
                      alt={channel.id}
                      width={24}
                      height={24}
                      loading="lazy"
                      quality={100}
                      style={{ aspectRatio: "1 / 1" }}
                    />
                    <p className="font-medium leading-[22px]">
                      {channel.id}&nbsp;
                    </p>
                  </div>
                </>
              ))
            : null}
        </div>
      </Modal>
    </>
  );
});

export default CastInput;
