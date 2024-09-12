"use client";
import formatNumber from "@/utils/formatNumber";
import formatTime from "@/utils/formatTime";
import timeAgo from "@/utils/timeAgo";
import { useNeynarContext } from "@neynar/react";
import { ChangeEvent, CSSProperties, FC, memo, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Modal from "../modal";
import { AiOutlineClose } from "react-icons/ai";
import axios from "axios";
import StringProcessor from "../stringprocessor";
import EmbedRenderer from "../embedrenderer";
import { useRouter } from "next/navigation";

interface Cast {
  cast: any;
  style?: CSSProperties;
  type?: "default" | "reply";
}
interface Media {
  type: "image" | "video" | "audio";
  url: string;
  file: File;
}

const Cast: FC<Cast> = memo(({ cast, style, type }) => {
  const { user } = useNeynarContext();

  const [castDet, setCastDet] = useState<any>();
  const [openCommentModal, setOpenCommentModal] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [media, setMedia] = useState<Media | null>(null);
  const [audioThumbnailMedia, setAudioThumbnailMedia] = useState<{
    url: string;
    file: File;
  } | null>(null);
  const [musicTitle, setMusicTitle] = useState("");
  const [openCommentMediaModal, setOpenCommentMediaModal] = useState(false);
  const [selectedCommentMediaType, setSelectedCommentMediaType] = useState<
    "video" | "image" | "music"
  >("video");
  const [openMusicUploadModal, setOpenMusicUploadModal] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentAudioTime, setCurrentAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [openCastOptions, setOpenCastOptions] = useState(false);
  const [castOptionType, setCastOptionType] = useState<
    "delete" | "copy-hash" | ""
  >("");
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const router = useRouter();

  const postReaction = useCallback(async (type: "like" | "recast") => {
    const res = await fetch(`/api/post-reaction`, {
      method: "POST",
      body: JSON.stringify({
        reactionType: type,
        uuid: user?.signer_uuid as string,
        hash: castDet.hash as string,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setCastDet({
        ...castDet,
        viewer_context: {
          ...castDet?.viewer_context,
          [type === "like" ? "liked" : "recasted"]:
            !castDet?.viewer_context[type === "like" ? "liked" : "recasted"],
        },
        reactions: {
          ...castDet?.reactions,
          [type === "like" ? "likes_count" : "recasts_count"]:
            castDet?.reactions[
              type === "like" ? "likes_count" : "recasts_count"
            ] + 1,
        },
      });
      }
    },
    [castDet, user?.signer_uuid]
  );

  const deleteReaction = useCallback(
    async (type: "like" | "recast") => {
    const res = await fetch(`/api/delete-reaction`, {
      method: "POST",
      body: JSON.stringify({
        reactionType: type,
        uuid: user?.signer_uuid as string,
        hash: castDet.hash as string,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setCastDet({
        ...cast,
        viewer_context: {
          ...cast.viewer_context,
          [type === "like" ? "liked" : "recasted"]:
            !cast.viewer_context[type === "like" ? "liked" : "recasted"],
        },
        reactions: {
          ...castDet?.reactions,
          [type === "like" ? "likes_count" : "recasts_count"]:
            castDet?.reactions[
              type === "like" ? "likes_count" : "recasts_count"
            ] - 1,
        },
      });
      }
    },
    [castDet, user?.signer_uuid]
  );

  const deleteCast = useCallback(async () => {
    try {
      const res = await fetch(`/api/delete-cast`, {
        method: "POST",
        body: JSON.stringify({
          hash: castDet?.hash,
          uuid: user?.signer_uuid,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDeleteSuccess(true);
        toast.success("Cast Deleted!");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error deleting cast!");
      }
    },
    [castDet, user?.signer_uuid]
  );

  const recastOperation = (type: "post" | "delete") => {
    if (type === "post") postReaction("recast");
    else deleteReaction("recast");
  };

  const likeOperation = (type: "post" | "delete") => {
    if (type === "post") postReaction("like");
    else deleteReaction("like");
  };

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
        setOpenCommentModal(false);
      }
      setMedia({ type, url, file });
      setOpenCommentMediaModal(false);
      }
    },
    []
  );

  const handleAudioThumbnailMedia = useCallback((e: ChangeEvent<HTMLInputElement>) => {
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
      return "";
      }
    },
    []
  );

  const handlePost = useCallback(async () => {
    setIsUploading(true);

    try {
      let fileUrl: string | null = null;
      if (media) fileUrl = await handleUploadToPinata(media.file);
      let thumbnailUrl: string | null = null;
      if (audioThumbnailMedia) {
        thumbnailUrl = await handleUploadToPinata(audioThumbnailMedia.file);
      }

      const response = await axios.post(
        "/api/create",
        {
          uuid: user?.signer_uuid,
          text: media?.type === "audio" ? musicTitle : commentText,
          fileUrl,
          thumbnailUrl,
          parent: castDet.hash,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.success) window.location.reload();
    } catch (error) {
      console.error("Error uploading media", error);
      toast.error("Error uploading media");
    } finally {
      setIsUploading(false);
      setCommentText("");
      setMedia(null);
      }
    },
    [castDet, user?.signer_uuid, media, audioThumbnailMedia, musicTitle]
  );

  const handleTimeUpdate = useCallback(() => {
    const audio = document.getElementById("audio-element") as HTMLAudioElement;
    setCurrentAudioTime(audio.currentTime);
      setAudioDuration(audio.duration);
      },
    []
  );

  const handleSeek = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
    const audio = document.getElementById("audio-element") as HTMLAudioElement;
    audio.currentTime = parseFloat(e.target.value);
    setCurrentAudioTime(audio.currentTime);

    const min = parseFloat(e.target.min);
    const max = parseFloat(e.target.max);
    const value = ((parseFloat(e.target.value) - min) / (max - min)) * 100;
    e.target.style.background = `linear-gradient(to right, white ${value}%, #3D7F41 ${value}%)`;
  }, []);

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

  useEffect(() => {
    setCastDet(cast);
  }, [cast]);

  const audioProgressWidth = useMemo(() => {
    return audioDuration
      ? Math.floor((currentAudioTime / audioDuration) * 100)
      : 0;
  }, [currentAudioTime, audioDuration]);

  return deleteSuccess ? (
    <>
      <div className="w-full px-[16px] py-[20px]" style={{ ...style }}>
        <div className="flex items-center justify-between w-full">
          This cast was deleted!
        </div>
      </div>
    </>
  ) : (
    <>
      <div className="w-full px-[16px] py-[20px]" style={{ ...style }}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center justify-start gap-[10px] mb-[10px]">
            <span
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                router.push(`/profile/${castDet?.author?.fid}`);
              }}
              className="cursor-pointer"
            >
              <img
                className="w-[40px] h-[40px] rounded-[20px] object-cover"
                src={castDet?.author?.pfp_url}
                alt={castDet?.author?.username}
              />
            </span>
            <div className="flex flex-col items-start gap-[2px]">
              <p className="font-bold text-[18px] leading-auto">
                {castDet?.author?.display_name}&nbsp;
              </p>
              <div className="flex items-center justify-start gap-1">
                {type !== "reply" && castDet?.channel ? (
                  <span className="font-normal text-[12px] leading-auto text-gray-text-1">
                    posted in&nbsp;
                    <span
                      className="font-normal text-[12px] leading-auto text-black cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        router.push(`/channel/${castDet?.channel.id}`);
                      }}
                    >
                      /{castDet?.channel.id}
                    </span>
                  </span>
                ) : (
                  <span className="font-normal text-[12px] leading-auto text-gray-text-1">
                    @{castDet?.author?.username}
                  </span>
                )}
                <span className="font-normal text-[12px] leading-auto text-gray-text-1">
                  {timeAgo(castDet?.timestamp)}
                </span>
              </div>
            </div>
          </div>
          {castDet?.author?.fid === user?.fid ? (
            <div className="relative">
              <img
                src="/icons/cast-more-icon.svg"
                alt="cast-more"
                className="w-6 h-6 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setOpenCastOptions(!openCastOptions);
                }}
              />
              <div
                className={`absolute right-0 top-full bg-white transition-all duration-300 ease-in-out rounded-[18px] shadow-comment-upload-media-modal w-[150px] ${
                  openCastOptions
                    ? "opacity-100 visible z-[99]"
                    : "opacity-0 invisible z-[-1]"
                }`}
              >
                <div className="flex flex-col w-full items-center justify-center p-2 rounded-[18px] gap-1">
                  <div
                    className={`cursor-pointer w-full px-2 py-[10px] flex items-center justify-start gap-[2px] rounded-[12px] hover:bg-frame-btn-bg ${
                      castOptionType === "delete"
                        ? "bg-frame-btn-bg ring-inset ring-1 ring-black/10"
                        : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setCastOptionType("delete");
                      deleteCast();
                    }}
                  >
                    <img
                      src="/icons/delete-post-icon.svg"
                      alt="delete"
                      className="w-6 h-6"
                    />
                    <span className="font-medium leading-[22px]">
                      Delete Post
                    </span>
                  </div>
                  <div
                    className={`cursor-pointer w-full px-2 py-[10px] flex items-center justify-start gap-[2px] rounded-[12px] hover:bg-frame-btn-bg ${
                      castOptionType === "copy-hash"
                        ? "bg-frame-btn-bg ring-inset ring-1 ring-black/10"
                        : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setCastOptionType("copy-hash");
                      window.navigator.clipboard.writeText(castDet?.hash);
                      toast.success("Hash copied!");
                    }}
                  >
                    <img
                      src="/icons/copy-hash-icon.svg"
                      alt="delete"
                      className="w-6 h-6"
                    />
                    <span className="font-medium leading-[22px]">
                      Copy Hash
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
        {castDet?.text && castDet?.embedType !== "audio" ? (
          <p className="text-[18px] font-medium text-black w-full mb-[4px] break-words">
            <StringProcessor
              inputString={castDet?.text}
              mentionedProfiles={castDet?.mentioned_profiles}
            />
          </p>
        ) : null}
        <EmbedRenderer
          type={castDet?.embedType}
          url={
            castDet?.embedType === "audio"
              ? castDet?.embeds?.map((e: any) => e.url)
              : castDet?.embeds[0]?.url
          }
          author={castDet?.author?.username}
          audioTitle={castDet?.text}
          index={`${cast.parent_hash || cast.hash}`}
        />
        <div className="w-full flex items-center justify-between mt-[16px]">
          <div className="flex items-center justify-start gap-[14px]">
            <div
              className="flex items-center gap-[2px] cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                likeOperation(
                  castDet?.viewer_context?.liked ? "delete" : "post"
                );
              }}
            >
              <img
                src={
                  castDet?.viewer_context?.liked
                    ? `/icons/like-filled-icon.svg`
                    : `/icons/like-icon.svg`
                }
                alt="like"
                width={24}
                height={24}
              />
              <p className="text-[14px] leading-auto font-normal">
                {formatNumber(castDet?.reactions?.likes_count)}
              </p>
            </div>
            <div
              className="flex items-center gap-[2px] cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpenCommentModal(true);
              }}
            >
              <img
                src="/icons/comment-icon.svg"
                alt="comment"
                width={24}
                height={24}
              />
              <p className="text-[14px] leading-auto font-normal">
                {formatNumber(castDet?.replies?.count)}
              </p>
            </div>
            <div
              className="flex items-center gap-[2px] cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                recastOperation(
                  castDet?.viewer_context?.recasted ? "delete" : "post"
                );
              }}
            >
              <img
                src={
                  castDet?.viewer_context?.recasted
                    ? `/icons/recast-filled-icon.svg`
                    : `/icons/recast-icon.svg`
                }
                alt="recast"
                width={24}
                height={24}
              />
              <p className="text-[14px] leading-auto font-normal">
                {formatNumber(castDet?.reactions?.recasts_count)}
              </p>
            </div>
          </div>
          <button
            className="bg-none border-none m-0 p-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.navigator.clipboard.writeText(
                `https://app.tike.social/cast/${castDet?.hash}`
              );
              toast.success("Link copied!");
            }}
          >
            <img src="/icons/share.svg" alt="share" width={24} height={24} />
          </button>
        </div>
      </div>
      <Modal
        isOpen={openCommentModal}
        closeModal={(e) => {
          setOpenCommentModal(false);
          e?.stopPropagation();
        }}
        style={{ padding: 8, height: "100%", maxHeight: "85vh" }}
      >
        <div className="flex justify-end">
          <button
            className="border-none outline-none rounded-[18px] px-2 py-1 bg-frame-btn-bg"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setOpenCommentModal(false);
            }}
          >
            <img
              src="/icons/close-upload-view-icon.svg"
              alt="close"
              className="w-8 h-8"
            />
          </button>
        </div>
        <div className="pt-[8px] h-full relative">
          <div className="flex flex-col flex-1 h-full">
            <div className="grow mb-2">
              <textarea
                className="w-full px-2 outline-none resize-none placeholder:text-black-40"
                placeholder="Write your reply here..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
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
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setMedia(null);
                        }}
                      >
                        <AiOutlineClose />
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="relative flex items-center justify-between pb-3">
              <img
                src="/icons/comment-upload-media-icon.svg"
                alt="upload"
                className={`w-12 h-[42px] ${
                  media
                    ? "opacity-40 cursor-not-allowed"
                    : "cursor-pointer opacity-100"
                }`}
                onClick={
                  media
                    ? undefined
                    : (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setOpenCommentMediaModal(!openCommentMediaModal);
                      }
                }
              />
              <div
                className={`absolute bottom-full bg-white z-[99] transition-all duration-300 ease-in-out p-2 rounded-[18px] shadow-comment-upload-media-modal w-[150px] ${
                  openCommentMediaModal
                    ? "opacity-100 visible"
                    : "opacity-0 invisible"
                }`}
              >
                <label
                  className="cursor-pointer"
                  htmlFor="video"
                  onClick={() => setSelectedCommentMediaType("video")}
                >
                  <div
                    className={`w-full px-2 py-[10px] flex items-center justify-start gap-[2px] rounded-[12px] hover:bg-frame-btn-bg ${
                      selectedCommentMediaType === "video"
                        ? "bg-frame-btn-bg ring-inset ring-1 ring-black/10"
                        : ""
                    } mb-1`}
                  >
                    <img
                      src="/icons/video-icon.svg"
                      alt="video"
                      className="w-6 h-6"
                    />
                    <p className="leading-[22px] capitalize">Video</p>
                  </div>
                  <input
                    id="video"
                    type="file"
                    accept="video/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      handleMediaChange(e);
                    }}
                  />
                </label>
                <label
                  className="cursor-pointer"
                  htmlFor="music"
                  onClick={() => setSelectedCommentMediaType("music")}
                >
                  <div
                    className={`w-full px-2 py-[10px] flex items-center justify-start gap-[2px] rounded-[12px] hover:bg-frame-btn-bg ${
                      selectedCommentMediaType === "music"
                        ? "bg-frame-btn-bg ring-inset ring-1 ring-black/10"
                        : ""
                    } mb-1`}
                  >
                    <input
                      id="music"
                      type="file"
                      accept="audio/*"
                      multiple
                      className="hidden"
                      onChange={
                        isUploading || media
                          ? undefined
                          : (e) => handleMediaChange(e)
                      }
                    />
                    <img
                      src="/icons/music-icon.svg"
                      alt="music"
                      className="w-6 h-6"
                    />
                    <p className="leading-[22px] capitalize">Music</p>
                  </div>
                </label>
                <label
                  className="cursor-pointer"
                  htmlFor="image"
                  onClick={() => setSelectedCommentMediaType("image")}
                >
                  <div
                    className={`w-full px-2 py-[10px] flex items-center justify-start gap-[2px] rounded-[12px] hover:bg-frame-btn-bg ${
                      selectedCommentMediaType === "image"
                        ? "bg-frame-btn-bg ring-inset ring-1 ring-black/10"
                        : ""
                    } mb-1`}
                  >
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={
                        isUploading || media
                          ? undefined
                          : (e) => handleMediaChange(e)
                      }
                    />
                    <img
                      src="/icons/image-icon.svg"
                      alt="image"
                      className="w-6 h-6"
                    />
                    <p className="leading-[22px] capitalize">Image</p>
                  </div>
                </label>
              </div>
              <button
                className="border-none outline-none rounded-[22px] px-4 py-2 bg-black text-white leading-[120%] font-medium disabled:bg-black-40 disabled:text-black-50"
                disabled={!(media || commentText) || isUploading}
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
        </div>
      </Modal>
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
    </>
  );
});

export default Cast;
