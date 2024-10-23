import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const url = JSON.parse(req.body).url as string;

      const resp = await axios.get(
        `https://api.neynar.com/v2/farcaster/frame/crawl?url=${encodeURIComponent(
          url
        )}`,
        {
          headers: {
            accept: "application/json",
            api_key: process.env.NEYNAR_API_KEY,
          },
        }
      );

      console.log(resp.data);

      res.status(200).json({ data: resp.data.frame });
    } catch (error: any) {
      console.error("Error processing request:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
