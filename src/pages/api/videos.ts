import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const cursor = JSON.parse(req.body).cursor as string;
      const fid = JSON.parse(req.body).fid as string;
      const limit = JSON.parse(req.body).limit as string;

      const resp = await axios.get(
        `https://api.neynar.com/v2/farcaster/feed?feed_type=filter&filter_type=embed_types&fid=${fid}&embed_types=video&with_recasts=true&limit=${limit}&cursor=${cursor}`,
        {
          headers: {
            accept: "application/json",
            api_key: process.env.NEYNAR_API_KEY,
          },
        }
      );
      const processedObjects = resp.data.casts.map((c: any) => ({url: c.embeds[0].url, hash: c.parent_hash || c.hash }));

      res.status(200).json({
        data: processedObjects,
        nextCursor: resp.data.next.cursor,
      });
    } catch (error: any) {
      console.error("Error processing request:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
