export function getVideoMetadata(videoUrl) {
  const url = new URL(videoUrl);
  const hostname = url.hostname.toLowerCase();

  if (
    hostname === "youtube.com" ||
    hostname === "www.youtube.com" ||
    hostname === "m.youtube.com" ||
    hostname === "youtu.be"
  ) {
    const pathParts = url.pathname.split("/").filter(Boolean);
    const videoId =
      url.searchParams.get("v") ||
      (hostname === "youtu.be" ? pathParts[0] : pathParts[pathParts.length - 1]);

    if (!videoId) {
      throw new Error("Enter a valid YouTube video URL.");
    }

    return {
      platform: "youtube",
      video_id: videoId,
      title: `YouTube video (${videoId})`,
      thumbnail: `https://img.youtube.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`,
    };
  }

  if (hostname === "instagram.com" || hostname === "www.instagram.com") {
    const pathParts = url.pathname.split("/").filter(Boolean);
    const postId =
      ["p", "reel", "reels", "tv"].includes(pathParts[0]) && pathParts[1];

    if (!postId) {
      throw new Error("Enter a valid Instagram post or reel URL.");
    }

    return {
      platform: "instagram",
      video_id: postId,
      title: `Instagram content (${postId})`,
      thumbnail: "",
    };
  }

  throw new Error("Use a YouTube or Instagram video URL.");
}
