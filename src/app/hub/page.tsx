"use client";
import formatNumber from "@/utils/formatNumber";
import Link from "next/link";
import { FC, memo, useCallback, useEffect, useMemo, useState } from "react";
import { Virtuoso } from "react-virtuoso";

const tabs = [
  {
    label: "Apps",
    value: "apps",
    heading: "Top Crypto Apps",
  },
  {
    label: "Tokens",
    value: "tokens",
    heading: "Trending Tokens",
  },
  {
    label: "NFTs",
    value: "nfts",
    heading: "Trending mints",
  },
];

const Hub: FC = memo(() => {
  const [inputSearch, setInputSearch] = useState("");
  const [debouncedInputSearch, setDebouncedInputSearch] = useState("");
  const [changeView, setChangeView] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"apps" | "tokens" | "nfts">(
    "apps"
  );
  const [topProtocols, setTopProtocols] = useState<
    {
      id: number;
      name: string;
      category: string;
      tvl: number;
      url: string;
      logo: string;
      change_1d: number;
    }[]
  >([]);
  const [topNfts, setTopNfts] = useState<
    {
      collection: string;
      name: string;
      category: string;
      image_url: string;
      chain: string;
      opensea_url: string;
    }[]
  >([]);
  const [topTokens, setTopTokens] = useState<
    {
      name: string;
      symbol: string;
      image: string;
      url: string;
      change_1d: number;
      price: number;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const fetchTopProtocols = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await fetch(`/api/top-protocols`);
      const data = await resp.json();
      setTopProtocols(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTopNfts = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await fetch(`/api/top-nfts`);
      const data = await resp.json();
      setTopNfts(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTopTokens = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await fetch(`/api/top-tokens`);
      const data = await resp.json();
      setTopTokens(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedInputSearch(inputSearch.trim());
    }, 700);

    return () => clearTimeout(handler);
  }, [inputSearch]);

  useEffect(() => {
    if (!topProtocols.length && selectedTab === "apps") {
      fetchTopProtocols();
    }
    if (!topNfts.length && selectedTab === "nfts") {
      fetchTopNfts();
    }
    if (!topTokens.length && selectedTab === "tokens") {
      fetchTopTokens();
    }
  }, [selectedTab]);

  const filteredProtocols = useMemo(() => {
    return selectedTab === "apps" && debouncedInputSearch
      ? topProtocols.filter((tp) =>
          tp.name.toLowerCase().includes(debouncedInputSearch.toLowerCase())
        )
      : topProtocols;
  }, [selectedTab, debouncedInputSearch, topProtocols]);

  const filteredNfts = useMemo(() => {
    return selectedTab === "nfts" && debouncedInputSearch
      ? topNfts.filter((tp) =>
          tp.name.toLowerCase().includes(debouncedInputSearch.toLowerCase())
        )
      : topNfts;
  }, [selectedTab, debouncedInputSearch, topNfts]);

  const filteredTokens = useMemo(() => {
    return selectedTab === "tokens" && debouncedInputSearch
      ? topTokens.filter((tp) =>
          tp.name.toLowerCase().includes(debouncedInputSearch.toLowerCase())
        )
      : topTokens;
  }, [selectedTab, debouncedInputSearch, topTokens]);

  const ItemRenderer = memo(
    ({
      item,
      type,
      isLast,
    }: {
      item: any;
      type: "apps" | "nfts" | "tokens";
      isLast: boolean;
    }) => {
      switch (type) {
        case "apps":
          return (
            <>
              <Link href={item.url} target="_blank" className="block w-full">
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={item.logo}
                      alt={item.name}
                      width={38}
                      height={38}
                      className="rounded-[12px] object-cover"
                      style={{ aspectRatio: "1 / 1" }}
                      loading="lazy"
                    />
                    <div className="space-y-[2px]">
                      <p className="font-semibold leading-[120%]">
                        {item.name}
                      </p>
                      <p className="font-medium text-[10px] leading-[120%] text-black-70">
                        {item.category}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-[2px] text-end">
                    <p className="font-semibold leading-[120%]">
                      ${formatNumber(item.tvl)}
                    </p>
                    <p
                      className={`font-medium text-[10px] leading-[120%] ${
                        item.change_1d >= 0 ? "text-good" : "text-bad"
                      }`}
                    >
                      {formatNumber(item.change_1d)}%
                    </p>
                  </div>
                </div>
              </Link>
              {isLast ? null : (
                <hr className="border-[0.5px] border-t-divider my-2" />
              )}
            </>
          );
        case "nfts":
          return (
            <>
              <Link
                href={item.opensea_url}
                target="_blank"
                className="block w-full"
              >
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      width={38}
                      height={38}
                      className="rounded-[12px] object-cover"
                      style={{ aspectRatio: "1 / 1" }}
                      loading="lazy"
                    />
                    <div className="space-y-[2px]">
                      <p className="font-semibold leading-[120%]">
                        {item.name}
                      </p>
                      <p className="font-medium text-[10px] leading-[120%] text-black-70 capitalize">
                        {item.category}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              {isLast ? null : (
                <hr className="border-[0.5px] border-t-divider my-2" />
              )}
            </>
          );
        case "tokens":
          return (
            <>
              <Link href={item.url} target="_blank" className="block w-full">
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={item.image}
                      alt={item.name}
                      width={38}
                      height={38}
                      className="rounded-[12px] object-cover"
                      style={{ aspectRatio: "1 / 1" }}
                      loading="lazy"
                    />
                    <div className="space-y-[2px]">
                      <p className="font-semibold leading-[120%]">
                        {item.name}
                      </p>
                      <p className="font-medium text-[10px] leading-[120%] text-black-70">
                        {item.symbol}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-[2px] text-end">
                    <p className="font-semibold leading-[120%]">
                      ${formatNumber(item.price)}
                    </p>
                    <p
                      className={`font-medium text-[10px] leading-[120%] ${
                        item.change_1d >= 0 ? "text-good" : "text-bad"
                      }`}
                    >
                      {formatNumber(item.change_1d)}%
                    </p>
                  </div>
                </div>
              </Link>
              {isLast ? null : (
                <hr className="border-[0.5px] border-t-divider my-2" />
              )}
            </>
          );
      }
    }
  );

  return (
    <>
      <div className="flex-1 p-4 bg-white min-h-dvh">
        <div className="w-full flex items-center gap-1 mb-4">
          <div className="w-full grow items-center bg-frame-btn-bg relative rounded-[12px] py-2 pl-[42px] pr-4">
            <img
              src="/icons/input-search-icon.svg"
              alt="input-search"
              width={22}
              height={22}
              className="absolute left-[16px]"
              loading="lazy"
              style={{ aspectRatio: "1 / 1" }}
            />
            <input
              className="p-0 outline-none border-none w-full bg-inherit placeholder:text-black-40"
              placeholder={`Search ${selectedTab}`}
              value={inputSearch}
              onChange={(e) => setInputSearch(e.target.value)}
              onFocus={() => setChangeView(true)}
            />
          </div>
          {changeView ? (
            <button
              onClick={() => {
                setChangeView(false);
                setInputSearch("");
              }}
              className="grow bg-none text-black-50 p-0 m-0 border-none outline-none"
            >
              Cancel
            </button>
          ) : null}
        </div>
        <div className="flex items-start justify-start gap-2 mb-4">
          {tabs.map((t) => (
            <p
              className={`flex-grow text-center text-[16px] leading-[120%] font-600 ${
                t.value === selectedTab
                  ? "text-black border-b-2 border-b-purple"
                  : "text-tab-unselected-color"
              } pb-[2px] cursor-pointer`}
              onClick={() => {
                setSelectedTab(t.value as typeof selectedTab);
                setInputSearch("");
              }}
            >
              {t.label}
            </p>
          ))}
        </div>
        <p className="font-semibold leading-[120%] mb-4">
          {
            tabs.find((t: (typeof tabs)[number]) => t.value === selectedTab)
              ?.heading
          }
        </p>
        {loading ? (
          <div className="w-full">
            {Array.from({ length: 15 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse w-full h-[50px] bg-divider rounded-lg mb-2"
              />
            ))}
          </div>
        ) : (
          <Virtuoso
            style={{ height: "100dvh", width: "100%" }}
            totalCount={
              selectedTab === "apps"
                ? filteredProtocols.length
                : selectedTab === "nfts"
                ? filteredNfts.length
                : filteredTokens.length
            }
            itemContent={(index) => {
              const item =
                selectedTab === "apps"
                  ? filteredProtocols[index]
                  : selectedTab === "nfts"
                  ? filteredNfts[index]
                  : filteredTokens[index];
              return (
                <>
                  <ItemRenderer
                    item={item}
                    type={selectedTab}
                    isLast={
                      index ===
                      (selectedTab === "apps"
                        ? filteredProtocols.length
                        : selectedTab === "nfts"
                        ? filteredNfts.length
                        : filteredTokens.length) -
                        1
                    }
                  />
                </>
              );
            }}
            components={{

            }}
          />
        )}
      </div>
    </>
  );
});

export default Hub;
