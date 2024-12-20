"use client";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
  useTransition,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { debounce } from "@/utils/debounce";
import { useNeynarContext } from "@neynar/react";
import { useRouter } from "next/navigation";

interface Video {
  url: string;
  hash: string;
}

interface ApiResponse {
  data: Video[];
  nextCursor: string | null;
}

const VideoCell = memo(({ video }: { video: Video | null }) => {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  if (!video)
    return (
      <div className="max-md:w-40 max-md:h-40 w-[300px] h-[300px] bg-gray-200 rounded-lg flex-shrink-0" />
    );

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Handle autoplay failure silently
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      className="max-md:w-40 max-md:h-40 w-[300px] h-[300px] bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer relative"
      onClick={() => router.push(`/cast/${video.hash}`)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={video.url}
        className="w-full h-full object-cover"
        muted
        loop
        playsInline
        preload="none"
      />
      {!isHovered && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center">
            <img
              src="/icons/tike-white-icon.svg"
              alt="tike-white-logo"
              className="w-6 h-6"
            />
          </div>
        </div>
      )}
    </div>
  );
});

VideoCell.displayName = "VideoCell";

const GridRow = memo(
  ({ row, rowIndex }: { row: (Video | null)[]; rowIndex: number }) => (
    <div className="flex gap-4 mb-4">
      {row.map((video, colIndex) => (
        <VideoCell
          key={video?.url || `${rowIndex}-${colIndex}`}
          video={video}
        />
      ))}
    </div>
  )
);

GridRow.displayName = "GridRow";

const LoadingImageCell = memo(() => (
  <div className="max-md:w-40 max-md:h-40 w-[300px] h-[300px] bg-gray-200 rounded-lg flex-shrink-0 animate-pulse" />
));

LoadingImageCell.displayName = "LoadingImageCell";

const LoadingGridRow = memo(({ columns = 10 }: { columns?: number }) => (
  <div className="flex gap-4 mb-4">
    {Array.from({ length: columns }).map((_, index) => (
      <LoadingImageCell key={index} />
    ))}
  </div>
));

LoadingGridRow.displayName = "LoadingGridRow";

const LoadingGrid = memo(
  ({ rows = 10, columns = 10 }: { rows?: number; columns?: number }) => (
    <div>
      {Array.from({ length: rows }).map((_, index) => (
        <LoadingGridRow key={index} columns={columns} />
      ))}
    </div>
  )
);

const VideoCanvas = () => {
  const { user } = useNeynarContext();
  const [videoGrid, setVideoGrid] = useState<(Video | null)[][]>([[]]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();

  const videoCache = useRef(new Map<string, string>());

  const rowVirtualizer = useVirtualizer({
    count: videoGrid.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 200,
    overscan: 5,
  });

  const fetchVideos = useCallback(
    async (cursor: string | null, limit: number | null = 25) => {
      const abortController = new AbortController();
      const response = await fetch(`/api/videos`, {
        method: "POST",
        body: JSON.stringify({
          fid: user?.fid,
          cursor,
          limit,
        }),
        signal: abortController.signal,
      });
      const data: ApiResponse = await response.json();
      return data;
    },
    []
  );

  const createRow = useCallback((videos: Video[], length: number) => {
    return Array(length)
      .fill(null)
      .map((_, i) => (i < videos.length ? videos[i] : null));
  }, []);

  const loadMoreVideos = useCallback(
    async (direction: "north" | "south" | "east" | "west") => {
      if (loading || !nextCursor) return;
  
      setLoading(true);
      try {
        const data = await fetchVideos(nextCursor);
        console.log('Fetched videos:', data.data.length); // Debug log
  
        startTransition(() => {
          setVideoGrid((prevGrid) => {
            const newGrid = [...prevGrid.map((row) => [...row])];
            
            // Always create 5 rows, even if some are empty
            const newRows = Array(5).fill(null).map((_, i) => {
              const startIndex = i * 5;
              const rowVideos = data.data.slice(startIndex, startIndex + 5);
              return createRow(rowVideos, 5); // This will fill with null for missing videos
            });
  
            console.log('Created new rows:', newRows.length); // Debug log
  
            switch (direction) {
              case "north":
              case "south": {
                // Add all 5 rows, even if some are empty
                return direction === "north"
                  ? [...newRows, ...newGrid]
                  : [...newGrid, ...newRows];
              }
  
              case "west":
              case "east": {
                // Ensure we're modifying 5 rows
                for (let i = 0; i < 5; i++) {
                  if (i < newGrid.length) { // Only if the row exists
                    const newRow = newRows[i];
                    if (direction === "west") {
                      newGrid[i].unshift(...newRow);
                    } else {
                      newGrid[i].push(...newRow);
                    }
                  }
                }
                return newGrid;
              }
            }
            return newGrid;
          });
  
          setNextCursor(data.nextCursor);
        });
      } finally {
        setLoading(false);
      }
    },
    [loading, nextCursor, fetchVideos, createRow]
  );

  const handleScroll = useMemo(
    () =>
      debounce(async (e: React.UIEvent<HTMLDivElement>) => {
        if (loading || !nextCursor) return;

        const container = containerRef.current;
        if (!container) return;

        const {
          scrollLeft,
          scrollTop,
          scrollWidth,
          scrollHeight,
          clientWidth,
          clientHeight,
        } = container;

        const threshold = 200;

        requestAnimationFrame(async () => {
          if (scrollLeft < threshold) {
            await loadMoreVideos("west");
            container.scrollLeft += 200;
          }
          if (scrollWidth - (scrollLeft + clientWidth) < threshold) {
            await loadMoreVideos("east");
          }
          if (scrollTop < threshold) {
            await loadMoreVideos("north");
            container.scrollTop += 200;
          }
          if (scrollHeight - (scrollTop + clientHeight) < threshold) {
            await loadMoreVideos("south");
          }
        });
      }, 150),
    [loading, nextCursor, loadMoreVideos]
  );

  useEffect(() => {
    const initializeGrid = async () => {
      setLoading(true);
      try {
        // Fetch 100 images initially
        const data = await fetchVideos(null, 100);

        // Create a 10x10 grid from initial 100 images
        const initialGrid = [];
        for (let i = 0; i < 10; i++) {
          const startIndex = i * 10;
          const rowImages = data.data.slice(startIndex, startIndex + 10);
          initialGrid.push(createRow(rowImages, 10)); // 10 images per row
        }

        setVideoGrid(initialGrid);
        setNextCursor(data.nextCursor);
      } finally {
        setLoading(false);
      }
    };

    initializeGrid();
  }, [fetchVideos, createRow]);

  useEffect(() => {
    return () => {
      videoCache.current.clear();
    };
  }, []);

  useEffect(() => {
    return () => {
      handleScroll.cancel();
    };
  }, [handleScroll]);

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalHeight = rowVirtualizer.getTotalSize();

  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;

  return (
    <div className="fixed w-[100vw] top-0 left-0 h-screen bg-white">
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-auto"
        onScroll={handleScroll}
        style={{ scrollbarWidth: "none" }}
      >
        {loading && videoGrid[0].length === 0 ? (
          // Show loading grid only during initial load
          <LoadingGrid rows={10} columns={10} />
        ) : (
          <div
            className="inline-block min-w-full min-h-full"
            style={{
              height: `${totalHeight}px`,
              width: "100%",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${paddingTop}px)`,
              }}
            >
              {virtualRows.map((virtualRow) => {
                const row = videoGrid[virtualRow.index];
                return (
                  <GridRow
                    key={virtualRow.index}
                    row={row}
                    rowIndex={virtualRow.index}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(VideoCanvas);
