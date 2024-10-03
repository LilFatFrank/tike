"use client";
import timeAgo from "@/utils/timeAgo";
import { useNeynarContext } from "@neynar/react";
import { useRouter } from "next/navigation";
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
import StringProcessor from "../stringprocessor";
import formatNumber from "@/utils/formatNumber";
import axios from "axios";
import CommentModal from "../cast/commentmodal";
import MusicUploadModal from "../cast/musicuploadmodal";
import {
  useAccount,
  useChainId,
  useConnect,
  useSendTransaction,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { coinbaseWallet } from "wagmi/connectors";

interface Frame {
  frame: any;
  style?: CSSProperties;
  type?: "default" | "reply";
}

interface Media {
  type: "image" | "video" | "audio";
  url: string;
  file: File;
}

const Frame: FC<Frame> = memo(({ frame, style, type }) => {
  const { user } = useNeynarContext();
  const router = useRouter();
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();
  const { address } = useAccount();
  const { connectAsync } = useConnect();
  const chain = useChainId();
  const { sendTransactionAsync } = useSendTransaction();

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
  const [openCommentModal, setOpenCommentModal] = useState(false);
  const [frameDet, setFrameDet] = useState<any>();
  const [inputText, setInputText] = useState("");
  const [loadingFrameInteraction, setLoadingFrameInteraction] = useState(false);

  const frameInteraction = useCallback(
    async (value: any) => {
      setLoadingFrameInteraction(true);
      try {
        switch (value.action_type) {
          case "link":
            window.open(value.target, "_blank", "noreferrer noopener");
            break;
          default: {
            if (!address && value.action_type === "tx") {
              await connectAsync({
                connector: coinbaseWallet(),
              });
            }
            const res = await fetch(`/api/frame-action`, {
              method: "POST",
              body: JSON.stringify({
                cast_hash: frameDet?.hash,
                signer_uuid: user?.signer_uuid,
                action: {
                  ...(value.action_type === "tx" ? { address } : {}),
                  version: frameDet?.frames[0]?.version,
                  title: frameDet?.frames[0]?.title,
                  image: frameDet?.frames[0]?.image,
                  frames_url: frameDet?.frames[0]?.frames_url,
                  post_url: frameDet?.frames[0]?.post_url || frameDet?.frames[0]?.frames_url,
                  button: {
                    index: value.index,
                    action_type: value.action_type,
                    title: value.title,
                    ...(value.target ? { target: value.target } : {}),
                    ...(value.post_url ? { post_url: value.post_url } : {}),
                  },
                  ...(frameDet?.frames[0]?.input &&
                  Object.keys(frameDet?.frames[0]?.input)?.length &&
                  inputText
                    ? { input: { text: inputText } }
                    : {}),
                  ...(frameDet?.frames[0]?.state &&
                  Object.keys(frameDet?.frames[0]?.state)?.length
                    ? {
                        state: {
                          serialized: frameDet?.frames[0]?.state?.serialized,
                        },
                      }
                    : {}),
                },
              }),
            });
            const data = await res.json();
            if (data.error) {
              toast.error(typeof data.error.message === "string" ? data.error.message : "Error interacting with frame");
              console.log("Error", data.error.message);
              return;
            }
            if (value.action_type !== "tx") {
              setFrameDet({
                ...frameDet,
                frames: [data],
              });
            } else {
              if (
                chain !==
                Number(data.transaction_calldata.chainId.split(":")[1])
              ) {
                await switchChainAsync({
                  chainId: Number(
                    data.transaction_calldata.chainId.split(":")[1]
                  ),
                });
              }
              const hash = await sendTransactionAsync({
                to: data.transaction_calldata.params.to,
                data: data.transaction_calldata.params.data,
                value: data.transaction_calldata.params.value,
                chainId: Number(
                  data.transaction_calldata.chainId.split(":")[1]
                ),
              });
              const res = await fetch(`/api/frame-action`, {
                method: "POST",
                body: JSON.stringify({
                  cast_hash: frameDet?.hash,
                  signer_uuid: user?.signer_uuid,
                  action: {
                    transaction: {
                      hash,
                    },
                    ...(value.action_type === "tx" ? { address } : {}),
                    version: frameDet?.frames[0]?.version,
                    title: frameDet?.frames[0]?.title,
                    image: frameDet?.frames[0]?.image,
                    frames_url: frameDet?.frames[0]?.frames_url,
                    post_url: frameDet?.frames[0]?.post_url || frameDet?.frames[0]?.frames_url,
                    button: {
                      index: value.index,
                      action_type: value.action_type,
                      title: value.title,
                      ...(value.target ? { target: value.target } : {}),
                      ...(value.post_url ? { post_url: value.post_url } : {}),
                    },
                    ...(frameDet?.frames[0]?.input &&
                    Object.keys(frameDet?.frames[0]?.input)?.length &&
                    inputText
                      ? { input: { text: inputText } }
                      : {}),
                    ...(frameDet?.frames[0]?.state &&
                    Object.keys(frameDet?.frames[0]?.state)?.length
                      ? {
                          state: {
                            serialized: frameDet?.frames[0]?.state?.serialized,
                          },
                        }
                      : {}),
                  },
                }),
              });
              const txData = await res.json();
              if (txData.error) {
                toast.error(typeof txData.error.message === "string" ? txData.error.message : "Error interacting with frame");
                console.log("Error", txData.error);
                return;
              }
              setFrameDet({
                ...frameDet,
                frames: [txData],
              });
            }
          }
        }
      } catch (error) {
        console.log(error);
        toast.error("Error interacting with frame");
      } finally {
        setLoadingFrameInteraction(false);
      }
    },
    [user?.fid, inputText, frameDet]
  );

  const postReaction = useCallback(
    async (type: "like" | "recast") => {
      const res = await fetch(`/api/post-reaction`, {
        method: "POST",
        body: JSON.stringify({
          reactionType: type,
          uuid: user?.signer_uuid as string,
          hash: frameDet?.hash as string,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFrameDet({
          ...frame,
          viewer_context: {
            ...frameDet?.viewer_context,
            [type === "like" ? "liked" : "recasted"]:
              !frameDet?.viewer_context[type === "like" ? "liked" : "recasted"],
          },
          reactions: {
            ...frameDet?.reactions,
            [type === "like" ? "likes_count" : "recasts_count"]:
              frameDet?.reactions[
                type === "like" ? "likes_count" : "recasts_count"
              ] + 1,
          },
        });
      }
    },
    [frameDet, user?.signer_uuid]
  );

  const deleteReaction = useCallback(
    async (type: "like" | "recast") => {
      const res = await fetch(`/api/delete-reaction`, {
        method: "POST",
        body: JSON.stringify({
          reactionType: type,
          uuid: user?.signer_uuid as string,
          hash: frameDet.hash as string,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFrameDet({
          ...frameDet,
          viewer_context: {
            ...frameDet.viewer_context,
            [type === "like" ? "liked" : "recasted"]:
              !frameDet.viewer_context[type === "like" ? "liked" : "recasted"],
          },
          reactions: {
            ...frameDet?.reactions,
            [type === "like" ? "likes_count" : "recasts_count"]:
              frameDet?.reactions[
                type === "like" ? "likes_count" : "recasts_count"
              ] - 1,
          },
        });
      }
    },
    [frameDet, user?.signer_uuid]
  );

  const recastOperation = (type: "post" | "delete") => {
    if (type === "post") postReaction("recast");
    else deleteReaction("recast");
  };

  const likeOperation = (type: "post" | "delete") => {
    if (type === "post") postReaction("like");
    else deleteReaction("like");
  };

  const deleteCast = useCallback(async () => {
    try {
      const res = await fetch(`/api/delete-cast`, {
        method: "POST",
        body: JSON.stringify({
          hash: frameDet?.hash,
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
  }, [frameDet?.hash, user?.signer_uuid]);

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
          parent: frameDet.hash,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.success) window.location.reload();
    } catch (error) {
      console.error("Error posting", error);
      toast.error("Error posting");
    } finally {
      setIsUploading(false);
      setCommentText("");
      setMedia(null);
    }
  }, [
    frameDet,
    user?.signer_uuid,
    media,
    audioThumbnailMedia,
    musicTitle,
    commentText,
  ]);

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
    setFrameDet(frame);
  }, [frame]);

  const audioProgressWidth = useMemo(() => {
    return audioDuration
      ? Math.floor((currentAudioTime / audioDuration) * 100)
      : 0;
  }, [currentAudioTime, audioDuration]);

  return deleteSuccess ? (
    <>
      <div className="w-full px-[16px] py-[20px]" style={{ ...style }}>
        <div className="flex items-center justify-between w-full">
          This frame was deleted!
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
                router.push(`/profile/${frameDet?.author?.fid}`);
              }}
              className="cursor-pointer"
            >
              <img
                className="w-[40px] h-[40px] rounded-[20px] object-cover"
                src={frameDet?.author?.pfp_url}
                alt={frameDet?.author?.username}
                width={40}
                height={40}
                loading="lazy"
                style={{ aspectRatio: "1 / 1" }}
              />
            </span>
            <div className="flex flex-col items-start gap-[2px]">
              <p className="font-bold text-[18px] leading-auto">
                {frameDet?.author?.display_name}&nbsp;
              </p>
              <div className="flex items-center justify-start gap-1">
                {type !== "reply" && frameDet?.channel ? (
                  <span className="font-normal text-[12px] leading-auto text-gray-text-1">
                    posted in&nbsp;
                    <span
                      className="font-normal text-[12px] leading-auto text-black cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        router.push(`/channel/${frameDet?.channel.id}`);
                      }}
                    >
                      /{frameDet?.channel.id}
                    </span>
                  </span>
                ) : (
                  <span className="font-normal text-[12px] leading-auto text-gray-text-1">
                    @{frameDet?.author?.username}
                  </span>
                )}
                <span className="font-normal text-[12px] leading-auto text-gray-text-1">
                  {timeAgo(frameDet?.timestamp)}
                </span>
              </div>
            </div>
          </div>
          {frameDet?.author?.fid === user?.fid ? (
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
                style={{ aspectRatio: "1 / 1" }}
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
                      style={{ aspectRatio: "1 / 1" }}
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
                      window.navigator.clipboard.writeText(frameDet?.hash);
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
                      style={{ aspectRatio: "1 / 1" }}
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
        {loadingFrameInteraction ? (
          <div className="flex items-center flex-col justify-start w-full gap-1">
            <div className="animate-pulse w-full h-[360px] bg-divider rounded-lg" />
            <div className="animate-pulse w-full h-[40px] bg-divider rounded-lg" />
            <div className="animate-pulse w-full h-[40px] bg-divider rounded-lg" />
          </div>
        ) : (
          <>
            {frameDet?.text ? (
              <p className="text-[18px] font-medium text-black w-full mb-[4px] break-words">
                <StringProcessor
                  inputString={frameDet?.text}
                  mentionedProfiles={frameDet?.mentioned_profiles}
                />
              </p>
            ) : null}
            <img
              src={frameDet?.frames[0]?.image}
              alt="Cast image"
              className="w-full object-contain rounded-[10px] mb-1"
              loading="lazy"
            />
            {frameDet?.frames[0]?.input &&
            Object.keys(frameDet?.frames[0]?.input)?.length ? (
              <input
                className="border border-frame-btn-bg rounded-[12px] py-2 px-4 outline-none w-full bg-inherit placeholder:text-black-40 mb-1"
                placeholder={frameDet?.frames[0]?.input.text}
                onChange={(e) => setInputText(e.target.value)}
                value={inputText}
              />
            ) : null}
            {frameDet?.frames[0]?.buttons?.map((b: any, i: number, arr: []) => (
              <button
                className={`frame-btn ${i === arr.length - 1 ? "" : "mb-1"}`}
                key={b.index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  frameInteraction(b);
                }}
              >
                <p className="font-medium">{b.title}</p>
              </button>
            ))}
          </>
        )}
        <div className="w-full flex items-center justify-between mt-[12px]">
          <div className="flex items-center justify-start gap-[14px]">
            <div
              className="flex items-center gap-[2px] cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                likeOperation(
                  frameDet?.viewer_context?.liked ? "delete" : "post"
                );
              }}
            >
              <img
                src={
                  frameDet?.viewer_context?.liked
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
                {formatNumber(frameDet?.reactions?.likes_count)}
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
                {formatNumber(frameDet?.replies?.count)}
              </p>
            </div>
            <div
              className="flex items-center gap-[2px] cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                recastOperation(
                  frameDet?.viewer_context?.recasted ? "delete" : "post"
                );
              }}
            >
              <img
                src={
                  frameDet?.viewer_context?.recasted
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
                {formatNumber(frameDet?.reactions?.recasts_count)}
              </p>
            </div>
          </div>
          <button
            className="bg-none border-none m-0 p-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.navigator.clipboard.writeText(
                `https://app.tike.social/cast/${frameDet?.hash}`
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
        setOpenCommentModal={(value: boolean) => setOpenCommentModal(value)}
        commentText={commentText}
        setCommentText={(value: string) => setCommentText(value)}
        handleMediaChange={handleMediaChange}
        isUploading={isUploading}
        handlePost={handlePost}
        media={media}
        setMedia={(value: any) => setMedia(value)}
        openCommentMediaModal={openCommentMediaModal}
        setOpenCommentMediaModal={(value: boolean) =>
          setOpenCommentMediaModal(value)
        }
        selectedCommentMediaType={selectedCommentMediaType}
        setSelectedCommentMediaType={(value: "video" | "image" | "music") =>
          setSelectedCommentMediaType(value)
        }
      />
      <MusicUploadModal
        openMusicUploadModal={openMusicUploadModal}
        setOpenMusicUploadModal={(value: boolean) =>
          setOpenMusicUploadModal(value)
        }
        media={media}
        setMedia={(value: any) => setMedia(value)}
        audioThumbnailMedia={audioThumbnailMedia}
        setAudioThumbnailMedia={(value: any) => setAudioThumbnailMedia(value)}
        musicTitle={musicTitle}
        setMusicTitle={(value: string) => setMusicTitle(value)}
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

export default Frame;
