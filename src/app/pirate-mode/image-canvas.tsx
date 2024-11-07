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

interface Image {
  url: string;
  hash: string;
}

interface ApiResponse {
  data: Image[];
  nextCursor: string | null;
}

const ImageCell = memo(({ image }: { image: Image | null }) => {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  if (!image)
    return (
      <div className="max-md:w-40 max-md:h-40 w-[300px] h-[300px] bg-gray-200 rounded-lg flex-shrink-0" />
    );

  return (
    <div
      className="max-md:w-40 max-md:h-40 w-[300px] h-[300px] bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
      onClick={() => router.push(`/cast/${image.hash}`)}
    >
      <img
        src={image.url}
        alt={`Image ${image.hash}`}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        decoding="async"
      />
    </div>
  );
});

ImageCell.displayName = "ImageCell";

const GridRow = memo(
  ({ row, rowIndex }: { row: (Image | null)[]; rowIndex: number }) => (
    <div className="flex gap-4 mb-4">
      {row.map((image, colIndex) => (
        <ImageCell
          key={image?.url || `${rowIndex}-${colIndex}`}
          image={image}
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

LoadingGrid.displayName = "LoadingGrid";

const ImageCanvas = () => {
  const { user } = useNeynarContext();
  const [imageGrid, setImageGrid] = useState<(Image | null)[][]>([[]]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();

  const imageCache = useRef(new Map<string, string>());

  const rowVirtualizer = useVirtualizer({
    count: imageGrid.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 200,
    overscan: 5,
  });

  const fetchImages = useCallback(
    async (cursor: string | null, limit: number | null = 25) => {
      const abortController = new AbortController();
      const response = await fetch(`/api/images`, {
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
  
  // Helper function to create a row
  const createRow = useCallback((images: Image[], length: number) => {
    // Always return an array of specified length, filled with null for missing images
    return Array(length).fill(null).map((_, i) => 
      i < images.length ? images[i] : null
    );
  }, []);

  const loadMoreImages = useCallback(
    async (direction: "north" | "south" | "east" | "west") => {
      if (loading || !nextCursor) return;
  
      setLoading(true);
      try {
        const data = await fetchImages(nextCursor);
  
        startTransition(() => {
          setImageGrid((prevGrid) => {
            const newGrid = [...prevGrid.map((row) => [...row])];
            
            // Always create 5 rows, even if some are empty
            const newRows = Array(5).fill(null).map((_, i) => {
              const startIndex = i * 5;
              const rowImages = data.data.slice(startIndex, startIndex + 5);
              return createRow(rowImages, 5); // This will fill with null for missing images
            });
  
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
    [loading, nextCursor, fetchImages, createRow]
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
            await loadMoreImages("west");
            container.scrollLeft += 200;
          }
          if (scrollWidth - (scrollLeft + clientWidth) < threshold) {
            await loadMoreImages("east");
          }
          if (scrollTop < threshold) {
            await loadMoreImages("north");
            container.scrollTop += 200;
          }
          if (scrollHeight - (scrollTop + clientHeight) < threshold) {
            await loadMoreImages("south");
          }
        });
      }, 150),
    [loading, nextCursor, loadMoreImages]
  );

  useEffect(() => {
    const initializeGrid = async () => {
      setLoading(true);
      try {
        // Fetch 100 images initially
        const data = await fetchImages(null, 100);

        // Create a 10x10 grid from initial 100 images
        const initialGrid = [];
        for (let i = 0; i < 10; i++) {
          const startIndex = i * 10;
          const rowImages = data.data.slice(startIndex, startIndex + 10);
          initialGrid.push(createRow(rowImages, 10)); // 10 images per row
        }

        setImageGrid(initialGrid);
        setNextCursor(data.nextCursor);
      } finally {
        setLoading(false);
      }
    };

    initializeGrid();
  }, [fetchImages, createRow]);

  useEffect(() => {
    return () => {
      imageCache.current.clear();
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
        {loading && imageGrid[0].length === 0 ? (
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
                const row = imageGrid[virtualRow.index];
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

export default memo(ImageCanvas);
