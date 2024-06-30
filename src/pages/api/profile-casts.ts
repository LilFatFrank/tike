import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import processCasts from "../utils/processCasts";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const cursor = JSON.parse(req.body).cursor as string;
      const fid = JSON.parse(req.body).fid as string;
      const viewerFid = JSON.parse(req.body).viewerFid as string;

      const resp = await axios.get(
        `https://api.neynar.com/v2/farcaster/feed?feed_type=filter&filter_type=fids&fids=${fid}&with_recasts=true&limit=25&viewer_fid=${viewerFid}&cursor=${cursor}`,
        {
          headers: {
            accept: "application/json",
            api_key: process.env.NEYNAR_API_KEY,
          },
        }
      );
      const processedObjects = await processCasts(resp.data.casts);

      res.status(200).json({
        casts: processedObjects,
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
