"use client";
import { useNeynarContext } from "@neynar/react";
import { FC, useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Virtuoso } from "react-virtuoso";
import { useIsMobile } from "@/hooks/useIsMobile";

interface CreatedProps {
  fid: string;
}

type Token = {
  contractAddress: string;
  tokenId: string;
  tokenUri: string;
};

const Created: FC<CreatedProps> = ({ fid }) => {
  const { user } = useNeynarContext();
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [error, setError] = useState(false);

  const isMobile = useIsMobile();

  const checkUser = useCallback(async () => {
    try {
      const res = await fetch(`/api/check-collection?fid=${fid}`);
      const data = await res.json();
      return data;
    } catch (error) {
      console.log("Error checking user", error);
      throw error;
    }
  }, [fid]);

  const getCreatedContent = useCallback(async () => {
    try {
      setLoading(true);
      const data = await checkUser();
      const collectionAddresses = Object.values(data.user.collection);

      const uriResponse = await fetch("/api/get-created-art", {
        method: "POST",
        body: JSON.stringify({ contracts: collectionAddresses }),
      });
      const uriData = await uriResponse.json();
      if (uriData.length) setTokens(uriData);
    } catch (error) {
      console.log(error);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [fid, checkUser, address]);

  const renderItem = useCallback(
    (index: number) => {
      const startIndex = index * 3;
      const endIndex = Math.min(startIndex + 3, tokens.length);

      const rowItems = tokens.slice(startIndex, endIndex).map((cast, idx) => {
        if (!cast) return null;

        return (
          <div
            key={`created-${cast.contractAddress}-${cast.tokenId}`}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              window.open(
                `https://zora.co/collect/base:${cast.contractAddress}/${cast.tokenId}`,
                "_blank",
                "noreferrer noopener"
              );
            }}
            className="cursor-pointer w-full aspect-square rounded-[12px] mb-2"
            style={{ width: `33%` }}
          >
            <img
              src={cast.tokenUri}
              alt={`${cast.contractAddress}-${cast.tokenId}`}
              className={`object-cover w-full h-full rounded-[12px]`}
            />
          </div>
        );
      });

      return (
        <div className="flex flex-row gap-2 w-full" key={`row-${index}`}>
          {rowItems}
        </div>
      );
    },
    [tokens]
  );

  useEffect(() => {
    getCreatedContent();
  }, []);

  const renderLoadingMore = () => (
    <>
      <div
        className="py-2 grid grid-cols-3 gap-2 w-full"
        key={`profile-media-loader`}
      >
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            className="aspect-square rounded-[12px] bg-divider animate-pulse w-full"
            key={index}
          />
        ))}
      </div>
    </>
  );

  return loading ? (
    renderLoadingMore()
  ) : error ? (
    <>
      <p className="text-center py-2">Error fetching collection!</p>
    </>
  ) : tokens.length === 0 ? (
    <>
      <div className="py-8 flex flex-col items-center justify-center gap-2">
        <img
          src="/icons/tike-logo-icon.svg"
          alt="logo"
          className="w-14 h-14 rounded-full"
        />
        <p className="text-black-70 text-[14px] font-medium">
          {user?.fid === Number(fid)
            ? "Start your creator journey on Tike.social!"
            : "No Tike.social creations!"}
        </p>
      </div>
    </>
  ) : (
    <>
      <Virtuoso
        totalCount={Math.ceil(tokens.length / 3)}
        data={tokens}
        itemContent={renderItem}
        useWindowScroll={isMobile}
        style={{
          height: "100vh",
          scrollbarWidth: "none",
          marginTop: "8px",
        }}
      />
    </>
  );
};

export default Created;
