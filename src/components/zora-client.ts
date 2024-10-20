import {
  createCollectorClient,
  createCreatorClient,
} from "@zoralabs/protocol-sdk";
import { createPublicClient, http, Chain } from "viem";
import { base } from "viem/chains";

const publicZoraClient = createPublicClient({
  chain: base as Chain,
  transport: http(),
});

const creatorZoraClient = createCreatorClient({
  chainId: base.id,
  publicClient: publicZoraClient,
});

const collectorZoraClient = createCollectorClient({
  chainId: base.id,
  publicClient: publicZoraClient,
});

export { publicZoraClient, creatorZoraClient, collectorZoraClient };
