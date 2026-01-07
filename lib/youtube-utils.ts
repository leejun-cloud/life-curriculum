// YouTube utilities without API key - using oEmbed and direct links

export interface YouTubeMetadata {
  title: string
  author: string
  thumbnail: string
  duration: string
  videoId: string
}

/**
 * Extract YouTube video ID from URL
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

/**
 * Get YouTube video metadata using oEmbed API (no API key required)
 */
export async function getYouTubeMetadata(videoIdOrUrl: string): Promise<YouTubeMetadata | null> {
  const videoId = extractYouTubeId(videoIdOrUrl)

  if (!videoId) {
    console.error("[YouTube] Invalid video ID or URL:", videoIdOrUrl)
    return null
  }

  try {
    const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`

    const response = await fetch(oEmbedUrl)

    if (!response.ok) {
      console.error("[YouTube] oEmbed API error:", response.statusText)
      return getFallbackMetadata(videoId)
    }

    const data = await response.json()

    return {
      title: data.title || "제목 없음",
      author: data.author_name || "YouTube",
      thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      duration: "정보 없음",
      videoId: videoId,
    }
  } catch (error) {
    console.error("[YouTube] Error fetching metadata:", error)
    return getFallbackMetadata(videoId)
  }
}

/**
 * Get fallback metadata when oEmbed fails
 */
function getFallbackMetadata(videoId: string): YouTubeMetadata {
  return {
    title: "YouTube 영상",
    author: "YouTube",
    thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    duration: "정보 없음",
    videoId: videoId,
  }
}

/**
 * Open YouTube search in a new tab
 */
export function searchYouTubeInNewTab(query: string): void {
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
  window.open(searchUrl, "_blank", "noopener,noreferrer")
}

/**
 * Find related videos on YouTube (opens in new tab)
 */
export function findRelatedVideos(currentVideoTitle: string): void {
  // Extract keywords from title (remove common words)
  const keywords = currentVideoTitle
    .replace(/[#\[\]()]/g, "")
    .split(/\s+/)
    .filter(word => word.length > 2)
    .slice(0, 5)
    .join(" ")

  searchYouTubeInNewTab(keywords)
}

/**
 * Open YouTube video in new tab
 */
export function openYouTubeVideo(videoId: string): void {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
  window.open(videoUrl, "_blank", "noopener,noreferrer")
}

/**
 * Validate YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null
}

/**
 * Get YouTube embed URL
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`
}

/**
 * Load YouTube IFrame API
 */
export function loadYouTubeIframeAPI(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.YT && window.YT.Player) {
      resolve()
      return
    }

    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"

    window.onYouTubeIframeAPIReady = () => {
      resolve()
    }

    tag.onerror = () => {
      reject(new Error("Failed to load YouTube IFrame API"))
    }

    const firstScriptTag = document.getElementsByTagName("script")[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
  })
}
