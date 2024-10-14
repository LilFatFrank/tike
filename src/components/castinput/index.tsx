"use client";
import {
  useState,
  useEffect,
  ChangeEvent,
  FC,
  ClipboardEvent as ReactClipboardEvent,
  useContext,
  memo,
  useCallback,
  useMemo,
} from "react";
import { AiOutlineClose } from "react-icons/ai";
import axios from "axios";
import Modal from "../modal";
import { useNeynarContext } from "@neynar/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppContext } from "@/context";
import formatTime from "@/utils/formatTime";
import { creatorZoraClient } from "../zora-client";
import {
  useAccount,
  useChainId,
  useConnect,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { base } from "viem/chains";
import { coinbaseWallet } from "wagmi/connectors";
import { parseEther } from "viem";
import { useInfiniteQuery } from "react-query";
import { Virtuoso } from "react-virtuoso";
import { useIsMobile } from "@/hooks/useIsMobile";

const MINT_DURATION = [
  {
    label: "1 Hour",
    value: 60 * 60,
  },
  {
    label: "4 Hours",
    value: 4 * 60 * 60,
  },
  {
    label: "24 Hours",
    value: 24 * 60 * 60,
  },
  {
    label: "3 Days",
    value: 3 * 24 * 60 * 60,
  },
  {
    label: "1 Week",
    value: 7 * 24 * 60 * 60,
  },
  {
    label: "1 Month",
    value: 30 * 24 * 60 * 60,
  },
  {
    label: "3 Months",
    value: 90 * 24 * 60 * 60,
  },
  {
    label: "Open",
    value: 0,
  },
];

interface Media {
  type: "image" | "video" | "audio";
  url: string;
  file: File;
}

const CastInput: FC = memo(() => {
  const [state] = useContext(AppContext);
  const [text, setText] = useState("");
  const [media, setMedia] = useState<Media | null>(null);
  const [audioThumbnailMedia, setAudioThumbnailMedia] = useState<{
    url: string;
    file: File;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [openChannelModal, setOpenChannelModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState("");
  const [openMusicUploadModal, setOpenMusicUploadModal] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentAudioTime, setCurrentAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [musicTitle, setMusicTitle] = useState("");
  const [openMintModal, setOpenMintModal] = useState(false);
  const [mintThumbnail, setMintThumbnail] = useState<{
    url: string;
    file: File;
  } | null>(null);
  const [mintTitle, setMintTitle] = useState("");
  const [mintDescription, setMintDescription] = useState("");
  const [mintPrice, setMintPrice] = useState("");
  const [openCountdownModal, setOpenCountdownModal] = useState(false);
  const [marketCountdown, setMarketCountdown] = useState<{
    label: string;
    value: number;
  }>({
    label: "Open",
    value: 0,
  });

  const { user } = useNeynarContext();
  const router = useRouter();
  const { writeContractAsync } = useWriteContract();
  const { address, isConnected } = useAccount();
  const chain = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { connect } = useConnect();

  const handleMediaChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      let type: "video" | "audio" | "image" = "image";
      if (file.type.startsWith("image")) {
        setMintThumbnail({
          url,
          file,
        });
      }
      if (file.type.startsWith("video")) {
        type = "video";
      } else if (file.type.startsWith("audio")) {
        type = "audio";
        setOpenMusicUploadModal(true);
      }
      setMedia({ type, url, file });
    }
  }, []);

  const handleAudioThumbnailMedia = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        setAudioThumbnailMedia({
          url: URL.createObjectURL(files[0]),
          file: files[0],
        });
      }
    },
    []
  );

  const handleMintThumbnail = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        setMintThumbnail({
          url: URL.createObjectURL(files[0]),
          file: files[0],
        });
      }
    },
    []
  );

  const handlePaste = useCallback(
    (e: ReactClipboardEvent) => {
      if (media) return;

      const items = e.clipboardData?.items;
      if (items) {
        const newMedia = Array.from(items)
          .map((item) => {
            if (
              item.type.startsWith("image") ||
              item.type.startsWith("video")
            ) {
              const file = item.getAsFile();
              if (file) {
                const url = URL.createObjectURL(file);
                let type: "video" | "audio" | "image" = "image";
                if (file.type.startsWith("video")) {
                  type = "video";
                } else if (file.type.startsWith("audio")) {
                  type = "audio";
                }
                return { type, url, file };
              }
            }
            return null;
          })
          .filter(Boolean) as Media[];

        if (newMedia.length > 0) {
          setMedia(newMedia[0]);
        }

        // Check for text content
        const textItem = Array.from(items).find(
          (item) => item.kind === "string" && item.type === "text/plain"
        );
        if (textItem) {
          textItem.getAsString((pastedText) => {
            setText((prevText) => prevText + pastedText);
          });
        }
      }
    },
    [media]
  );

  const removeMedia = useCallback(() => {
    setMedia(null);
    setMintThumbnail(null);
  }, []);

  const checkUser = useCallback(async () => {
    try {
      const res = await fetch(`/api/check-collection?fid=${user?.fid}`);
      const data = await res.json();
      return data;
    } catch (error) {
      console.log("Error checking user", error);
      throw error;
    }
  }, [user?.fid, address]);

  const buildContractMetadata = useCallback(async () => {
    try {
      const metadata = {
        name: `${user?.username}'s Tike Posts`,
        description: `Visit ${user?.username}'s Tike Posts here - https://app.tike.social/profile/${user?.fid}`,
        image: user?.pfp_url,
      };
      const metadataUri = await handleJsonUploadToPinata(metadata);
      return metadataUri;
    } catch (error) {
      console.log("Error building contract metadata", error);
      toast.error("Error uploading metadata");
      throw error;
    }
  }, [user?.pfp_url]);

  const buildTokenMetadata = useCallback(async () => {
    try {
      let mediaUrl = "";
      let thumbnailUrl = "";
      if (media) mediaUrl = await handleUploadToPinata(media?.file);
      if (mintThumbnail)
        thumbnailUrl = await handleUploadToPinata(mintThumbnail?.file);
      const metadata = {
        name: mintTitle,
        description: mintDescription,
        image: thumbnailUrl,
        external_link: `https://app.tike.social/profile/${user?.fid}`,
        animation_url: mediaUrl,
      };
      const metadataUri = await handleJsonUploadToPinata(metadata);
      return metadataUri;
    } catch (error) {
      console.log("Error building token metadata", error);
      toast.error("Error uploading metadata");
      throw error;
    }
  }, [user?.pfp_url, media, mintThumbnail, mintTitle, mintDescription]);

  const handleJsonUploadToPinata = useCallback(async (json: object) => {
    try {
      const data = JSON.stringify({
        pinataContent: json,
        pinataMetadata: {
          name: "metadata.json",
        },
      });
      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT_KEY}`,
          },
        }
      );

      return `${process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL}/ipfs/${response.data.IpfsHash}`;
    } catch (error) {
      console.log("Error uploading to pinata", error);
      toast.error("Error uploading metadata");
      throw error;
    }
  }, []);

  const handleMint = useCallback(async () => {
    try {
      if (chain !== base.id) {
        await switchChainAsync({
          chainId: base.id,
        });
      }
      setIsUploading(true);
      const toastId = toast.info("Checking collection", {
        duration: 0,
      });
      const userInfo = await checkUser();
      if (!userInfo.error && !userInfo.exists) {
        toast.info("Creating metadata", {
          id: toastId,
          duration: 0,
        });
        const contractMetadataUri = await buildContractMetadata();
        const metadataUri = await buildTokenMetadata();
        toast.info("Creating contract", {
          id: toastId,
          duration: 0,
        });
        const { parameters, contractAddress, newTokenId } =
          await creatorZoraClient.create1155({
            contract: {
              name: `${user?.username}'s Tike Posts`,
              uri: contractMetadataUri,
            },
            token: {
              tokenMetadataURI: metadataUri,
              salesConfig: {
                ...(mintPrice ? { pricePerToken: parseEther(mintPrice) } : {}),
                ...(marketCountdown.value !== 0
                  ? {
                      type: "timed",
                      marketCountdown: BigInt(marketCountdown.value),
                    }
                  : {}),
              },
            },
            account: address as `0x${string}`,
          });
        await writeContractAsync(parameters);
        await fetch(`/api/add-collection`, {
          method: "POST",
          body: JSON.stringify({
            username: user?.username,
            fid: user?.fid,
            collection: {
              [address as `0x${string}`]: contractAddress,
            },
          }),
        });
        toast.info("Creating frame", {
          id: toastId,
          duration: 0,
        });
        await axios.post(
          "/api/create",
          {
            uuid: user?.signer_uuid,
            channelId: selectedChannel,
            text: text || mintTitle,
            fileUrl: `https://zora.co/collect/base:${contractAddress.toLowerCase()}/${newTokenId.toString()}`,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        toast.success("Successfully uploaded", {
          id: toastId,
          duration: 1500,
        });
        router.push(`/profile/${user?.fid}`);
      } else if (!userInfo.error && userInfo.exists) {
        if (
          userInfo.user &&
          userInfo.user.collection &&
          userInfo.user.collection[address as `0x${string}`]
        ) {
          toast.info("Creating metadata", {
            id: toastId,
            duration: 0,
          });
          const metadataUri = await buildTokenMetadata();
          toast.info("Creating token", {
            id: toastId,
            duration: 0,
          });
          const { parameters, newTokenId } =
            await creatorZoraClient.create1155OnExistingContract({
              contractAddress:
                userInfo.user.collection[address as `0x${string}`],
              token: {
                tokenMetadataURI: metadataUri,
                salesConfig: {
                  ...(mintPrice
                    ? { pricePerToken: parseEther(mintPrice) }
                    : {}),
                  ...(marketCountdown.value !== 0
                    ? {
                        type: "timed",
                        marketCountdown: BigInt(marketCountdown.value),
                      }
                    : {}),
                },
              },
              account: address as `0x${string}`,
            });
          await writeContractAsync(parameters);
          toast.info("Creating frame", {
            id: toastId,
            duration: 0,
          });
          await axios.post(
            "/api/create",
            {
              uuid: user?.signer_uuid,
              channelId: selectedChannel,
              text: text || mintTitle,
              fileUrl: `https://zora.co/collect/base:${userInfo.user.collection[
                address as `0x${string}`
              ].toLowerCase()}/${newTokenId.toString()}`,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          toast.info("Successfully uploaded", {
            id: toastId,
            duration: 1500,
          });
          router.push(`/profile/${user?.fid}`);
        } else if (
          userInfo.user &&
          userInfo.user.collection &&
          !userInfo.user.collection[address as `0x${string}`]
        ) {
          toast.info("Creating metadata", {
            id: toastId,
            duration: 0,
          });
          const contractMetadataUri = await buildContractMetadata();
          const metadataUri = await buildTokenMetadata();
          toast.info("Creating contract", {
            id: toastId,
            duration: 0,
          });
          const { parameters, contractAddress, newTokenId } =
            await creatorZoraClient.create1155({
              contract: {
                name: `${user?.username}'s Tike Posts`,
                uri: contractMetadataUri,
              },
              token: {
                tokenMetadataURI: metadataUri,
                salesConfig: {
                  ...(mintPrice
                    ? { pricePerToken: parseEther(mintPrice) }
                    : {}),
                  ...(marketCountdown.value !== 0
                    ? {
                        type: "timed",
                        marketCountdown: BigInt(marketCountdown.value),
                      }
                    : {}),
                },
              },
              account: address as `0x${string}`,
            });
          await writeContractAsync(parameters);
          await fetch(`/api/update-collection`, {
            method: "PUT",
            body: JSON.stringify({
              ...userInfo.user,
              collection: {
                ...userInfo.user.collection,
                [address as `0x${string}`]: contractAddress,
              },
            }),
          });
          toast.info("Creating frame", {
            id: toastId,
            duration: 0,
          });
          await axios.post(
            "/api/create",
            {
              uuid: user?.signer_uuid,
              channelId: selectedChannel,
              text: text || mintTitle,
              fileUrl: `https://zora.co/collect/base:${contractAddress.toLowerCase()}/${newTokenId.toString()}`,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          toast.info("Successfully uploaded", {
            id: toastId,
            duration: 1500,
          });
          router.push(`/profile/${user?.fid}`);
        } else {
          console.log("user info error");
          toast.error("Error uploading art to Zora");
        }
      } else {
        console.log("check-collection error");
        toast.error("Error uploading art to Zora");
      }
    } catch (error) {
      console.log("Error adding to zora", error);
      toast.error("Error uploading art to Zora");
      return;
    } finally {
      setIsUploading(false);
    }
  }, [
    address,
    mintDescription,
    mintTitle,
    user,
    chain,
    mintThumbnail,
    mintPrice,
    marketCountdown,
  ]);

  const handleUploadToPinata = useCallback(async (file: File) => {
    try {
      const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pinataOptions", '{"cidVersion": 1}');
      formData.append("pinataMetadata", `{"name": "${file.name}"}`);

      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT_KEY}`,
        },
      });

      return `${process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL}/ipfs/${response.data.IpfsHash}`;
    } catch (error) {
      console.log("Error uploading to pinata", error);
      toast.error("Error uploading media");
      throw error;
    }
  }, []);

  const handlePost = useCallback(async () => {
    setIsUploading(true);

    try {
      if (media) {
        const fileUrl = await handleUploadToPinata(media.file);
        let thumbnailUrl: string | null = null;
        if (audioThumbnailMedia) {
          thumbnailUrl = await handleUploadToPinata(audioThumbnailMedia.file);
        }

        if (fileUrl) {
          const response = await axios.post(
            "/api/create",
            {
              uuid: user?.signer_uuid,
              channelId: selectedChannel,
              text: media.type === "audio" ? musicTitle : text,
              fileUrl,
              thumbnailUrl,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (response.data.success) router.push("/profile");
        } else {
          toast.error("Error uploading media");
        }
      }
    } catch (error) {
      console.error("Error uploading media", error);
      toast.error("Error uploading media");
    } finally {
      setIsUploading(false);
      setText("");
      setMedia(null);
      setSelectedChannel("");
    }
  }, [media, selectedChannel, musicTitle, user?.signer_uuid, router, text]);

  const fetchUserMemberChannels = useCallback(
    async ({
      pageParam = "",
      queryKey,
    }: {
      pageParam?: string;
      queryKey: any;
    }): Promise<{
      channels: any;
      next: { cursor: string };
    }> => {
      const [_key, { fid }] = queryKey;
      const response = await fetch(`/api/user-member-channels`, {
        method: "POST",
        body: JSON.stringify({ cursor: pageParam, fid }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return await response.json();
    },
    []
  );

  const {
    data: allChannels,
    fetchNextPage: fetchNextUserChannels,
    hasNextPage: hasNextUserChannels,
    isFetchingNextPage: isFetchingNextUserChannels,
  } = useInfiniteQuery(
    ["user-channels", { fid: user?.fid || 3 }],
    fetchUserMemberChannels,
    {
      getNextPageParam: (lastPage) => lastPage.next?.cursor ?? false,
      refetchOnWindowFocus: false,
      staleTime: 60000,
      cacheTime: 3600000,
    }
  );

  const allUserMemberChannels = useMemo(
    () => allChannels?.pages.flatMap((page) => page.channels) ?? [],
    [allChannels]
  );

  const handleFetchNextPage = useCallback(() => {
    if (hasNextUserChannels && !isFetchingNextUserChannels) {
      fetchNextUserChannels();
    }
  }, [hasNextUserChannels, fetchNextUserChannels, isFetchingNextUserChannels]);

  const renderLoadingMore = () =>
    useCallback(
      () => (
        <div className="w-full">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse w-full h-[50px] bg-divider rounded-lg mb-2"
            />
          ))}
        </div>
      ),
      []
    );

  const togglePlayPause = useCallback(() => {
    const audio = document.getElementById("audio-element") as HTMLAudioElement;
    if (audio.paused) {
      audio.play();
      setIsAudioPlaying(true);
    } else {
      audio.pause();
      setIsAudioPlaying(false);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const audio = document.getElementById("audio-element") as HTMLAudioElement;
    setCurrentAudioTime(audio.currentTime);
    setAudioDuration(audio.duration);
  }, []);

  const handleSeek = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const audio = document.getElementById("audio-element") as HTMLAudioElement;
    audio.currentTime = parseFloat(e.target.value);
    setCurrentAudioTime(audio.currentTime);

    const min = parseFloat(e.target.min);
    const max = parseFloat(e.target.max);
    const value = ((parseFloat(e.target.value) - min) / (max - min)) * 100;
    e.target.style.background = `linear-gradient(to right, white ${value}%, #3D7F41 ${value}%)`;
  }, []);

  useEffect(() => {
    const handlePasteEvent = (e: ClipboardEvent) =>
      handlePaste(e as unknown as ReactClipboardEvent);
    document.addEventListener("paste", handlePasteEvent);
    return () => {
      document.removeEventListener("paste", handlePasteEvent);
    };
  }, [handlePaste]);

  const isMobile = useIsMobile();

  const isPostDisabled = useMemo(
    () => !media || isUploading,
    [media, isUploading]
  );

  const audioProgressWidth = useMemo(
    () =>
      audioDuration ? Math.floor((currentAudioTime / audioDuration) * 100) : 0,
    [currentAudioTime, audioDuration]
  );

  return (
    <>
      <div className="bg-[#F0EEEF] w-dvw md:w-auto md:min-h-full min-h-dvh h-auto flex flex-col">
        <div className="grow p-2 bg-white rounded-[20px] shadow-cast-upload">
          <div className="w-full flex items-center justify-between mb-[40px]">
            <button
              className="border-none outline-none rounded-[18px] px-2 py-1 bg-frame-btn-bg"
              onClick={() => router.back()}
            >
              <img
                src="/icons/close-upload-view-icon.svg"
                alt="close"
                className="w-8 h-8"
                width={32}
                height={32}
                loading="lazy"
                style={{ aspectRatio: "1 / 1" }}
              />
            </button>
            <button
              className="border-none outline-none rounded-[22px] px-4 py-2 bg-black text-white leading-[120%] font-medium disabled:bg-black-40 disabled:text-black-50"
              disabled={isPostDisabled}
              onClick={handlePost}
            >
              {isUploading ? "Uploading..." : "Post"}
            </button>
          </div>
          <div className={`flex items-center justify-start gap-2 mb-[12px]`}>
            <img
              src={user?.pfp_url ?? ""}
              alt={user?.display_name ?? ""}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              width={40}
              height={40}
              loading="lazy"
              style={{ aspectRatio: "1 / 1" }}
            />
            <div>
              <p className="font-[800] text-black text-[18px] leading-[21.6px]">
                {user?.display_name}
              </p>
              <div
                className="flex items-center gap-[2px] cursor-pointer"
                onClick={() => setOpenChannelModal(true)}
              >
                <span className="text-purple font-bold text-[14px] leading-[120%]">
                  {selectedChannel ? `/${selectedChannel}` : "Select Channel"}
                </span>
                <img
                  src="/icons/channel-chevron-down-icon.svg"
                  alt="channel-down"
                  className="w-[14px] h-[14px]"
                  width={14}
                  height={14}
                  loading="lazy"
                  style={{ aspectRatio: "1 / 1" }}
                />
              </div>
            </div>
          </div>
          <textarea
            className="w-full outline-none resize-none placeholder:text-black-40"
            placeholder="What's happening?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
          />
          <div className="flex flex-wrap gap-2 mt-1 w-full">
            {media && media.type !== "audio" ? (
              <div className="flex flex-wrap gap-2 mt-2 w-full">
                <div key={media.url} className="relative w-full">
                  {media.type === "image" ? (
                    <img
                      src={media.url}
                      alt="media"
                      className="w-full object-cover rounded-lg"
                      loading="lazy"
                    />
                  ) : media.type === "video" ? (
                    <video
                      src={media.url}
                      controls
                      className="w-full object-cover rounded-lg"
                    />
                  ) : null}
                  <button
                    className="absolute top-1 right-1 bg-black text-white rounded-full p-1"
                    onClick={removeMedia}
                  >
                    <AiOutlineClose />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div className="pt-1 pb-6 px-2 flex items-center justify-between">
          <div className="flex items-center justify-center gap-1">
            <label
              className={`cursor-pointer ${
                isUploading || media ? "cursor-not-allowed opacity-[0.4]" : ""
              }`}
            >
              <div className="py-1 px-2 rounded-[18px] bg-[#DDDBDC]">
                <img
                  src="/icons/image-upload-icon.svg"
                  alt="image"
                  className="w-8 h-8"
                  width={32}
                  height={32}
                  loading="lazy"
                  style={{ aspectRatio: "1 / 1" }}
                />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={
                    isUploading || media
                      ? undefined
                      : (e) => handleMediaChange(e)
                  }
                />
              </div>
            </label>
            <label
              className={`cursor-pointer ${
                isUploading || media ? "cursor-not-allowed opacity-[0.4]" : ""
              }`}
            >
              <div className="py-1 px-2 rounded-[18px] bg-[#DDDBDC]">
                <img
                  src="/icons/video-upload-icon.svg"
                  alt="video"
                  className="w-8 h-8"
                  width={32}
                  height={32}
                  loading="lazy"
                  style={{ aspectRatio: "1 / 1" }}
                />
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  className="hidden"
                  onChange={
                    isUploading || media
                      ? undefined
                      : (e) => handleMediaChange(e)
                  }
                />
              </div>
            </label>
            <label
              className={`cursor-pointer ${
                isUploading || media ? "cursor-not-allowed opacity-[0.4]" : ""
              }`}
            >
              <div className="py-1 px-2 rounded-[18px] bg-[#DDDBDC]">
                <img
                  src="/icons/music-upload-icon.svg"
                  alt="music"
                  className="w-8 h-8"
                  width={32}
                  height={32}
                  loading="lazy"
                  style={{ aspectRatio: "1 / 1" }}
                />
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={
                    isUploading || media
                      ? undefined
                      : (e) => handleMediaChange(e)
                  }
                />
              </div>
            </label>
          </div>
          <div
            className={`py-1 px-2 rounded-[18px] bg-[#DDDBDC] ${
              !media || isUploading
                ? "cursor-not-allowed opacity-[0.4]"
                : "cursor-pointer"
            }`}
            onClick={
              media && !isUploading ? () => setOpenMintModal(true) : undefined
            }
          >
            <img
              src="/icons/mint-upload-icon.svg"
              alt="mint"
              className="w-8 h-8"
              width={32}
              height={32}
              loading="lazy"
              style={{ aspectRatio: "1 / 1" }}
            />
          </div>
        </div>
      </div>
      <Modal
        isOpen={openMusicUploadModal}
        closeModal={() => {
          setOpenMusicUploadModal(false);
          setMedia(null);
          setAudioThumbnailMedia(null);
        }}
      >
        <div className="pt-2 px-2 pb-8">
          <p className="text-center text-[18px] leading-[22px] font-semibold mb-2">
            Music Upload
          </p>
          <div className="flex flex-col w-full gap-5">
            {media ? (
              <div className="p-2 rounded-[12px] bg-music-upload-color/60 flex items-center gap-2">
                <label className={`cursor-pointer`}>
                  <div className="rounded-[11px] w-[70px] h-[70px]">
                    <img
                      src={
                        audioThumbnailMedia
                          ? audioThumbnailMedia.url
                          : "/icons/thumbnail-upload-icon.svg"
                      }
                      alt="image"
                      className="flex-shrink-0 rounded-[11px] object-cover w-[70px] h-[70px]"
                      width={70}
                      height={70}
                      loading="lazy"
                      style={{ aspectRatio: "1 / 1" }}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleAudioThumbnailMedia}
                    />
                  </div>
                </label>
                <div className="grow flex flex-col items-start justify-between">
                  <div className="mb-1">
                    <p className="text-[12px] leading-[120%] tracking-[0.3px] font-semibold text-white">
                      {musicTitle || "Song Name"}
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
                  <div className="flex items-center gap-2 w-full">
                    <audio
                      id="audio-element"
                      src={media.url}
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
                          width: `${audioProgressWidth}%`,
                        }}
                      />
                    </div>
                    <img
                      src={`/icons/music-${
                        isAudioPlaying ? "pause" : "play"
                      }-icon.svg`}
                      alt={isAudioPlaying ? "pause" : "play"}
                      className="w-[18px] h-[18px] cursor-pointer"
                      onClick={togglePlayPause}
                      width={18}
                      height={18}
                      loading="lazy"
                      style={{ aspectRatio: "1 / 1" }}
                    />
                  </div>
                </div>
              </div>
            ) : null}
            <div className="flex flex-col items-start gap-1 w-full">
              <label
                className="text-[18px] leading-[22px] font-semibold"
                htmlFor="songname"
              >
                Title
              </label>
              <input
                id="songname"
                name="songname"
                type="text"
                placeholder="Heartless"
                className="w-full border outline-none py-[10px] px-4 rounded-[12px] border-black/10 placeholder:text-black-20 text-black"
                value={musicTitle}
                onChange={(e) => setMusicTitle(e.target.value)}
              />
            </div>
            <label className="flex flex-col items-start gap-1 w-full">
              <label
                className="text-[18px] leading-[22px] font-semibold"
                htmlFor="artist"
              >
                Cover Image
              </label>
              <div className="p-[6px] rounded-[12px] border border-black/10 flex w-full gap-1 items-center justify-start cursor-pointer">
                <div
                  className={`rounded-[12px] border border-black/10 ${
                    audioThumbnailMedia ? "w-14 h-14" : "p-3"
                  } bg-frame-btn-bg`}
                >
                  <img
                    src={
                      audioThumbnailMedia
                        ? audioThumbnailMedia.url
                        : "/icons/upload-music-thumbnail-icon.svg"
                    }
                    alt="thumbnail"
                    className={
                      audioThumbnailMedia
                        ? "w-full h-full object-cover rounded-[12px]"
                        : "w-8 h-8"
                    }
                    width={32}
                    height={32}
                    loading="lazy"
                  />
                </div>
                <div className="grow">
                  <p className="leading-[22px] mv-1">Select File</p>
                  <span className="text-[14px] text-black-50 leading-[22px]">
                    PNG,JPG and GIF supported. Max size 5MB.
                  </span>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleAudioThumbnailMedia}
              />
            </label>
            <div className="flex items-center justify-center gap-2">
              <button
                className="w-full border-none outline-none rounded-[12px] px-4 py-2 bg-black text-white leading-[120%] font-medium disabled:bg-black-40 disabled:text-black-50"
                disabled={
                  !audioThumbnailMedia || !media || isUploading || !musicTitle
                }
                onClick={handlePost}
              >
                {isUploading ? "Uploading..." : "Post"}
              </button>
              <div
                className={`flex-shrink-0 py-1 px-2 rounded-[18px] bg-[#DDDBDC] ${
                  !media || isUploading
                    ? "cursor-not-allowed opacity-[0.4]"
                    : "cursor-pointer"
                }`}
                onClick={
                  !media || isUploading
                    ? undefined
                    : () => {
                        setOpenMintModal(true);
                        setOpenMusicUploadModal(false);
                      }
                }
              >
                <img
                  src="/icons/mint-upload-icon.svg"
                  alt="mint"
                  className="w-8 h-8"
                  width={32}
                  height={32}
                  loading="lazy"
                  style={{ aspectRatio: "1 / 1" }}
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={openChannelModal}
        closeModal={() => setOpenChannelModal(false)}
        style={{ borderRadius: "20px 20px 0 0", padding: 0, minHeight: "40%" }}
      >
        <div className="flex-1 pt-8 pb-2 px-2">
          <p className="mb-2 text-center text-[18px] font-semibold leading-[22px]">
            Select Channel
          </p>
          <div
            className={`w-full px-2 py-[10px] flex items-center justify-start gap-2 cursor-pointer mb-1 rounded-[12px] ${
              selectedChannel === ""
                ? "bg-frame-btn-bg ring-inset ring-1 ring-black/10"
                : ""
            } hover:bg-frame-btn-bg`}
            onClick={() => {
              setSelectedChannel("");
              setOpenChannelModal(false);
            }}
          >
            <img
              src={"/icons/home-icon.svg"}
              className="w-[24px] h-[24px] rounded-[20px] object-cover"
              width={24}
              height={24}
              loading="lazy"
              alt={"none"}
              style={{ aspectRatio: "1 / 1" }}
            />
            <p className="font-medium leading-[22px]">None</p>
          </div>
          <Virtuoso
            data={allUserMemberChannels}
            endReached={handleFetchNextPage}
            itemContent={(channelIndex) => {
              const channel = allUserMemberChannels[channelIndex];
              return channel ? (
                <div
                  className={`w-full px-2 py-[10px] flex items-center justify-start gap-2 cursor-pointer ${
                    channelIndex === allUserMemberChannels.length - 1
                      ? ""
                      : "mb-1"
                  } rounded-[12px] ${
                    selectedChannel === channel?.channel?.id
                      ? "bg-frame-btn-bg ring-inset ring-1 ring-black/10"
                      : ""
                  } hover:bg-frame-btn-bg`}
                  onClick={() => {
                    setSelectedChannel(channel?.channel?.id);
                    setOpenChannelModal(false);
                  }}
                >
                  <img
                    src={channel?.channel?.image_url}
                    className="w-[24px] h-[24px] rounded-[20px] object-cover"
                    width={24}
                    height={24}
                    loading="lazy"
                    alt={channel?.channel?.id}
                    style={{ aspectRatio: "1 / 1" }}
                  />
                  <p className="font-medium leading-[22px]">
                    {channel?.channel?.id}&nbsp;
                  </p>
                </div>
              ) : null;
            }}
            useWindowScroll={isMobile}
            components={{
              Footer: isFetchingNextUserChannels
                ? renderLoadingMore()
                : undefined,
            }}
            style={{ height: "80dvh", scrollbarWidth: "none" }}
          />
        </div>
      </Modal>
      <Modal
        isOpen={openMintModal}
        closeModal={
          isUploading
            ? undefined
            : () => {
                setOpenMintModal(false);
                setMedia(null);
                setMusicTitle("");
                setAudioThumbnailMedia(null);
                setMintThumbnail(null);
                setText("");
                setMintDescription("");
                setMintTitle("");
              }
        }
      >
        <h2 className="text-[18px] text-center text-black leading-[22px] font-semibold mt-2 px-2">
          Mint Details
        </h2>
        <div className="flex flex-col items-center justify-center gap-5 p-2">
          {media && media.type === "audio" ? (
            <div className="p-2 rounded-[12px] bg-music-upload-color/60 flex items-center gap-2 w-full">
              <label className={`cursor-pointer`}>
                <div className="rounded-[11px] w-[70px] h-[70px]">
                  <img
                    src={
                      mintThumbnail
                        ? mintThumbnail.url
                        : "/icons/thumbnail-upload-icon.svg"
                    }
                    alt="image"
                    className="flex-shrink-0 rounded-[11px] object-cover w-[70px] h-[70px]"
                    width={70}
                    height={70}
                    loading="lazy"
                    style={{ aspectRatio: "1 / 1" }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleMintThumbnail}
                  />
                </div>
              </label>
              <div className="grow flex flex-col items-start justify-between">
                <div className="mb-1">
                  <p className="text-[12px] leading-[120%] tracking-[0.3px] font-semibold text-white">
                    {musicTitle || "Song Name"}
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
                <div className="flex items-center gap-2 w-full">
                  <audio
                    id="audio-element"
                    src={media.url}
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
                        width: `${audioProgressWidth}%`,
                      }}
                    />
                  </div>
                  <img
                    src={`/icons/music-${
                      isAudioPlaying ? "pause" : "play"
                    }-icon.svg`}
                    alt={isAudioPlaying ? "pause" : "play"}
                    className="w-[18px] h-[18px] cursor-pointer"
                    onClick={togglePlayPause}
                    width={18}
                    height={18}
                    loading="lazy"
                    style={{ aspectRatio: "1 / 1" }}
                  />
                </div>
              </div>
            </div>
          ) : null}
          <label className="flex flex-col items-start gap-1 w-full">
            <label
              className="text-[18px] leading-[22px] font-semibold"
              htmlFor="thumbnail"
            >
              Mint thumbnail*
            </label>
            <div className="p-[6px] rounded-[12px] border border-black/10 flex w-full gap-1 items-center justify-start cursor-pointer">
              <div
                className={`rounded-[12px] border border-black/10 ${
                  mintThumbnail ? "w-14 h-14" : "p-3"
                } bg-frame-btn-bg`}
              >
                <img
                  src={
                    mintThumbnail
                      ? mintThumbnail.url
                      : "/icons/upload-music-thumbnail-icon.svg"
                  }
                  alt="thumbnail"
                  className={
                    mintThumbnail
                      ? "w-full h-full object-cover rounded-[12px]"
                      : "w-8 h-8"
                  }
                  width={32}
                  height={32}
                  loading="lazy"
                />
              </div>
              <div className="grow">
                <p className="leading-[22px] mv-1">Select File</p>
                <span className="text-[14px] text-black-50 leading-[22px]">
                  PNG,JPG supported. Max size 5MB.
                </span>
              </div>
            </div>
            <input
              type="file"
              accept="image/png, image/jpeg"
              multiple
              className="hidden"
              onChange={handleMintThumbnail}
            />
          </label>
          <div className="flex flex-col items-start gap-1 w-full">
            <label
              className="text-[18px] leading-[22px] font-semibold"
              htmlFor="minttitle"
            >
              Title*
            </label>
            <input
              id="minttitle"
              name="minttitle"
              type="text"
              placeholder="Rare Digital Artwork"
              className="w-full border outline-none py-[10px] px-4 rounded-[12px] border-black/10 placeholder:text-black-20 text-black"
              value={mintTitle}
              onChange={(e) => setMintTitle(e.target.value)}
            />
          </div>
          <div className="flex flex-col items-start gap-1 w-full">
            <label
              className="text-[18px] leading-[22px] font-semibold"
              htmlFor="mintdescription"
            >
              Description*
            </label>
            <textarea
              id="mintdescription"
              name="mintdescription"
              rows={3}
              placeholder="A unique piece of digital art created exclusively for this collection."
              className="w-full border outline-none py-[10px] px-4 rounded-[12px] border-black/10 placeholder:text-black-20 text-black"
              value={mintDescription}
              onChange={(e) => setMintDescription(e.target.value)}
            />
          </div>
          <div className="flex flex-col items-start gap-1 w-full">
            <span className="flex flex-col items-start">
              <label
                className="text-[18px] leading-[22px] font-semibold"
                htmlFor="minttitle"
              >
                Mint Price
              </label>
              <span className="text-[10px] font-medium leading-[auto] text-black-60">
                Set your price to 0 to earn Creator Rewards.
              </span>
            </span>
            <div className="flex items-center gap-2 w-full">
              <input
                id="mintprice"
                name="mintprice"
                type="number"
                placeholder="0"
                className="w-full border outline-none py-[10px] px-4 rounded-[12px] border-black/10 placeholder:text-black-20 text-black remove-arrow"
                value={mintPrice}
                onChange={(e) => setMintPrice(e.target.value)}
              />
              <div className="flex items-center gap-1 flex-shrink-0">
                <img
                  src="/icons/eth-icon.svg"
                  alt="eth"
                  width={24}
                  height={24}
                  loading="lazy"
                  style={{ aspectRatio: "1 / 1" }}
                />
                <p className="text-[18px] text-black-80 leading-[120%] font-semibold">
                  ETH
                </p>
              </div>
            </div>
          </div>
          {/* <div className="flex flex-col items-start gap-1 w-full">
            <label
              className="text-[18px] leading-[22px] font-semibold"
              htmlFor="minttitle"
            >
              Mint Duration
            </label>
            <div
              className="flex items-center cursor-pointer justify-between py-[10px] px-4 border outline-none border-black/10 rounded-[12px] w-full"
              onClick={() => setOpenCountdownModal(true)}
            >
              <p className="font-medium leading-[18px]">
                {marketCountdown.label}
              </p>
              <img
                src="/icons/chevron-down-icon.svg"
                alt="chevron-down"
                className="w-4 h-4"
                loading="lazy"
              />
            </div>
          </div> */}
          {!(address || isConnected) ? (
            <button
              className="w-full border-none outline-none rounded-[12px] px-4 py-2 bg-black text-white leading-[120%] font-medium disabled:bg-black-40 disabled:text-black-50"
              onClick={() =>
                connect({
                  connector: coinbaseWallet({
                    appName: "tike-social",
                    preference: "all",
                    version: "4",
                    appLogoUrl:
                      "https://app.tike.social/icons/desktop-logo.svg",
                  }),
                })
              }
            >
              Connect Wallet
            </button>
          ) : (
            <button
              className="w-full border-none outline-none rounded-[12px] px-4 py-2 bg-black text-white leading-[120%] font-medium disabled:bg-black-40 disabled:text-black-50"
              disabled={
                !mintThumbnail ||
                !media ||
                isUploading ||
                !mintTitle ||
                !mintDescription
              }
              onClick={handleMint}
            >
              {isUploading ? "Uploading..." : "Mint"}
            </button>
          )}
        </div>
      </Modal>
      <Modal
        isOpen={openCountdownModal}
        closeModal={() => setOpenCountdownModal(false)}
      >
        <div className="flex-1 pt-8 pb-2 px-2">
          <p className="mb-2 text-center text-[18px] font-semibold leading-[22px]">
            Mint Duration
          </p>
          {MINT_DURATION.map((md) => (
            <div
              key={md.label}
              className={`w-full mb-1 px-2 py-[10px] cursor-pointer rounded-[12px] ${
                marketCountdown.value === md.value
                  ? "bg-frame-btn-bg ring-inset ring-1 ring-black/10"
                  : ""
              } hover:bg-frame-btn-bg`}
            >
              <p
                className="font-medium leading-[22px]"
                onClick={() => {
                  setMarketCountdown(md);
                  setOpenCountdownModal(false);
                }}
              >
                {md.label}
              </p>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
});

export default CastInput;
