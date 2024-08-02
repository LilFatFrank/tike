"use client";
import formatNumber from "@/utils/formatNumber";
import formatTime from "@/utils/formatTime";
import timeAgo from "@/utils/timeAgo";
import { useNeynarContext } from "@neynar/react";
import Link from "next/link";
import { ChangeEvent, CSSProperties, FC, useEffect, useState } from "react";
import { toast } from "sonner";
import Modal from "../modal";
import { AiOutlineClose } from "react-icons/ai";
import axios from "axios";

function ImageEmbed({ url }: { url: string }) {
  return (
    <img
      src={url}
      alt="Cast image"
      className="w-full object-contain rounded-[10px]"
    />
  );
}

function VideoEmbed({ url }: { url: string }) {
  return (
    <video
      controls
      autoPlay
      muted
      className="w-full object-contain rounded-[10px]"
    >
      <source src={url} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}

function AudioEmbed({ url, title }: { url: string[]; title: string }) {
  const { user } = useNeynarContext();
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentAudioTime, setCurrentAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const handleTimeUpdate = () => {
    const audio = document.getElementById("audio-element") as HTMLAudioElement;
    setCurrentAudioTime(audio.currentTime);
    setAudioDuration(audio.duration);
  };

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const audio = document.getElementById("audio-element") as HTMLAudioElement;
    audio.currentTime = parseFloat(e.target.value);
    setCurrentAudioTime(audio.currentTime);

    const min = parseFloat(e.target.min);
    const max = parseFloat(e.target.max);
    const value = ((parseFloat(e.target.value) - min) / (max - min)) * 100;
    e.target.style.background = `linear-gradient(to right, white ${value}%, #3D7F41 ${value}%)`;
  };

  const togglePlayPause = () => {
    const audio = document.getElementById("audio-element") as HTMLAudioElement;
    if (audio.paused) {
      audio.play();
      setIsAudioPlaying(true);
    } else {
      audio.pause();
      setIsAudioPlaying(false);
    }
  };

  return (
    <div className="p-2 rounded-[12px] bg-music-upload-color/60 flex flex-col items-center gap-4">
      <div className="rounded-[22px]">
        <img
          src={url[1]}
          alt="image"
          className="flex-shrink-0 rounded-[11px] object-cover"
        />
      </div>
      <div className="w-full flex flex-col items-start justify-between">
        <div className="mb-2 flex flex-col gap-1">
          <p className="text-[12px] leading-[120%] tracking-[0.3px] font-semibold text-white">
            {title}
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
        <div className="flex flex-row-reverse items-center gap-2 w-full">
          <audio
            id="audio-element"
            src={url[0]}
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
                width: `${
                  audioDuration
                    ? Math.floor((currentAudioTime / audioDuration) * 100)
                    : 0
                }%`,
              }}
            />
          </div>
          <img
            src={`/icons/music-${isAudioPlaying ? "pause" : "play"}-icon.svg`}
            alt={isAudioPlaying ? "pause" : "play"}
            className="w-[18px] h-[18px] cursor-pointer"
            onClick={togglePlayPause}
          />
        </div>
      </div>
    </div>
  );
}

function getYouTubeVideoId(url: string): string | null {
  const regex =
    /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function YouTubeEmbed({ url }: { url: string }) {
  const videoId = getYouTubeVideoId(url);
  return (
    <iframe
      width="100%"
      src={`https://www.youtube.com/embed/${videoId}`}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="w-full max-h-[100dvw] min-h-[300px] object-contain rounded-[10px]"
    ></iframe>
  );
}

function EmbedRenderer({
  type,
  url,
  audioTitle,
}: {
  type: string;
  url: string[] | string;
  audioTitle?: string;
}) {
  switch (type) {
    case "image":
      return <ImageEmbed url={url as string} />;
    case "video":
      return <VideoEmbed url={url as string} />;
    case "audio":
      return <AudioEmbed url={url as string[]} title={audioTitle as string} />;
    case "youtube":
      return <YouTubeEmbed url={url as string} />;
    default:
      return null;
  }
}

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

const Cast: FC<Cast> = ({ cast, style, type }) => {
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

  const postReaction = async (type: "like" | "recast") => {
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
  };

  const deleteReaction = async (type: "like" | "recast") => {
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
  };

  const recastOperation = (type: "post" | "delete") => {
    if (type === "post") postReaction("recast");
    else deleteReaction("recast");
  };

  const likeOperation = (type: "post" | "delete") => {
    if (type === "post") postReaction("like");
    else deleteReaction("like");
  };

  const handleMediaChange = (e: ChangeEvent<HTMLInputElement>) => {
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
  };

  const handleAudioThumbnailMedia = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setAudioThumbnailMedia({
        url: URL.createObjectURL(files[0]),
        file: files[0],
      });
    }
  };

  const handleUploadToPinata = async (file: File) => {
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
  };

  const handlePost = async () => {
    setIsUploading(true);

    try {
      let fileUrl: string | null = null;
      if (media) fileUrl = await handleUploadToPinata(media.file);
      let thumbnailUrl: string | null = null;
      if (audioThumbnailMedia) {
        thumbnailUrl = await handleUploadToPinata(audioThumbnailMedia.file);
      }

      console.log({
        uuid: user?.signer_uuid,
        text: media?.type === "audio" ? musicTitle : commentText,
        fileUrl,
        thumbnailUrl,
        parent: castDet.hash,
      });

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
  };

  const handleTimeUpdate = () => {
    const audio = document.getElementById("audio-element") as HTMLAudioElement;
    setCurrentAudioTime(audio.currentTime);
    setAudioDuration(audio.duration);
  };

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const audio = document.getElementById("audio-element") as HTMLAudioElement;
    audio.currentTime = parseFloat(e.target.value);
    setCurrentAudioTime(audio.currentTime);

    const min = parseFloat(e.target.min);
    const max = parseFloat(e.target.max);
    const value = ((parseFloat(e.target.value) - min) / (max - min)) * 100;
    e.target.style.background = `linear-gradient(to right, white ${value}%, #3D7F41 ${value}%)`;
  };

  const togglePlayPause = () => {
    const audio = document.getElementById("audio-element") as HTMLAudioElement;
    if (audio.paused) {
      audio.play();
      setIsAudioPlaying(true);
    } else {
      audio.pause();
      setIsAudioPlaying(false);
    }
  };

  useEffect(() => {
    setCastDet(cast);
  }, [cast]);

  return (
    <>
      <div className="w-full px-[16px] py-[20px]" style={{ ...style }}>
        <div className="flex items-center justify-start gap-[10px] mb-[10px]">
          <Link
            href={`/profile/${castDet?.author?.fid}`}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <img
              className="w-[40px] h-[40px] rounded-[20px] object-cover"
              src={castDet?.author?.pfp_url}
              alt={castDet?.author?.username}
            />
          </Link>
          <div className="flex flex-col items-start gap-[2px]">
            <p className="font-bold text-[18px] leading-auto">
              {castDet?.author?.display_name}&nbsp;
            </p>
            <div className="flex items-center justify-start gap-1">
              {type !== "reply" && castDet?.channel ? (
                <span className="font-normal text-[12px] leading-auto text-gray-text-1">
                  posted in&nbsp;
                  <Link
                    href={`/channel/${castDet?.channel.id}`}
                    className="font-normal text-[12px] leading-auto text-black"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    /{castDet?.channel.id}
                  </Link>
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
        {castDet?.text && castDet?.embedType !== "audio" ? (
          <p className="text-[18px] font-medium text-black w-full mb-[4px] break-words">
            {castDet?.text}
          </p>
        ) : null}
        <EmbedRenderer
          type={castDet?.embedType}
          url={
            castDet?.embedType === "audio"
              ? castDet?.embeds?.map((e: any) => e.url)
              : castDet?.embeds[0]?.url
          }
          audioTitle={castDet?.text}
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
        closeModal={() => setOpenCommentModal(false)}
        style={{ padding: 8, height: "100%" }}
      >
        <div
          className="pt-[24px] h-full"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div className="flex flex-col flex-1 h-full">
            <div className="grow mb-2">
              <textarea
                className="w-full px-2 outline-none resize-none placeholder:text-black-40"
                placeholder="Write your reply here..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
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
                        onClick={() => setMedia(null)}
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
                    : () => setOpenCommentMediaModal(!openCommentMediaModal)
                }
              />
              <div
                className={`absolute bottom-full bg-white z-[99] transition-all duration-300 ease-in-out p-2 rounded-[18px] shadow-comment-upload-media-modal w-[150px] ${
                  openCommentMediaModal
                    ? "opacity-100 visible"
                    : "opacity-0 invisible"
                }`}
              >
                {["video", "image", "music"].map((t, i, arr) => (
                  <label
                    className={`w-full px-2 py-[10px] flex items-center justify-start gap-[2px] cursor-pointer rounded-[12px] hover:bg-frame-btn-bg ${
                      selectedCommentMediaType === t
                        ? "bg-frame-btn-bg ring-inset ring-1 ring-black/10"
                        : ""
                    } ${i === arr.length - 1 ? "" : "mb-1"}`}
                    key={t}
                    onClick={() =>
                      setSelectedCommentMediaType(
                        t as typeof selectedCommentMediaType
                      )
                    }
                  >
                    <input
                      type="file"
                      accept={`${t === "music" ? "audio" : t}/*`}
                      className="hidden"
                      onChange={(e) => handleMediaChange(e)}
                    />
                    <img
                      src={`/icons/${t}-icon.svg`}
                      alt={t}
                      className="w-6 h-6"
                    />
                    <p className="leading-[22px] capitalize">{t}</p>
                  </label>
                ))}
              </div>
              <button
                className="border-none outline-none rounded-[22px] px-4 py-2 bg-black text-white leading-[120%] font-medium disabled:bg-black-40 disabled:text-black-50"
                disabled={!(media || commentText) || isUploading}
                onClick={handlePost}
              >
                {isUploading ? "Uploading..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={openMusicUploadModal}
        closeModal={() => {
          setOpenMusicUploadModal(false);
          setMedia(null);
          setAudioThumbnailMedia(null);
        }}
      >
        <div className="pt-2 px-2 pb-8" onClick={(e) => e.stopPropagation()}>
          <p className="text-center text-[18px] leading-[22px] font-semibold mb-2">
            Music Upload
          </p>
          <div className="flex flex-col w-full gap-5">
            {media ? (
              <div className="p-2 rounded-[12px] bg-music-upload-color/60 flex items-center gap-2">
                <label className={`cursor-pointer`}>
                  <div className="rounded-[11px] w-[70px] h-[70px]">
                    <img
                      src={
                        audioThumbnailMedia
                          ? audioThumbnailMedia.url
                          : "/icons/thumbnail-upload-icon.svg"
                      }
                      alt="image"
                      className="flex-shrink-0 rounded-[11px] object-cover"
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
                          width: `${
                            audioDuration
                              ? Math.floor(
                                  (currentAudioTime / audioDuration) * 100
                                )
                              : 0
                          }%`,
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
              onClick={handlePost}
            >
              {isUploading ? "Uploading..." : "Post"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Cast;
