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
    return <div className="max-md:w-32 max-md:h-32 w-48 h-48 bg-gray-200 rounded-lg flex-shrink-0" />;

  return (
    <div
      className="max-md:w-32 max-md:h-32 w-48 h-48 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
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

  const fetchImages = useCallback(async (cursor: string | null, limit: number | null = 25) => {
    const abortController = new AbortController();
    const response = await fetch(`/api/images`, {
      method: "POST",
      body: JSON.stringify({
        fid: user?.fid,
        cursor,
        limit
      }),
      signal: abortController.signal,
    });
    const data: ApiResponse = await response.json();
    return data;
  }, []);

  const createRow = useCallback((images: Image[], length: number) => {
    return Array(length)
      .fill(null)
      .map((_, i) => (i < images.length ? images[i] : null));
  }, []);

  const loadMoreImages = useCallback(
    async (direction: "north" | "south" | "east" | "west") => {
      if (loading || !nextCursor) return;

      setLoading(true);
      try {
        const data = await fetchImages(nextCursor);
        const rows = Math.ceil(data.data.length / 5);

        startTransition(() => {
          setImageGrid((prevGrid) => {
            const newGrid = [...prevGrid.map((row) => [...row])];

            switch (direction) {
              case "north":
              case "south": {
                // Create multiple rows from the new data
                const newRows = [];
                for (let i = 0; i < rows; i++) {
                  const startIndex = i * 5;
                  const rowImages = data.data.slice(startIndex, startIndex + 5);
                  newRows.push(createRow(rowImages, 5));
                }

                // Add rows to the appropriate end
                return direction === "north"
                  ? [...newRows, ...newGrid]
                  : [...newGrid, ...newRows];
              }
              case "west":
              case "east": {
                // Create multiple rows from the new data
                const newRows: any = [];
                for (let i = 0; i < rows; i++) {
                  const startIndex = i * 5;
                  const rowImages = data.data.slice(startIndex, startIndex + 5);
                  newRows.push(createRow(rowImages, 5));
                }

                // Add columns to existing rows
                newGrid.forEach((row, i) => {
                  const newRowIndex = i % newRows.length;
                  const newRow = newRows[newRowIndex];
                  if (direction === "west") {
                    row.unshift(...newRow);
                  } else {
                    row.push(...newRow);
                  }
                });
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
      </div>
    </div>
  );
};

export default memo(ImageCanvas);