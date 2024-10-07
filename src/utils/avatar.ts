export default function generateColorFromAddress(address: string): string {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    const char = address.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Convert hash to hex color
  const color = Math.abs(hash).toString(16).substring(0, 6);

  // Pad with zeros if necessary
  return "#" + "0".repeat(6 - color.length) + color;
}
