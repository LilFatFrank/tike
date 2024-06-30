import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const target_fids = JSON.parse(req.body).fid as string;
      const signer_uuid = JSON.parse(req.body).uuid as string;

      const resp = await axios.delete(
        `https://api.neynar.com/v2/farcaster/user/follow`,
        {
          headers: {
            accept: "application/json",
            api_key: process.env.NEYNAR_API_KEY,
          },
          data: { target_fids: [target_fids], signer_uuid },
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
