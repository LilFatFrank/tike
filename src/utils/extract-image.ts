export async function urlToFile(
  url: string,
  filename: string = "image.jpg",
  type: string = "image/jpeg"
): Promise<File> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type });
  } catch (error) {
    throw error;
  }
}
