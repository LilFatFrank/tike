import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { URL } from "url";

interface SDKObject {
  [key: string]: any;
}

interface ProcessedObject extends SDKObject {
  embedType: "video" | "audio" | "image" | "youtube";
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (err) {
    return false;
  }
}

function isYouTubeUrl(url: string): boolean {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
  return youtubeRegex.test(url);
}

async function getContentType(url: string): Promise<string> {
  try {
    const response = await axios.head(url, { timeout: 10000 });
    return response.headers["content-type"] || "";
  } catch (error) {
    console.error(`Error fetching content type for ${url}:`, error);
    throw error;
  }
}

async function determineUrlType(
  url: string
): Promise<ProcessedObject["embedType"]> {
  if (!isValidUrl(url)) {
    throw new Error("Invalid URL");
  }

  if (isYouTubeUrl(url)) {
    return "youtube";
  }

  const contentType = await getContentType(url);
  if (contentType.startsWith("video/")) {
    return "video";
  } else if (contentType.startsWith("audio/")) {
    return "audio";
  } else if (contentType.startsWith("image/")) {
    return "image";
  } else {
    throw new Error("Unsupported content type");
  }
}

async function processObjects(
  objects: SDKObject[]
): Promise<ProcessedObject[]> {
  const results = await Promise.allSettled(
    objects.map(async (obj) => {
      if (
        obj.embeds &&
        obj.embeds.length &&
        obj.embeds.some((e: { [key: string]: any }) => e.url)
      ) {
        const urlType = await determineUrlType(
          obj.embeds.find((e: { [key: string]: any }) => e.url).url
        );
        return { ...obj, embedType: urlType } as ProcessedObject;
      }
      throw new Error("Object has no URL");
    })
  );

  const filteredResults = results
    .filter(
      (result): result is PromiseFulfilledResult<ProcessedObject> =>
        result.status === "fulfilled"
    )
    .map((result) => result.value);

  return filteredResults;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const cursor = JSON.parse(req.body).cursor as string;
      const fid = JSON.parse(req.body).fid as string;

      const resp = await axios.get(
        `https://api.neynar.com/v2/farcaster/feed/for_you?fid=${fid}&limit=50&cursor=${cursor}`,
        {
          headers: {
            accept: "application/json",
            api_key: process.env.NEYNAR_API_KEY,
          },
        }
      );
      const processedObjects = await processObjects(resp.data.casts);

      res.status(200).json({
        casts: processedObjects,
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
