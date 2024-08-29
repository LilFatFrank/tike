"use client";
import React, { useState, useRef, useEffect, FC } from "react";
import YouTube from "react-youtube";

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

const RadioPlayer: React.FC = () => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<any>(null);

  const onReady = (event: any) => {
    playerRef.current = event.target;
    playerRef.current.setVolume(70);
  };

  const onEnd = () => {
    handleNext();
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    const nextIndex = (currentVideoIndex + 1) % videos.length;
    setCurrentVideoIndex(nextIndex);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    const prevIndex = (currentVideoIndex - 1 + videos.length) % videos.length;
    setCurrentVideoIndex(prevIndex);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.playVideo();
    }
  }, [currentVideoIndex]);

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
            },
          }}
          onReady={onReady}
          onEnd={onEnd}
        />
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
            <img
              src="/icons/radio-prev-icon.svg"
              alt="prev"
              className="w-[18px] h-[18px] cursor-pointer"
              onClick={handlePrev}
            />
            <img
              src={
                isPlaying
                  ? "/icons/radio-pause-icon.svg"
                  : "/icons/radio-play-icon.svg"
              }
              alt="prev"
              className="w-[18px] h-[18px] cursor-pointer"
              onClick={handlePlayPause}
            />
            <img
              src="/icons/radio-next-icon.svg"
              alt="prev"
              className="w-[18px] h-[18px] cursor-pointer"
              onClick={handleNext}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadioPlayer;

interface Equalizer {
  isAnimating: boolean;
}

const Equalizer: FC<Equalizer> = ({ isAnimating }) => {
  return (
    <div className="flex items-center h-5">
      <div
        className={`w-[3px] h-full bg-[#3A6A6B] mx-[1px] ${
          isAnimating ? "animate-bounce" : ""
        }`}
        style={{
          animationDelay: "0s",
          transformOrigin: "bottom",
          transform: isAnimating ? "" : "scaleY(0.3)",
        }}
      ></div>
      <div
        className={`w-[3px] h-full bg-[#3A6A6B] mx-[1px] ${
          isAnimating ? "animate-bounce" : ""
        }`}
        style={{
          animationDelay: "0.2s",
          transformOrigin: "bottom",
          transform: isAnimating ? "" : "scaleY(0.3)",
        }}
      ></div>
      <div
        className={`w-[3px] h-full bg-[#3A6A6B] mx-[1px] ${
          isAnimating ? "animate-bounce" : ""
        }`}
        style={{
          animationDelay: "0.4s",
          transformOrigin: "bottom",
          transform: isAnimating ? "" : "scaleY(0.3)",
        }}
      ></div>
      <div
        className={`w-[3px] h-full bg-[#3A6A6B] mx-[1px] ${
          isAnimating ? "animate-bounce" : ""
        }`}
        style={{
          animationDelay: "0.6s",
          transformOrigin: "bottom",
          transform: isAnimating ? "" : "scaleY(0.3)",
        }}
      ></div>
    </div>
  );
};
