import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const resp = await axios.post(
        `https://api.neynar.com/v2/farcaster/frame/action`,
        JSON.parse(req.body),
        {
          headers: {
            accept: "application/json",
            api_key: process.env.NEYNAR_API_KEY,
            "content-type": "application/json",
          },
        }
      );

      res.status(200).json(resp.data);
    } catch (error: any) {
      console.error("Error processing request:", error);
      res.status(500).json({ error: error.response.data });
    }
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
