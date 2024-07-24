import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import FormData from "form-data";
import multer from "multer";
import { IncomingMessage, ServerResponse } from "http";

const upload = multer({
  limits: { fileSize: 100 * 1024 * 1024 },
});

const uploadMiddleware = upload.single("file");

const runMiddleware = (
  req: IncomingMessage,
  res: ServerResponse,
  fn: Function
) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

interface NextApiRequestWithFile extends NextApiRequest {
  file: Express.Multer.File;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequestWithFile,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await runMiddleware(req, res, uploadMiddleware);

    const formData = new FormData();
    formData.append("file", req.file.buffer, req.file.originalname);
    formData.append("pinataOptions", '{"cidVersion": 1}');
    formData.append("pinataMetadata", `{"name": "${req.file.originalname}"}`);

    console.log(req.body);

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.PINATA_JWT_KEY}`,
        },
      }
    );

    const url = "https://api.neynar.com/v2/farcaster/cast";
    const body = {
      embeds: [
        {
          url: `${process.env.PINATA_GATEWAY_URL}/ipfs/${response.data.IpfsHash}`,
        },
      ],
      text: req.body.text,
      signer_uuid: req.body.uuid,
      channel_id: req.body.channelId,
    };

    const castResponse = await axios.post(url, body, {
      headers: {
        accept: "application/json",
        api_key: process.env.NEYNAR_API_KEY,
        "content-type": "application/json",
      },
    });

    res.status(200).json({ success: castResponse.data.success });
  } catch (error) {
    console.error("Error uploading media:", error);
    res.status(500).json({ message: "Error uploading media", error });
  }
}
