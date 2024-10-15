import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const channel_id = JSON.parse(req.body).channelId as string;
      const cursor = JSON.parse(req.body).cursor as string;
      const viewer_fid = JSON.parse(req.body).viewerFid as string;

      const resp = await axios.get(
        `https://api.neynar.com/v2/farcaster/channel/followers?id=${channel_id}&viewer_fid=${viewer_fid}&limit=25&cursor=${cursor}`,
        {
          headers: {
            accept: "application/json",
            api_key: process.env.NEYNAR_API_KEY,
          },
        }
      );

      res.status(200).json({
        users: resp.data.users,
        next: { cursor: resp.data.next.cursor },
      });
    } catch (error: any) {
      console.error("Error processing request:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
