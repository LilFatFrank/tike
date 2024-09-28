"use client";
import formatNumber from "@/utils/formatNumber";
import timeAgo from "@/utils/timeAgo";
import { useNeynarContext } from "@neynar/react";
import {
  ChangeEvent,
  CSSProperties,
  FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import axios from "axios";
import StringProcessor from "../stringprocessor";
import EmbedRenderer from "../embedrenderer";
import { useRouter } from "next/navigation";
import MusicUploadModal from "./musicuploadmodal";
import CommentModal from "./commentmodal";

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

  const postReaction = useCallback(
    async (type: "like" | "recast") => {
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
  }, [castDet, user?.signer_uuid]);

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
  }, []);

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
  }, [castDet, user?.signer_uuid, media, audioThumbnailMedia, musicTitle]);

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
                width={40}
                height={40}
                loading="lazy"
                style={{ aspectRatio: "1/1" }}
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
                width={24}
                height={24}
                loading="lazy"
                style={{ aspectRatio: "1/1" }}
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
                      width={24}
                      height={24}
                      loading="lazy"
                      style={{ aspectRatio: "1/1" }}
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
                      width={24}
                      height={24}
                      loading="lazy"
                      style={{ aspectRatio: "1/1" }}
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
                loading="lazy"
                style={{ aspectRatio: "1/1" }}
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
                loading="lazy"
                style={{ aspectRatio: "1/1" }}
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
                loading="lazy"
                style={{ aspectRatio: "1/1" }}
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
            <img
              src="/icons/share.svg"
              alt="share"
              width={24}
              height={24}
              className="w-6 h-6"
              loading="lazy"
              style={{ aspectRatio: "1/1" }}
            />
          </button>
        </div>
      </div>
      <CommentModal
        openCommentModal={openCommentModal}
        setOpenCommentModal={setOpenCommentModal}
        commentText={commentText}
        setCommentText={setCommentText}
        handleMediaChange={handleMediaChange}
        isUploading={isUploading}
        handlePost={handlePost}
        media={media}
        setMedia={setMedia}
        openCommentMediaModal={openCommentMediaModal}
        setOpenCommentMediaModal={setOpenCommentMediaModal}
        selectedCommentMediaType={selectedCommentMediaType}
        setSelectedCommentMediaType={(value: "video" | "image" | "music") =>
          setSelectedCommentMediaType(value)
        }
      />
      <MusicUploadModal
        openMusicUploadModal={openMusicUploadModal}
        setOpenMusicUploadModal={setOpenMusicUploadModal}
        media={media}
        setMedia={setMedia}
        audioThumbnailMedia={audioThumbnailMedia}
        setAudioThumbnailMedia={setAudioThumbnailMedia}
        musicTitle={musicTitle}
        setMusicTitle={setMusicTitle}
        isUploading={isUploading}
        handlePost={handlePost}
        handleAudioThumbnailMedia={handleAudioThumbnailMedia}
        handleTimeUpdate={handleTimeUpdate}
        handleSeek={handleSeek}
        audioDuration={audioDuration}
        currentAudioTime={currentAudioTime}
        audioProgressWidth={audioProgressWidth}
        isAudioPlaying={isAudioPlaying}
        togglePlayPause={togglePlayPause}
      />
    </>
  );
});

export default Cast;
