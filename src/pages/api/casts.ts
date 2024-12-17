import { processCasts } from "@/utils/processCasts";
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
      const filter = JSON.parse(req.body).filter as string;

      const resp = await axios.get(
        !filter
          ? `https://api.neynar.com/v2/farcaster/feed/following?fid=${fid}&with_recasts=true&viewer_fid=${fid}&limit=${
              filter === "video" ? "100" : "25"
            }&cursor=${cursor}`
          : `https://api.neynar.com/v2/farcaster/feed?feed_type=filter&filter_type=embed_types&fid=${fid}&embed_types=${filter}&with_recasts=true&limit=25&cursor=${cursor}`,
        {
          headers: {
            accept: "application/json",
            api_key: process.env.NEYNAR_API_KEY,
          },
        }
      );
      const processedObjects = await processCasts(resp.data.casts);

      res.status(200).json({
        casts: filter
          ? processedObjects.filter((obj) => obj.embedType === filter)
          : processedObjects,
        next: { cursor: resp.data.next.cursor },
      });
      res.status(200).json(resp.data);
    } catch (error: any) {
      console.error("Error processing request:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
