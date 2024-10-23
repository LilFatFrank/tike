export const containsUrl = (text: string): boolean => {
  const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*/i;
  return urlRegex.test(text);
};

export const isYouTubeLink = (url: string): boolean => {
  const youtubeRegex =
    /^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\/(watch\?v=|embed\/|v\/|.+\?v=)?([^&=%\?]{11})/;
  return youtubeRegex.test(url);
};

export const getYouTubeVideoId = (url: string): string | null => {
  const youtubeRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(youtubeRegex);
  return match ? match[1] : null;
};

export const checkUrlType = (text: string): string => {
  const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*/gi;
  const urls = text.match(urlRegex);

  if (!urls) {
    return "none";
  }

  if (urls.length > 1) {
    return "multiple";
  }

  const url = urls[0];
  return isYouTubeLink(url) ? "youtube" : "other";
};
