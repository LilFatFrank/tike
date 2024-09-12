"use client";
import { useNeynarContext } from "@neynar/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FC, memo, useCallback, useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "react-query";

const UserItem = memo(({ user, router, isLast }: { user: any; router: any; isLast: boolean }) => (
  <span
    onClick={() => router.push(`/profile/${user.fid}`)}
    className="cursor-pointer"
  >
    <div className="w-full px-[16px] py-[20px] flex items-center justify-start gap-[10px]">
      <Image
        className="w-[40px] h-[40px] rounded-[20px] object-cover"
        src={user.pfp_url}
        alt={user.username}
        width={40}
        height={40}
        loading="lazy"
        style={{ aspectRatio: "1 / 1" }}
      />
      <div className="flex flex-col items-start gap-[2px]">
        <p className="font-bold text-[18px] leading-auto">
          {user.display_name}&nbsp;
        </p>
        <p className="font-normal text-[12px] leading-auto text-gray-text-1">
          @{user.username}
        </p>
      </div>
    </div>
    {!isLast && <hr className="border border-t-divider" />}
  </span>
));

interface ApiResponse {
  users: any;
  next: { cursor: string };
}

interface SearchUsers {
  input: string;
}

const SearchUsers: FC<SearchUsers> = memo(({ input }) => {
  const { user } = useNeynarContext();
  const router = useRouter();

  const fetchSearchUsers = useCallback(async ({
    pageParam = "",
    queryKey,
  }: {
    pageParam?: string;
    queryKey: any;
  }): Promise<ApiResponse> => {
    const [_key, { viewerFid, q }] = queryKey;
    const response = await fetch(`/api/search-users`, {
      method: "POST",
      body: JSON.stringify({ cursor: pageParam, viewerFid, q }),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
      return data;
    },
    []
  );

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    ["search-users", { viewerFid: user?.fid || 3, q: input }],
    fetchSearchUsers,
    {
      getNextPageParam: (lastPage) => {
        return lastPage.next?.cursor ?? false;
      },
      refetchOnWindowFocus: false,
      enabled: !!input,
      staleTime: 60000,
      cacheTime: 3600000,
    }
  );

  const { ref, inView } = useInView({
    threshold: 0.3,
  });

  const handleFetchNextPage = useCallback(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);
  
  useEffect(() => {
    handleFetchNextPage();
  }, [handleFetchNextPage]);

  const allUsers = useMemo(() => 
    data?.pages.flatMap((page) => page.users) ?? [],
    [data]
  );

  if (isLoading) {
    return (
      <div className="p-2 flex flex-col items-start justify-start gap-2 h-full bg-white">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            className="animate-pulse w-full h-[80px] rounded-lg bg-divider"
            key={index}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return null;
  }

  return (
    <div className="flex-1">
      {allUsers.map((user, index, arr) => (
        <UserItem
          key={user.fid}
          user={user}
          router={router}
          isLast={index === arr.length - 1}
        />
      ))}

      {isFetchingNextPage ? (
        <div className="flex flex-col items-start justify-start gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              className="animate-pulse w-full h-[80px] rounded-lg bg-divider"
              key={index}
            />
          ))}
        </div>
      ) : null}

      <div ref={ref} style={{ height: "80px" }}></div>

      {allUsers && allUsers.length && !hasNextPage ? (
        <p className="w-full items-center justify-center py-2 text-center">
          End of the line!
        </p>
      ) : null}
    </div>
  );
});

export default SearchUsers;
