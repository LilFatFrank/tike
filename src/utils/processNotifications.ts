import axios from "axios";

interface NotificationObject {
  [key: string]: any;
}

interface ProcessedObject extends NotificationObject {
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

export async function processNotifications(objects: NotificationObject[]) {
  const results = await Promise.allSettled(
    objects.map(async (obj) => {
      if (obj.type !== "mention")
        if (obj.type !== "follows") {
          if (
            obj.cast &&
            obj.cast.embeds &&
            obj.cast.embeds.length &&
            obj.cast.embeds.some((e: { [key: string]: any }) => e.url)
          ) {
            const urlType = await determineUrlType(
              obj.cast.embeds.find((e: { [key: string]: any }) => e.url).url,
              true
            );
            return {
              cast: {
                hash: obj.cast.hash,
                text: obj.cast.text,
              },
              user: {
                pfp: obj.author.pfp_url,
                displayName: obj.author.display_name,
              },
              type: obj.type,
              timestamp: obj.most_recent_timestamp,
              embedType: urlType,
            } as ProcessedObject;
          }
        } else {
          return {
            follows: obj.follows,
            type: obj.type,
            timestamp: obj.most_recent_timestamp,
          };
        }
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
