"use client";
import type { WidgetConfig } from "@lifi/widget";
import { LiFiWidget, WidgetSkeleton } from "@lifi/widget";
import { ClientOnly } from "./clientonly";
import { useConnect } from "wagmi";
import { coinbaseWallet } from "wagmi/connectors";
import { wagmiConfig } from "@/components/onchainproviders/wagmi";
import { useMemo } from "react";

export function Widget() {
  const { connect } = useConnect();

  const chainIds = useMemo(
    () => wagmiConfig.chains.map((chain) => chain.id),
    []
  );

  const config: WidgetConfig = {
    integrator: "tike-social",
    appearance: "light",
    chains: {
      allow: chainIds,
    },
  };

  return (
    <>
      <div className="lifi-swap">
        <ClientOnly fallback={<WidgetSkeleton config={config} />}>
          <LiFiWidget
            config={config}
            integrator="tike-social"
            hiddenUI={["poweredBy"]}
            walletConfig={{
              onConnect: () =>
                connect({
                  connector: coinbaseWallet({
                    appName: "tike-social",
                    version: "4",
                    appLogoUrl:
                      "https://app.tike.social/icons/desktop-logo.svg",
                    preference: "all",
                  }),
                }),
            }}
          />
        </ClientOnly>
      </div>
    </>
  );
}
