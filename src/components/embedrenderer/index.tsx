"use client";
import formatTime from "@/utils/formatTime";
import { useNeynarContext } from "@neynar/react";
import { ChangeEvent, useState } from "react";

function ImageEmbed({ url, className }: { url: string; className?: string }) {
  return (
    <img
      src={url}
      alt="Cast image"
      className={`w-full h-full object-contain rounded-[10px] ${
        className || ""
      }`}
    />
  );
}

function VideoEmbed({ url, className }: { url: string; className?: string }) {
  return (
    <video
      controls
      autoPlay
      muted
      className={`w-full h-full object-contain rounded-[10px] ${
        className || ""
      }`}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <source src={url} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}

function AudioEmbed({
  url,
  title,
  className,
}: {
  url: string[];
  title: string;
  className?: string;
}) {
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
    <div
      className={`p-2 rounded-[12px] bg-music-upload-color/60 flex flex-col items-center gap-4 ${
        className || ""
      }`}
    >
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
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              togglePlayPause();
            }}
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

function YouTubeEmbed({ url, className }: { url: string; className?: string }) {
  const videoId = getYouTubeVideoId(url);
  return (
    <iframe
      width="100%"
      src={`https://www.youtube.com/embed/${videoId}`}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className={`w-full max-h-[100dvw] min-h-[300px] object-contain rounded-[10px] ${
        className || ""
      }`}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    ></iframe>
  );
}

export default function EmbedRenderer({
  type,
  url,
  audioTitle,
  className,
}: {
  type: string;
  url: string[] | string;
  audioTitle?: string;
  className?: string;
}) {
  switch (type) {
    case "image":
      return <ImageEmbed url={url as string} className={className} />;
    case "video":
      return <VideoEmbed url={url as string} className={className} />;
    case "audio":
      return (
        <AudioEmbed
          url={url as string[]}
          title={audioTitle as string}
          className={className}
        />
      );
    case "youtube":
      return <YouTubeEmbed url={url as string} className={className} />;
    default:
      return null;
  }
}
