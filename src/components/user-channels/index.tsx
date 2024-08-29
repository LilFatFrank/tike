"use client";
import { useNeynarContext } from "@neynar/react";
import { FC, useContext, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "react-query";
import Spinner from "../spinner";
import { AppContext } from "@/context";
import { SET_USER_CHANNELS } from "@/context/actions";
import { useRouter } from "next/navigation";

interface ApiResponse {
  channels: any;
  next: { cursor: string };
}

const fetchChannels = async ({
  pageParam = "",
  queryKey,
}: {
  pageParam?: string;
  queryKey: any;
}): Promise<ApiResponse> => {
  const [_key, { fid }] = queryKey;
  const response = await fetch(`/api/user-channels`, {
    method: "POST",
    body: JSON.stringify({ cursor: pageParam, fid }),
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  return data;
};

const UserChannels: FC = () => {
  const { user } = useNeynarContext();
  const [state, dispatch] = useContext(AppContext);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(
      ["user-channels", { fid: user?.fid || 3 }],
      fetchChannels,
      {
        getNextPageParam: (lastPage) => {
          return lastPage.next?.cursor ?? false;
        },
        refetchOnWindowFocus: false,
      }
    );

  const { ref, inView } = useInView({
    threshold: 0.3,
  });

  const router = useRouter();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  useEffect(() => {
    dispatch({
      type: SET_USER_CHANNELS,
      payload: data?.pages.flatMap((page) => page.channels) ?? [],
    });
  }, [data]);

  return (
    <div className="pt-[10px] pb-[20px] pl-[16px] flex items-center justify-start gap-4 overflow-x-auto whitespace-nowrap no-scrollbar">
      {state.userChannels.map((channel) => (
        <span
          onClick={() => router.push(`/channel/${channel.id}`)}
          className="flex-shrink-0 cursor-pointer"
          key={`${channel.id}`}
        >
          <div
            className="flex flex-col items-center justify-center gap-1 cursor-pointer"
            key={channel.id}
          >
            <div className="w-[60px] h-[60px] rounded-[16px] border border-black-20 bg-frame-btn-bg">
              <img
                src={channel.image_url}
                alt={channel.name}
                className="w-full h-full rounded-[16px] object-cover"
              />
            </div>
            <p className="text-[11px] font-normal w-[9ch] text-center text-ellipsis overflow-hidden whitespace-nowrap">
              {channel.name}
            </p>
          </div>
        </span>
      ))}

      {isFetchingNextPage ? (
        <div className="p-2">
          <Spinner />
        </div>
      ) : null}

      <div ref={ref} style={{ width: "20px", height: "20px" }}></div>
    </div>
  );
};

export default UserChannels;
