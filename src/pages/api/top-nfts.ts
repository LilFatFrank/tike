import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const resp = await axios.get(
        `https://api.opensea.io/api/v2/collections?limit=100&order_by=seven_day_volume`,
        {
          headers: {
            accept: "application/json",
            "x-api-key": process.env.OPENSEA_API_KEY,
          },
        }
      );

      res.status(200).json(resp.data.collections);
    } catch (error: any) {
      console.error("Error processing request:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
