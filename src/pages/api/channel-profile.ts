import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const viewerFid = JSON.parse(req.body).viewerFid as string;
      const channelId = JSON.parse(req.body).channelId as string;

      const resp = await axios.get(
        `https://api.neynar.com/v2/farcaster/channel?id=${channelId}&type=id&viewer_fid=${viewerFid}`,
        {
          headers: {
            accept: "application/json",
            api_key: process.env.NEYNAR_API_KEY,
          },
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
