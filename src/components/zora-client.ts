import { createCreatorClient } from "@zoralabs/protocol-sdk";
import { createPublicClient, http, Chain } from "viem";
import { zora } from "viem/chains";

const publicZoraClient = createPublicClient({
  chain: zora as Chain,
  transport: http(),
});

const creatorZoraClient = createCreatorClient({
  chainId: zora.id,
  publicClient: publicZoraClient,
});

export { publicZoraClient, creatorZoraClient };
