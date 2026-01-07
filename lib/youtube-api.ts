// YouTube Data API v3 utilities

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY

export interface YouTubeVideo {
    id: string
    title: string
    description: string
    thumbnail: string
    channelTitle: string
    publishedAt: string
    duration: string
}

export interface YouTubeVideoDetails {
    id: string
    title: string
    description: string
    thumbnail: string
    channelTitle: string
    publishedAt: string
    duration: string
    viewCount: number
    likeCount: number
}

/**
 * Search YouTube videos
 * @param query Search query
 * @param maxResults Maximum number of results (default: 10)
 * @returns Array of YouTube videos
 */
export async function searchYouTube(query: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === "demo-api-key") {
        console.warn("[v0] YouTube API key not configured, returning mock data")
        return getMockYouTubeResults(query)
    }

    try {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
            query
        )}&maxResults=${maxResults}&type=video&key=${YOUTUBE_API_KEY}`

        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(`YouTube API error: ${response.statusText}`)
        }

        const data = await response.json()

        return data.items.map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.medium.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
            duration: "정보 없음", // Need to call videos.list for duration
        }))
    } catch (error) {
        console.error("[v0] Error searching YouTube:", error)
        return getMockYouTubeResults(query)
    }
}

/**
 * Get detailed information about a YouTube video
 * @param videoId YouTube video ID
 * @returns YouTube video details
 */
export async function getVideoDetails(videoId: string): Promise<YouTubeVideoDetails | null> {
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === "demo-api-key") {
        console.warn("[v0] YouTube API key not configured, returning mock data")
        return getMockVideoDetails(videoId)
    }

    try {
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`

        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(`YouTube API error: ${response.statusText}`)
        }

        const data = await response.json()

        if (!data.items || data.items.length === 0) {
            return null
        }

        const item = data.items[0]

        return {
            id: item.id,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
            duration: parseDuration(item.contentDetails.duration),
            viewCount: parseInt(item.statistics.viewCount),
            likeCount: parseInt(item.statistics.likeCount || "0"),
        }
    } catch (error) {
        console.error("[v0] Error getting video details:", error)
        return getMockVideoDetails(videoId)
    }
}

/**
 * Parse ISO 8601 duration to readable format
 * @param duration ISO 8601 duration (e.g., "PT15M33S")
 * @returns Readable duration (e.g., "15:33")
 */
function parseDuration(duration: string): string {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)

    if (!match) return "정보 없음"

    const hours = (match[1] || "0H").slice(0, -1)
    const minutes = (match[2] || "0M").slice(0, -1)
    const seconds = (match[3] || "0S").slice(0, -1)

    if (hours !== "0") {
        return `${hours}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`
    }

    return `${minutes}:${seconds.padStart(2, "0")}`
}

/**
 * Get mock YouTube search results (for demo mode)
 */
function getMockYouTubeResults(query: string): YouTubeVideo[] {
    return [
        {
            id: "demo1",
            title: `${query} - 기초 강의 #1`,
            description: `${query}의 기초를 배우는 강의입니다.`,
            thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
            channelTitle: "Demo Channel",
            publishedAt: new Date().toISOString(),
            duration: "15:30",
        },
        {
            id: "demo2",
            title: `${query} - 실전 예제`,
            description: `${query}를 활용한 실전 예제를 다룹니다.`,
            thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
            channelTitle: "Demo Channel",
            publishedAt: new Date().toISOString(),
            duration: "23:45",
        },
        {
            id: "demo3",
            title: `${query} - 고급 테크닉`,
            description: `${query}의 고급 테크닉을 배웁니다.`,
            thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
            channelTitle: "Demo Channel",
            publishedAt: new Date().toISOString(),
            duration: "18:20",
        },
    ]
}

/**
 * Get mock video details (for demo mode)
 */
function getMockVideoDetails(videoId: string): YouTubeVideoDetails {
    return {
        id: videoId,
        title: "Demo Video Title",
        description: "This is a demo video description.",
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        channelTitle: "Demo Channel",
        publishedAt: new Date().toISOString(),
        duration: "15:30",
        viewCount: 10000,
        likeCount: 500,
    }
}
