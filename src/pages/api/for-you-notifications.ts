import { processNotifications } from "@/utils/processNotifications";
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

      const resp = await axios.get(
        `https://api.neynar.com/v2/farcaster/notifications?fid=${fid}&cursor=${cursor}&is_priority=false`,
        {
          headers: {
            accept: "application/json",
            api_key: process.env.NEYNAR_API_KEY,
          },
        }
      );

      // const processedNotifications = await processNotifications(
      //   resp.data.notifications
      // );

      res.status(200).json(resp.data);
    } catch (error: any) {
      console.error("Error processing request:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
