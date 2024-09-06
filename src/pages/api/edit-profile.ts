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
    const { displayName, username, bio, uuid, image } = req.body;

    const editProfileResponse = await axios.patch(
      "https://api.neynar.com/v2/farcaster/user",
      {
        bio,
        display_name: displayName,
        username,
        signer_uuid: uuid,
        pfp_url: image,
      },
      {
        headers: {
          accept: "application/json",
          api_key: process.env.NEYNAR_API_KEY,
          "content-type": "application/json",
        },
      }
    );

    if (editProfileResponse.data.success) {
      res.status(200).json({
        message: "Profile updated successfully",
        success: true,
      });
    } else {
      throw new Error("Profile update failed");
    }
  } catch (error) {
    console.error("Error editing profile:", error);
    res.status(500).json({
      message: "Error editing profile",
      error,
      success: false,
    });
  }
}
