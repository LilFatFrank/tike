"use client";
import timeAgo from "@/utils/timeAgo";
import Link from "next/link";
import { FC } from "react";

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

function YouTubeEmbed({ url }: { url: string }) {
  const videoId = url.split("v=")[1];
  return (
    <iframe
      width="100%"
      src={`https://www.youtube.com/embed/${videoId}`}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="w-full max-h-[100dvw] object-contain rounded-[10px]"
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
}

const Cast: FC<Cast> = ({ cast }) => {
  return (
    <>
      <div className="w-full px-[16px] py-[20px]">
        <div className="flex items-center justify-start gap-[10px] mb-[10px]">
          <img
            className="w-[40px] h-[40px] rounded-[20px] object-cover"
            src={cast.author.pfp_url}
            alt={cast.author.username}
          />
          <div className="flex flex-col items-start gap-[2px]">
            <p className="font-bold text-[18px] leading-auto">
              {cast.author.display_name}&nbsp;
            </p>
            <div className="flex items-center justify-start gap-1">
              {cast.channel ? (
                <span className="font-normal text-[12px] leading-auto text-gray-text-1">
                  posted in&nbsp;
                  <Link
                    href={""}
                    className="font-normal text-[12px] leading-auto text-black"
                  >
                    /{cast.channel.id}
                  </Link>
                </span>
              ) : null}
              <span className="font-normal text-[12px] leading-auto text-gray-text-1">
                {timeAgo(cast.timestamp)}
              </span>
            </div>
          </div>
        </div>
        {cast.text ? (
          <p className="text-[18px] font-medium text-black w-full mb-[4px] break-words">
            {cast.text}
          </p>
        ) : null}
        <EmbedRenderer type={cast.embedType} url={cast.embeds[0].url} />
        <div className="w-full flex items-center justify-between mt-[16px]">
          <div className="flex items-center justify-start gap-[14px]">
            <div className="flex items-center gap-[2px]">
              <img src="/icons/like.svg" alt="like" width={24} height={24} />
              <p className="text-[14px] leading-auto font-normal">
                {cast.reactions.likes_count}
              </p>
            </div>
            <div className="flex items-center gap-[2px]">
              <img
                src="/icons/comment.svg"
                alt="comment"
                width={24}
                height={24}
              />
              <p className="text-[14px] leading-auto font-normal">
                {cast.replies.count}
              </p>
            </div>
            <div className="flex items-center gap-[2px]">
              <img
                src="/icons/recast.svg"
                alt="recast"
                width={24}
                height={24}
              />
              <p className="text-[14px] leading-auto font-normal">
                {cast.reactions.recasts_count}
              </p>
            </div>
          </div>
          <img src="/icons/share.svg" alt="share" width={24} height={24} />
        </div>
      </div>
    </>
  );
};

export default Cast;
