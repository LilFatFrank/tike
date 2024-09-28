"use client";
import {
  Swap,
  SwapAmountInput,
  SwapButton,
  SwapMessage,
  SwapQuote,
  SwapToast,
  SwapToggleButton,
} from "@coinbase/onchainkit/swap";
import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";
import type { Token } from "@coinbase/onchainkit/token";
import { setOnchainKitConfig } from "@coinbase/onchainkit";
import { APIError, buildSwapTransaction } from "@coinbase/onchainkit/api";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { getSwapQuote } from "@coinbase/onchainkit/api";
import formatNumber from "@/utils/formatNumber";
import { formatUnits } from "viem";
import { useRouter } from "next/navigation";
import { coinbaseWallet } from "wagmi/connectors";

export default function SwapComponents() {
  const { address } = useAccount();
  const { data: ethBalance } = useBalance({ address });
  const { data: usdcBalance } = useBalance({
    address,
    token: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  });
  const { disconnect } = useDisconnect();
  const { connect } = useConnect();
  const [toggleToken, setToggleToken] = useState<boolean>(false);
  const [swapQuote, setSwapQuote] = useState<
    SwapQuote | APIError | undefined
  >();
  const [fromAmount, setFromAmount] = useState<string>("");
  const { back } = useRouter();
  const handleBack = useCallback(() => back(), [back]);

  setOnchainKitConfig({ apiKey: process.env.NEXT_PUBLIC_ONCHAIN_API_KEY });

  const fromToken: Token = {
    name: "ETH",
    address: "",
    symbol: "ETH",
    decimals: 18,
    image:
      "https://wallet-api-production.s3.amazonaws.com/uploads/tokens/eth_288.png",
    chainId: 8453,
  };

  const toToken: Token = {
    name: "USDC",
    address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    symbol: "USDC",
    decimals: 6,
    image:
      "https://d3r81g40ycuhqg.cloudfront.net/wallet/wais/44/2b/442b80bd16af0c0d9b22e03a16753823fe826e5bfd457292b55fa0ba8c1ba213-ZWUzYjJmZGUtMDYxNy00NDcyLTg0NjQtMWI4OGEwYjBiODE2",
    chainId: 8453,
  };

  const fetchSwapQuote = useCallback(async () => {
    try {
      const quote = await getSwapQuote({
        from: toggleToken ? toToken : fromToken,
        to: toggleToken ? fromToken : toToken,
        amount: fromAmount,
        useAggregator: false,
        maxSlippage: "3",
      });
      if (quote as SwapQuote) setSwapQuote(quote);
    } catch (error) {
      console.error(error);
      setSwapQuote(undefined);
    }
  }, [fromAmount, fromToken, toToken, toggleToken]);

  const formattedAmount = useCallback(
    (amount: string, decimals: number) => {
      if (!amount) return "0";
      const amt = formatUnits(BigInt(amount), decimals);
      return amt;
    },
    [toggleToken]
  );

  const handleSwap = useCallback(async () => {
    try {
      const response = await buildSwapTransaction({
        fromAddress: address as `0x${string}`,
        from: fromToken,
        to: toToken,
        amount: "0.1",
        useAggregator: false,
        maxSlippage: "3",
      });
    } catch (error) {
      console.error(error);
    }
  }, [swapQuote]);

  useEffect(() => {
    if (fromAmount) fetchSwapQuote();
    else setSwapQuote(undefined);
  }, [fromAmount, toggleToken]);

  return (
    <div className="flex-1 bg-white min-h-full p-5">
      {/* <div className="flex flex-col items-start justify-center gap-4">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center justify-start gap-2">
            <Image
              src="/icons/back-icon.svg"
              alt="back"
              width={24}
              height={24}
              className="cursor-pointer"
              onClick={handleBack}
              loading="lazy"
            />
            <p className="text-[20px] leading-auto font-bold text-black">
              Swap
            </p>
          </div>
          {address ? (
            <>
              <Image
                src={"/icons/disconnect-icon.svg"}
                alt="disconnect"
                width={24}
                height={24}
                className="cursor-pointer"
                loading="lazy"
                onClick={() => disconnect()}
                style={{ aspectRatio: "1/1" }}
              />
            </>
          ) : null}
        </div>
        <div className="flex flex-col items-center justify-center gap-2 w-full relative">
          <div className="w-full py-2 px-4 rounded-[16px] bg-[#F7F7F8] space-y-2">
            <p className="text-[14px] leading-auto font-normal text-[#4B5563]">
              You Pay
            </p>
            <div className="w-full flex items-center justify-between gap-2">
              <input
                type="number"
                className="remove-arrow w-full outline-none focus:outline-none border-none p-0 font-medium text-[36px] leading-auto bg-inherit"
                placeholder="0"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
              />
              <div className="flex-shrink-0 flex items-center justify-center gap-2 py-1 px-2 rounded-[60px] border border-black/[6%] bg-white">
                <Image
                  src={
                    toggleToken ? toToken.image ?? "" : fromToken.image ?? ""
                  }
                  alt={toggleToken ? toToken.name : fromToken.name}
                  className="w-[20px] h-[20px] rounded-full"
                  width={20}
                  height={20}
                  loading="lazy"
                  style={{ aspectRatio: "1/1" }}
                />
                <div className="text-[20px] leading-auto font-medium text-black-70">
                  {toggleToken ? toToken.name : fromToken.name}
                </div>
              </div>
            </div>
            <div className="w-full flex items-center justify-between">
              <p className="text-[14px] leading-auto font-normal text-[#4B5563]">
                {swapQuote && (swapQuote as SwapQuote).fromAmountUSD ? (
                  <>
                    ~$
                    {(swapQuote as SwapQuote).from?.address === toToken.address
                      ? formatNumber(
                          Number((swapQuote as SwapQuote).fromAmountUSD),
                          "en-US",
                          true
                        )
                      : formatNumber(
                          Number(
                            formattedAmount(
                              (swapQuote as SwapQuote)?.fromAmount ?? "0",
                              (swapQuote as SwapQuote)?.from?.decimals ?? 0
                            )
                          )
                        )}
                  </>
                ) : null}
              </p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-[14px] leading-auto font-normal text-[#4B5563]">
                  Bal:{" "}
                  {formatNumber(
                    Number(
                      toggleToken
                        ? usdcBalance?.formatted
                        : ethBalance?.formatted
                    ),
                    "en-US",
                    true
                  )}
                </p>
                <p
                  className="text-[14px] text-[#4192EF] font-bold leading-auto cursor-pointer"
                  onClick={() =>
                    setFromAmount(
                      toggleToken
                        ? usdcBalance?.formatted ?? ""
                        : ethBalance?.formatted ?? ""
                    )
                  }
                >
                  Max
                </p>
              </div>
            </div>
          </div>
          <div
            className="rounded-[8px] p-4 border-[4px] border-white cursor-pointer absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#F7F7F8]"
            onClick={() => setToggleToken(!toggleToken)}
          >
            <Image
              src="/icons/swap-icon.svg"
              alt="swap"
              width={16}
              height={16}
              loading="lazy"
            />
          </div>
          <div className="w-full py-2 px-4 rounded-[16px] bg-[#F7F7F8] space-y-2">
            <p className="text-[14px] leading-auto font-normal text-[#4B5563]">
              You Receive
            </p>
            <div className="w-full flex items-center justify-between gap-2">
              <input
                type="number"
                className="remove-arrow w-full outline-none focus:outline-none border-none p-0 font-medium text-[36px] leading-auto bg-inherit"
                placeholder="0"
                value={formattedAmount(
                  (swapQuote as SwapQuote)?.toAmount ?? "0",
                  (swapQuote as SwapQuote)?.to?.decimals ?? 0
                )}
                disabled
              />
              <div className="flex-shrink-0 flex items-center justify-center gap-2 py-1 px-2 rounded-[60px] border border-black/[6%] bg-white">
                <Image
                  src={
                    toggleToken ? fromToken.image ?? "" : toToken.image ?? ""
                  }
                  alt={toggleToken ? fromToken.name : toToken.name}
                  className="w-[20px] h-[20px] rounded-full"
                  width={20}
                  height={20}
                  loading="lazy"
                  style={{ aspectRatio: "1/1" }}
                />
                <div className="text-[20px] leading-auto font-medium text-black-70">
                  {toggleToken ? fromToken.name : toToken.name}
                </div>
              </div>
            </div>
            <div className="w-full flex items-center justify-between">
              <p className="text-[14px] leading-auto font-normal text-[#4B5563]">
                {swapQuote && (swapQuote as SwapQuote).toAmountUSD ? (
                  <>
                    ~$
                    {(swapQuote as SwapQuote).to?.address === toToken.address
                      ? formatNumber(
                          Number((swapQuote as SwapQuote).toAmountUSD),
                          "en-US",
                          true
                        )
                      : formatNumber(
                          Number(
                            formattedAmount(
                              (swapQuote as SwapQuote)?.toAmount ?? "0",
                              (swapQuote as SwapQuote)?.to?.decimals ?? 0
                            )
                          ),
                          "en-US",
                          true
                        )}
                  </>
                ) : null}
              </p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-[14px] leading-auto font-normal text-[#4B5563]">
                  Bal:{" "}
                  {formatNumber(
                    Number(
                      toggleToken
                        ? ethBalance?.formatted
                        : usdcBalance?.formatted
                    ),
                    "en-US",
                    true
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
        {address ? (
          <button className="w-full bg-[#4192EF] py-3 px-4 rounded-[12px] text-white font-bold text-[20px] leading-auto">
            Swap
          </button>
        ) : (
          <button
            className="w-full bg-black py-3 px-4 rounded-[12px] text-white font-bold text-[20px] leading-auto"
            onClick={() =>
              connect({
                connector: coinbaseWallet(),
              })
            }
          >
            Connect Wallet
          </button>
        )}
        {address && (swapQuote as APIError) && (
          <p className="text-[12px] leading-auto font-normal text-black-40 text-center">
            {(swapQuote as APIError).message}
          </p>
        )}
      </div> */}
      {address ? (
        <>
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center justify-start gap-2">
              <Image
                src="/icons/back-icon.svg"
                alt="back"
                width={24}
                height={24}
                className="cursor-pointer"
                onClick={handleBack}
                loading="lazy"
              />
              <p className="text-[20px] leading-auto font-bold text-black">
                Swap
              </p>
            </div>
            {address ? (
              <>
                <Image
                  src={"/icons/disconnect-icon.svg"}
                  alt="disconnect"
                  width={24}
                  height={24}
                  className="cursor-pointer"
                  loading="lazy"
                  onClick={() => disconnect()}
                  style={{ aspectRatio: "1/1" }}
                />
              </>
            ) : null}
          </div>
          <Swap title="" className="swap">
            <SwapAmountInput
              label="You Pay"
              token={fromToken}
              type="from"
              className="swap-amount-input"
            />
            <SwapToggleButton className="swap-toggle-btn absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            <SwapAmountInput
              label="You Receive"
              token={toToken}
              type="to"
              className="swap-amount-input"
            />
            {address ? (
              <SwapButton className="w-full bg-[#4192EF] py-3 px-4 rounded-[12px] text-white font-bold text-[20px] leading-auto disabled:opacity-70" />
            ) : (
              <button
                className="w-full bg-black py-3 px-4 rounded-[12px] text-white font-bold text-[20px] leading-auto"
                onClick={() =>
                  connect({
                    connector: coinbaseWallet(),
                  })
                }
              >
                Connect Wallet
              </button>
            )}
            <SwapMessage className="text-[12px] leading-auto font-normal text-black-40 text-center" />
          </Swap>
        </>
      ) : (
        <button
          className="w-full bg-black py-3 px-4 rounded-[12px] text-white font-bold text-[20px] leading-auto"
          onClick={() =>
            connect({
              connector: coinbaseWallet(),
            })
          }
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
