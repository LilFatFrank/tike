"use client";
import { Spinner } from "@/components";
import formatNumber from "@/utils/formatNumber";
import Link from "next/link";
import { FC, useEffect, useMemo, useState } from "react";
import InfiniteScroller from "react-infinite-scroller";

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

const Hub: FC = () => {
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

  const fetchTopProtocols = async () => {
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
  };

  const fetchTopNfts = async () => {
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
  };
  const fetchTopTokens = async () => {
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
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedInputSearch(inputSearch.trim());
    }, 700);

    return () => {
      clearTimeout(handler);
    };
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
          <Spinner />
        ) : (
          <InfiniteScroller pageStart={0} loadMore={() => {}}>
            <div className="flex flex-col w-full gap-3">
              {selectedTab === "apps"
                ? filteredProtocols.map((tp, index, arr) => (
                    <>
                      <Link
                        key={tp.id}
                        href={tp.url}
                        target="_blank"
                        className="block w-full"
                      >
                        <div className="w-full flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={tp.logo}
                              className="w-[38px] h-[38px] rounded-[12px] object-cover"
                            />
                            <div className="space-y-[2px]">
                              <p className="font-semibold leading-[120%]">
                                {tp.name}
                              </p>
                              <p className="font-medium text-[10px] leading-[120%] text-black-70">
                                {tp.category}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-[2px] text-end">
                            <p className="font-semibold leading-[120%]">
                              ${formatNumber(tp.tvl)}
                            </p>
                            <p
                              className={`font-medium text-[10px] leading-[120%] ${
                                tp.change_1d >= 0 ? "text-good" : "text-bad"
                              }`}
                            >
                              {formatNumber(tp.change_1d)}%
                            </p>
                          </div>
                        </div>
                      </Link>
                      {index === arr.length - 1 ? null : (
                        <hr className="border-[0.5px] border-t-divider" />
                      )}
                    </>
                  ))
                : selectedTab === "nfts"
                ? filteredNfts.map((tp, index, arr) => (
                    <>
                      <Link
                        key={tp.collection}
                        href={tp.opensea_url}
                        target="_blank"
                        className="block w-full"
                      >
                        <div className="w-full flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={tp.image_url}
                              className="w-[38px] h-[38px] rounded-[12px] object-cover"
                            />
                            <div className="space-y-[2px]">
                              <p className="font-semibold leading-[120%]">
                                {tp.name}
                              </p>
                              <p className="font-medium text-[10px] leading-[120%] text-black-70 capitalize">
                                {tp.category}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                      {index === arr.length - 1 ? null : (
                        <hr className="border-[0.5px] border-t-divider" />
                      )}
                    </>
                  ))
                : filteredTokens.map((tp, index, arr) => (
                    <>
                      <Link
                        key={tp.symbol}
                        href={tp.url}
                        target="_blank"
                        className="block w-full"
                      >
                        <div className="w-full flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={tp.image}
                              className="w-[38px] h-[38px] rounded-[12px] object-cover"
                            />
                            <div className="space-y-[2px]">
                              <p className="font-semibold leading-[120%]">
                                {tp.name}
                              </p>
                              <p className="font-medium text-[10px] leading-[120%] text-black-70">
                                {tp.symbol}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-[2px] text-end">
                            <p className="font-semibold leading-[120%]">
                              ${formatNumber(tp.price)}
                            </p>
                            <p
                              className={`font-medium text-[10px] leading-[120%] ${
                                tp.change_1d >= 0 ? "text-good" : "text-bad"
                              }`}
                            >
                              {formatNumber(tp.change_1d)}%
                            </p>
                          </div>
                        </div>
                      </Link>
                      {index === arr.length - 1 ? null : (
                        <hr className="border-[0.5px] border-t-divider" />
                      )}
                    </>
                  ))}
            </div>
          </InfiniteScroller>
        )}
      </div>
    </>
  );
};

export default Hub;
