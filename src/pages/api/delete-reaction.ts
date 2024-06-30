import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const reaction_type = JSON.parse(req.body).reactionType as string;
      const signer_uuid = JSON.parse(req.body).uuid as string;
      const target = JSON.parse(req.body).hash as string;

      const resp = await axios.delete(
        `https://api.neynar.com/v2/farcaster/reaction`,
        {
          headers: {
            accept: "application/json",
            api_key: process.env.NEYNAR_API_KEY,
          },
          data: { reaction_type, signer_uuid, target },
        }
      );

      res.status(200).json(resp.data);
    } catch (error: any) {
      console.error("Error processing request:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
