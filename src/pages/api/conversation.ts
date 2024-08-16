import { processCasts } from "@/utils/processCasts";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const hash = JSON.parse(req.body).hash as string;
      const cursor = JSON.parse(req.body).cursor as string;
      const fid = JSON.parse(req.body).fid as string;

      const resp = await axios.get(
        `https://api.neynar.com/v2/farcaster/cast/conversation?identifier=${hash}&type=hash&reply_depth=1&include_chronological_parent_casts=false&viewer_fid=${fid}&limit=20&cursor=${cursor}`,
        {
          headers: {
            accept: "application/json",
            api_key: process.env.NEYNAR_API_KEY,
          },
        }
      );

      const processedObjects = await processCasts(
        resp.data.conversation.cast.direct_replies,
        "comment"
      );

      res.status(200).json({
        conversation: {
          cast: {
            ...resp.data.conversation.cast,
            direct_replies: processedObjects,
          },
        },
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
