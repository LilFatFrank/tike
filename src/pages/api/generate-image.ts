import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const prompt = JSON.parse(req.body).prompt as string;

      if (!prompt) {
        res.status(400).json({ error: "Prompt is required!" });
        return;
      }

      const response = await axios.post(
        "https://api.openai.com/v1/images/generations",
        {
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        }
      );

      res.status(200).json({ imageUrl: response.data.data[0].url });
    } catch (error: any) {
      console.error("Error processing request:", error, error.data);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
