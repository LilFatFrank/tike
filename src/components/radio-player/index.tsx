"use client";
import Image from "next/image";
import React, { useState, memo, useCallback } from "react";
import YouTube from "react-youtube";
import { toast } from "sonner";

const videos = [
  {
    id: "k7P985NUlE4",
    title:
      "Popular Anime Openings But It's Lofi Remix ~ Relaxing Anime Lofi Mix ~ Study, Sleep, Relax",
    artist: "chilloutlofimusic",
  },
  {
    id: "JdqL89ZZwFw",
    title:
      "Quiet 🍀 Lofi Keep You Safe 🍃 Deep focus Study//Work [ Lofi hip hop - Lofi chill ]",
    artist: "lofikeepyousafe",
  },
  {
    id: "ArHSMbhjLiE",
    title:
      "Playlist 80's Tokyo Lofi Hiphop & Girl🗼 / lo-fi hiphop mix ( Chill & Study )",
    artist: "lofi_tokyocity",
  },
  {
    id: "FjHGZj2IjBk",
    title:
      "Meditation - Monoman .beautiful comment section peaceful relaxing soothing [Study Sleep Relax 💖]",
    artist: "puuung1",
  },
  {
    id: "jfKfPfyJRdk",
    title: "lofi hip hop radio 📚 - beats to relax/study to",
    artist: "LofiGirl",
  },
  {
    id: "4xDzrJKXOOY",
    title: "synthwave radio 🌌 - beats to chill/game to",
    artist: "LofiGirl",
  },
  {
    id: "jrTMMG0zJyI",
    title: "Samurai ☯ Japanese Lofi HipHop Mix",
    artist: "thebootlegboy",
  },
  {
    id: "bP9gMpl1gyQ",
    title:
      "Relaxing Sleep Music + Insomnia - Stress Relief, Relaxing Music, Deep Sleeping Music",
    artist: "TheSoulofWindLabel",
  },
  {
    id: "qH3fETPsqXU",
    title: "24/7 CHILL LOFI HIP HOP RADIO】beats to sleep/relax/study to",
    artist: "ChillwithTaiki",
  },
  {
    id: "5yx6BWlEVcY",
    title: "Chillhop Radio - jazzy & lofi hip hop beats 🐾",
    artist: "ChillhopMusic",
  },
  {
    id: "lP26UCnoH9s",
    title: "Coffee Shop Radio ☕ - 24/7 lofi & jazzy hip-hop beats",
    artist: "steezyasfvck",
  },
  {
    id: "7NOSDKb0HlU",
    title: "lofi hip hop radio - beats to study/relax to 🐾",
    artist: "ChillhopMusic",
  },
  {
    id: "tNkZsRW7h2c",
    title:
      "🔴 Space Ambient Music LIVE 24/7: Space Traveling Background Music, Music for Stress Relief, Dreaming",
    artist: "RelaxationMeditationMusic",
  },
];

const RadioPlayer: React.FC = memo(() => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = React.useRef<any>(null);

  const handlePlayPause = useCallback(() => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleNext = useCallback(() => {
    const nextIndex = (currentVideoIndex + 1) % videos.length;
    setCurrentVideoIndex(nextIndex);
    if (playerRef.current) {
      playerRef.current.loadVideoById(videos[nextIndex].id);
      if (isPlaying) {
        playerRef.current.playVideo();
      }
    }
  }, [currentVideoIndex, isPlaying]);

  const handlePrev = useCallback(() => {
    const prevIndex = (currentVideoIndex - 1 + videos.length) % videos.length;
    setCurrentVideoIndex(prevIndex);
    if (playerRef.current) {
      playerRef.current.loadVideoById(videos[prevIndex].id);
      if (isPlaying) {
        playerRef.current.playVideo();
      }
    }
  }, [currentVideoIndex, isPlaying]);

  const onReady = useCallback(
    (event: any) => {
      playerRef.current = event.target;
      playerRef.current.setVolume(70);
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    },
    [isPlaying]
  );

  const onError = useCallback((error: any) => {
    toast.error("Error playing video");
    console.error("YouTube player error:", error);
  }, []);

  const onStateChange = useCallback((event: any) => {
    console.log("YouTube player state changed:", event.data);
  }, []);

  return (
    <div className="fixed left-[20px] bottom-[20px]">
      <div className="flex items-center gap-1 p-2 rounded-[12px] bg-white/50 backdrop-blur-[10px]">
        <YouTube
          videoId={videos[currentVideoIndex].id}
          opts={{
            height: "0",
            width: "0",
            playerVars: {
              controls: 0,
              autoplay: 1,
              loop: 1,
              playlist: videos.map((video) => video.id).join(","),
            },
          }}
          onReady={onReady}
          onError={onError}
          onStateChange={onStateChange}
          key={currentVideoIndex}
        />
        {/* Equalizer component */}
        <Equalizer isAnimating={isPlaying} />
        <div className="flex items-center gap-2">
          <div className="text-left">
            <p className="text-[12px] leading-[15px] font-bold mb-1 w-[18ch] text-ellipsis overflow-hidden whitespace-nowrap text-[#3A6A6B]">
              {videos[currentVideoIndex].title}
            </p>
            <p className="text-[12px] leading-[15px] text-[#3A6A6BCC] w-[18ch] text-ellipsis overflow-hidden whitespace-nowrap">
              {videos[currentVideoIndex].artist}
            </p>
          </div>
          <div className="flex space-x-[6px]">
            <Image
              src="/icons/radio-prev-icon.svg"
              alt="prev"
              className="w-[18px] h-[18px] cursor-pointer"
              onClick={handlePrev}
              width={18}
              height={18}
              loading="lazy"
              quality={100}
              style={{ aspectRatio: "1 / 1" }}
            />
            <Image
              src={
                isPlaying
                  ? "/icons/radio-pause-icon.svg"
                  : "/icons/radio-play-icon.svg"
              }
              alt="play/pause"
              className="w-[18px] h-[18px] cursor-pointer"
              onClick={handlePlayPause}
              width={18}
              height={18}
              loading="lazy"
              quality={100}
              style={{ aspectRatio: "1/1" }}
            />
            <Image
              src="/icons/radio-next-icon.svg"
              alt="next"
              className="w-[18px] h-[18px] cursor-pointer"
              onClick={handleNext}
              width={18}
              height={18}
              loading="lazy"
              quality={100}
              style={{ aspectRatio: "1/1" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default RadioPlayer;

interface EqualizerProps {
  isAnimating: boolean;
}

const Equalizer: React.FC<EqualizerProps> = memo(({ isAnimating }) => {
  return (
    <div className="flex items-center h-5">
      {[0, 200, 400, 600].map((delay) => (
        <div
          key={delay}
          className={`w-[3px] h-full bg-[#3A6A6B] mx-[1px] ${
            isAnimating ? "animate-bounce" : ""
          }`}
          style={{
            animationDelay: `${delay / 1000}s`,
            transformOrigin: "bottom",
            transform: isAnimating ? "" : "scaleY(0.3)",
          }}
        ></div>
      ))}
    </div>
  );
});
