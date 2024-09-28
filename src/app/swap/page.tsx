"use client";
import {
  Swap,
  SwapAmountInput,
  SwapButton,
  SwapMessage,
  SwapToggleButton,
} from "@coinbase/onchainkit/swap";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import type { Token } from "@coinbase/onchainkit/token";
import { setOnchainKitConfig } from "@coinbase/onchainkit";
import Image from "next/image";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { coinbaseWallet } from "wagmi/connectors";

export default function SwapComponents() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect } = useConnect();
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

  return (
    <div className="flex-1 bg-white min-h-full p-5">
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
