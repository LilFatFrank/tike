import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { text, uuid, channelId, fileUrl, thumbnailUrl, parent } = req.body;

    let embeds = [];
    if (fileUrl) {
      embeds.push({ url: fileUrl });
    }
    if (thumbnailUrl) {
      embeds.push({ url: thumbnailUrl });
    }

    const url = "https://api.neynar.com/v2/farcaster/cast";
    const body = {
      embeds,
      text,
      signer_uuid: uuid,
      channel_id: channelId,
    };

    if (parent)
      Object.defineProperty(body, "parent", {
        value: parent,
      });

    const castResponse = await axios.post(url, body, {
      headers: {
        accept: "application/json",
        api_key: process.env.NEYNAR_API_KEY,
        "content-type": "application/json",
      },
    });

    res.status(200).json({ success: castResponse.data.success });
  } catch (error) {
    console.error("Error casting:", error);
    res.status(500).json({ message: "Error casting", error });
  }
}
