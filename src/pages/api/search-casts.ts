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
      const q = JSON.parse(req.body).q as string;

      const resp = await axios.get(
        `https://api.neynar.com/v2/farcaster/cast/search?q=${q}&limit=100&cursor=${cursor}`,
        {
          headers: {
            accept: "application/json",
            api_key: process.env.NEYNAR_API_KEY,
          },
        }
      );

      const processedObjects =
        resp.data && resp.data.result.casts && resp.data.result.casts.length
          ? await processCasts(resp.data.result.casts)
          : resp.data.casts;

      res.status(200).json({
        casts: processedObjects,
      });
    } catch (error: any) {
      console.error("Error processing request:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
