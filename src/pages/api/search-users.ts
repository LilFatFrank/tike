import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const cursor = JSON.parse(req.body).cursor as string;
      const viewerFid = JSON.parse(req.body).viewerFid as string;
      const q = JSON.parse(req.body).q as string;

      const resp = await axios.get(
        `https://api.neynar.com/v2/farcaster/user/search?q=${q}&viewer_fid=${viewerFid}&limit=5&cursor=${cursor}`,
        {
          headers: {
            accept: "application/json",
            api_key: process.env.NEYNAR_API_KEY,
          },
        }
      );

      res.status(200).json({
        users: resp.data.result.users,
        next: { cursor: resp.data.result.next.cursor },
      });
    } catch (error: any) {
      console.error("Error processing request:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
