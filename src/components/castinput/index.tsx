"use client";
import {
  useState,
  useEffect,
  ChangeEvent,
  FC,
  ClipboardEvent as ReactClipboardEvent,
} from "react";
import { AiOutlineClose } from "react-icons/ai";
import { FiImage, FiVideo } from "react-icons/fi";
import axios from "axios";
import Modal from "../modal";
import { useNeynarContext } from "@neynar/react";
import { useRouter } from "next/navigation";

interface Media {
  type: "image" | "video";
  url: string;
  file: File;
}

const CastInput: FC = () => {
  const [text, setText] = useState("");
  const [media, setMedia] = useState<Media | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
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
        formData.append("fileName", media.file.name);
        formData.append("text", text);
        formData.append("uuid", user?.signer_uuid as string);
        formData.append("fid", ((user?.fid as number) || 0).toString());
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
      setUploadError("Error uploading media");
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
      <div className="p-4">
        <div className="w-full flex justify-end mb-[12px]">
          <button
            className="border-none outline-none rounded-[22px] px-4 py-2 bg-black text-white leading-[120%] font-medium disabled:bg-black-40 disabled:text-black-50"
            disabled={!media || isUploading}
            onClick={handlePost}
          >
            Post
          </button>
        </div>
        <textarea
          className="w-full outline-none resize-none"
          placeholder="What's happening?"
          value={text}
          onChange={handleTextChange}
          rows={4}
        />
        <div className="flex items-center gap-2 mt-2">
          <label
            className={`cursor-pointer ${
              isUploading ? "cursor-not-allowed opacity-[0.4]" : ""
            }`}
          >
            <FiImage className="text-xl" />
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={isUploading ? undefined : (e) => handleMediaChange(e)}
            />
          </label>
          <label
            className={`cursor-pointer ${
              isUploading ? "cursor-not-allowed opacity-[0.4]" : ""
            }`}
          >
            <FiVideo className="text-xl" />
            <input
              type="file"
              accept="video/*"
              multiple
              className="hidden"
              onChange={isUploading ? undefined : (e) => handleMediaChange(e)}
            />
          </label>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span
            className="text-purple font-bold text-[14px] leading-[120%] cursor-pointer"
            onClick={() => setOpenChannelModal(true)}
          >
            {selectedChannel ? `/${selectedChannel}` : "Select Channel"}
          </span>
          {selectedChannel ? (
            <button
              className="text-black-50 outline-none border-none rounded-lg"
              onClick={() => {
                setSelectedChannel("");
                setChannelSearch("");
              }}
            >
              x
            </button>
          ) : null}
        </div>
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
      <Modal
        isOpen={openChannelModal}
        closeModal={() => setOpenChannelModal(false)}
        style={{ height: "100%" }}
      >
        <div className="flex-1 p-4">
          <div className="w-full items-center bg-frame-btn-bg relative rounded-[12px] py-2 pl-[42px] pr-4 mb-4">
            <img
              src="/icons/input-search-icon.svg"
              alt="input-search"
              width={22}
              height={22}
              className="absolute left-[16px]"
            />
            <input
              className="p-0 outline-none border-none w-full bg-inherit placeholder:text-black-40"
              placeholder="Search users, channels"
              value={debouncedChannelSearch}
              onChange={(e) => setChannelSearch(e.target.value)}
            />
          </div>
          {allChannels?.map((channel, channelIndex, arr) => (
            <>
              <div
                className="w-full px-[16px] py-[20px] flex items-center justify-start gap-[10px] cursor-pointer"
                onClick={() => {
                  setSelectedChannel(channel.id);
                  setOpenChannelModal(false);
                }}
              >
                <img
                  className="w-[40px] h-[40px] rounded-[20px] object-cover"
                  src={channel.image_url}
                  alt={channel.id}
                />
                <div className="flex flex-col items-start gap-[2px]">
                  <p className="font-bold text-[18px] leading-auto">
                    {channel.id}&nbsp;
                  </p>
                  <p className="font-normal text-[12px] leading-auto text-gray-text-1">
                    /{channel.id}
                  </p>
                </div>
              </div>
              {channelIndex === arr.length - 1 ? null : (
                <hr className="border border-t-divider" />
              )}
            </>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default CastInput;
