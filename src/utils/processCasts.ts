import axios from "axios";
import { URL } from "url";

interface SDKObject {
  [key: string]: any;
}

interface ProcessedObject extends SDKObject {
  embedType: "video" | "audio" | "image" | "youtube" | "frame" | "other";
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
  url: string,
  multiple?: boolean
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
    if (multiple) throw new Error("Unsupported content type");
    else return "other";
  }
}

export async function processCasts(
  objects: SDKObject[],
  type?: "normal" | "comment"
): Promise<ProcessedObject[]> {
  const results = await Promise.allSettled(
    objects.map(async (obj) => {
      if (
        obj.embeds &&
        obj.embeds.length &&
        obj.embeds.some((e: { [key: string]: any }) => e.url)
      ) {
        if (obj.frames) {
          return { ...obj, embedType: "frame" } as ProcessedObject;
        }
        const urlType = await determineUrlType(
          obj.embeds.find((e: { [key: string]: any }) => e.url).url,
          true
        );
        return { ...obj, embedType: urlType } as ProcessedObject;
      } else if (type === "comment") {
        return { ...obj, embedType: "other" } as ProcessedObject;
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

export async function processSingleCast(
  obj: SDKObject
): Promise<ProcessedObject> {
  if (
    obj.embeds &&
    obj.embeds.length &&
    obj.embeds.some((e: { [key: string]: any }) => e.url)
  ) {
    if (obj.frames) {
      return { ...obj, embedType: "frame" } as ProcessedObject;
    }
    const urlType = await determineUrlType(
      obj.embeds.find((e: { [key: string]: any }) => e.url).url,
      false
    );
    return { ...obj, embedType: urlType } as ProcessedObject;
  }
  return { ...obj, embedType: "other" } as ProcessedObject;
}
