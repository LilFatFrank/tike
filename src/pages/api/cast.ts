import { processSingleCast } from "@/utils/processCasts";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const hash = JSON.parse(req.body).hash as string;
      const fid = JSON.parse(req.body).fid as string;

      const resp = await axios.get(
        `https://api.neynar.com/v2/farcaster/cast?identifier=${hash}&type=hash&viewer_fid=${fid}`,
        {
          headers: {
            accept: "application/json",
            api_key: process.env.NEYNAR_API_KEY,
          },
        }
      );

      console.log(resp.data.cast);

      const processedObject = await processSingleCast(resp.data.cast);

      console.log(processedObject);

      res.status(200).json(processedObject);
    } catch (error: any) {
      console.error("Error processing request:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
