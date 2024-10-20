import { collectorZoraClient } from "@/components/zora-client";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const contracts = JSON.parse(req.body).contracts as string[];

    try {
      const response = await Promise.all(
        contracts.map(async (c) => {
          const { tokens } = await collectorZoraClient.getTokensOfContract({
            tokenContract: c as `0x${string}`,
          });
          return tokens;
        })
      );

      const flatResponse = response.flat();

      const validTokens = await Promise.all(
        flatResponse.map(async (token) => {
          try {
            const uriResponse = await axios.get(token.token.tokenURI);
            if (uriResponse.status !== 200)
              throw new Error("Failed to fetch token URI");
            const uriData = uriResponse.data;
            return {
              contractAddress: token.token.contract.address,
              tokenId: (token.token as any).tokenId.toString(),
              tokenUri: uriData.image,
            };
          } catch (error) {
            console.error(
              `Error fetching token URI for ${token.token.tokenURI}:`,
              error
            );
            return null;
          }
        })
      );

      const filteredTokens = validTokens
        .filter((token) => token !== null)
        .sort((a, b) => {
          if (!a || !b) return 0;
          return Number(b.tokenId) - Number(a.tokenId);
        });

      res.status(200).json(filteredTokens);
    } catch (error: any) {
      console.error("Error processing request:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
