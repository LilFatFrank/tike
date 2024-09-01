"use client";
import { Spinner } from "@/components";
import { useNeynarContext } from "@neynar/react";
import { useRouter } from "next/navigation";
import { FC, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "react-query";

interface ApiResponse {
  users: any;
  next: { cursor: string };
}

const fetchSearchUsers = async ({
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
};

interface SearchUsers {
  input: string;
}

const SearchUsers: FC<SearchUsers> = ({ input }) => {
  const { user } = useNeynarContext();
  const router = useRouter();

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
    }
  );

  const { ref, inView } = useInView({
    threshold: 0.3,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const allUsers = data?.pages.flatMap((page) => page.users) ?? [];

  if (isLoading) {
    return (
      <div className="p-2 flex items-start justify-center h-full bg-white">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return null;
  }

  return (
    <div className="flex-1">
      {allUsers.map((user, index, arr) => (
        <span onClick={() => router.push(`/profile/${user.fid}`)} className="cursor-pointer" key={`${user.fid}`}>
          <div className="w-full px-[16px] py-[20px] flex items-center justify-start gap-[10px]">
            <img
              className="w-[40px] h-[40px] rounded-[20px] object-cover"
              src={user.pfp_url}
              alt={user.username}
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
          {index === arr.length - 1 ? null : (
            <hr className="border border-t-divider" key={`${user.username}`} />
          )}
        </span>
      ))}

      {isFetchingNextPage ? (
        <div className="p-2">
          <Spinner />
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
};

export default SearchUsers;
