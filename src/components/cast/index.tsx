"use client";
import formatNumber from "@/utils/formatNumber";
import timeAgo from "@/utils/timeAgo";
import { useNeynarContext } from "@neynar/react";
import Link from "next/link";
import { CSSProperties, FC, useEffect, useState } from "react";
import { toast } from "sonner";

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

function AudioEmbed({ url }: { url: string }) {
  return (
    <audio controls className="w-full">
      <source src={url} type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
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

function EmbedRenderer({ type, url }: { type: string; url: string }) {
  switch (type) {
    case "image":
      return <ImageEmbed url={url} />;
    case "video":
      return <VideoEmbed url={url} />;
    case "audio":
      return <AudioEmbed url={url} />;
    case "youtube":
      return <YouTubeEmbed url={url} />;
    default:
      return null;
  }
}

interface Cast {
  cast: any;
  style?: CSSProperties;
}

const Cast: FC<Cast> = ({ cast, style }) => {
  const { user } = useNeynarContext();

  const [castDet, setCastDet] = useState<any>();

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
              e.preventDefault();
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
              {castDet?.channel ? (
                <span className="font-normal text-[12px] leading-auto text-gray-text-1">
                  posted in&nbsp;
                  <Link
                    href={`/channel/${castDet?.channel.id}`}
                    className="font-normal text-[12px] leading-auto text-black"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    /{castDet?.channel.id}
                  </Link>
                </span>
              ) : null}
              <span className="font-normal text-[12px] leading-auto text-gray-text-1">
                {timeAgo(castDet?.timestamp)}
              </span>
            </div>
          </div>
        </div>
        {castDet?.text ? (
          <p className="text-[18px] font-medium text-black w-full mb-[4px] break-words">
            {castDet?.text}
          </p>
        ) : null}
        <EmbedRenderer
          type={castDet?.embedType}
          url={castDet?.embeds[0]?.url}
        />
        <div className="w-full flex items-center justify-between mt-[16px]">
          <div className="flex items-center justify-start gap-[14px]">
            <div className="flex items-center gap-[2px] cursor-pointer">
              <img
                src={
                  castDet?.viewer_context?.liked
                    ? `/icons/like-filled-icon.svg`
                    : `/icons/like-icon.svg`
                }
                alt="like"
                width={24}
                height={24}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  likeOperation(
                    castDet?.viewer_context?.liked ? "delete" : "post"
                  );
                }}
              />
              <p className="text-[14px] leading-auto font-normal">
                {formatNumber(castDet?.reactions?.likes_count)}
              </p>
            </div>
            <div className="flex items-center gap-[2px] opacity-[0.4] cursor-not-allowed">
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
            <div className="flex items-center gap-[2px] cursor-pointer">
              <img
                src={
                  castDet?.viewer_context?.recasted
                    ? `/icons/recast-filled-icon.svg`
                    : `/icons/recast-icon.svg`
                }
                alt="recast"
                width={24}
                height={24}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  recastOperation(
                    castDet?.viewer_context?.recasted ? "delete" : "post"
                  );
                }}
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
    </>
  );
};

export default Cast;
