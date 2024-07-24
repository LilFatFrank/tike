"use client";
import {
  useState,
  useEffect,
  ChangeEvent,
  FC,
  ClipboardEvent as ReactClipboardEvent,
  useContext,
} from "react";
import { AiOutlineClose } from "react-icons/ai";
import { FiImage, FiVideo } from "react-icons/fi";
import axios from "axios";
import Modal from "../modal";
import { useNeynarContext } from "@neynar/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppContext } from "@/context";

interface Media {
  type: "image" | "video";
  url: string;
  file: File;
}

const CastInput: FC = () => {
  const [state] = useContext(AppContext);
  const [text, setText] = useState("");
  const [media, setMedia] = useState<Media | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [openChannelModal, setOpenChannelModal] = useState(false);
  const [channelSearch, setChannelSearch] = useState("");
  const [debouncedChannelSearch, setDebouncedChannelSearch] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("");
  const [allChannels, setAllChannels] = useState<
    { id: string; image_url: string }[]
  >([]);

  const { user } = useNeynarContext();
  const router = useRouter();

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleMediaChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith("video") ? "video" : "image";
      setMedia({ type, url, file });
    }
  };

  const handlePaste = (e: ReactClipboardEvent) => {
    if (media) return;

    const items = e.clipboardData?.items;
    if (items) {
      const newMedia = Array.from(items)
        .map((item) => {
          if (item.type.startsWith("image") || item.type.startsWith("video")) {
            const file = item.getAsFile();
            if (file) {
              const url = URL.createObjectURL(file);
              const type = item.type.startsWith("video") ? "video" : "image";
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
  };

  const removeMedia = () => {
    setMedia(null);
  };

  const handlePost = async () => {
    setIsUploading(true);

    try {
      if (media) {
        const formData = new FormData();
        formData.append("file", media.file);
        formData.append("text", text);
        formData.append("uuid", user?.signer_uuid as string);
        formData.append("channelId", selectedChannel);

        const response = await axios.post("/api/create", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data.success) router.push("/profile");
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
  };

  const fetchAllChannels = async () => {
    const res = await fetch("/api/search-channels", {
      method: "POST",
      body: JSON.stringify({ q: debouncedChannelSearch }),
    });
    const data = await res.json();
    setAllChannels(data.channels);
  };

  useEffect(() => {
    const handlePasteEvent = (e: ClipboardEvent) =>
      handlePaste(e as unknown as ReactClipboardEvent);
    document.addEventListener("paste", handlePasteEvent);
    return () => {
      document.removeEventListener("paste", handlePasteEvent);
    };
  }, [media]);

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
  }, [debouncedChannelSearch]);

  return (
    <>
      <div className="bg-[#F0EEEF] w-dvw min-h-dvh flex flex-col">
        <div className="grow p-2 bg-white rounded-[20px] shadow-cast-upload">
          <div className="w-full flex items-center justify-between mb-[40px]">
            <button
              className="border-none outline-none rounded-[18px] px-2 py-1 bg-frame-btn-bg"
              onClick={() => router.back()}
            >
              <img
                src="/icons/close-upload-view-icon.svg"
                alt="close"
                className="w-8 h-8"
              />
            </button>
            <button
              className="border-none outline-none rounded-[22px] px-4 py-2 bg-black text-white leading-[120%] font-medium disabled:bg-black-40 disabled:text-black-50"
              disabled={!media || isUploading}
              onClick={handlePost}
            >
              {isUploading ? "Uploading..." : "Post"}
            </button>
          </div>
          <div className={`flex items-center justify-start gap-2 mb-[12px]`}>
            <img
              src={user?.pfp_url}
              alt={user?.display_name}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
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
                <img
                  src="/icons/channel-chevron-down-icon.svg"
                  alt="channel-down"
                  className="w-[14px] h-[14px]"
                />
              </div>
            </div>
          </div>
          <textarea
            className="w-full outline-none resize-none"
            placeholder="What's happening?"
            value={text}
            onChange={handleTextChange}
            rows={3}
          />
          <div className="flex flex-wrap gap-2 mt-1">
            {media ? (
              <div className="flex flex-wrap gap-2 mt-2">
                <div key={media.url} className="relative w-full">
                  {media.type === "image" ? (
                    <img
                      src={media.url}
                      alt="media"
                      className="w-full object-cover rounded-lg"
                    />
                  ) : (
                    <video
                      src={media.url}
                      controls
                      className="w-full object-cover rounded-lg"
                    />
                  )}
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
        <div className="py-1 px-2 flex items-center justify-start gap-1">
          <label
            className={`cursor-pointer ${
              isUploading ? "cursor-not-allowed opacity-[0.4]" : ""
            }`}
          >
            <div className="py-1 px-2 rounded-[18px] bg-[#DDDBDC]">
              <img
                src="/icons/image-upload-icon.svg"
                alt="image"
                className="w-8 h-8"
              />
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={isUploading ? undefined : (e) => handleMediaChange(e)}
              />
            </div>
          </label>
          <label
            className={`cursor-pointer ${
              isUploading ? "cursor-not-allowed opacity-[0.4]" : ""
            }`}
          >
            <div className="py-1 px-2 rounded-[18px] bg-[#DDDBDC]">
              <img
                src="/icons/video-upload-icon.svg"
                alt="video"
                className="w-8 h-8"
              />
              <input
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={isUploading ? undefined : (e) => handleMediaChange(e)}
              />
            </div>
          </label>
        </div>
      </div>
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
            <img
              src="/icons/input-search-icon.svg"
              alt="input-search"
              width={22}
              height={22}
              className="absolute left-[16px]"
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
            <img
              className="w-[24px] h-[24px] rounded-[20px] object-cover"
              src={"/icons/home-icon.svg"}
              alt={"none"}
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
                    <img
                      className="w-[24px] h-[24px] rounded-[20px] object-cover"
                      src={channel.image_url}
                      alt={channel.id}
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
                    <img
                      className="w-[24px] h-[24px] rounded-[20px] object-cover"
                      src={channel.image_url}
                      alt={channel.id}
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
};

export default CastInput;
