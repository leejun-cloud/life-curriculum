import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const videoId = searchParams.get("videoId")

  if (!videoId) {
    return NextResponse.json({ error: "Video ID is required" }, { status: 400 })
  }

  try {
    console.log("[v0] Fetching YouTube metadata for video ID:", videoId)

    // YouTube oEmbed API 사용
    const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    const response = await fetch(oEmbedUrl)

    if (!response.ok) {
      throw new Error(`YouTube oEmbed API failed: ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] YouTube oEmbed API response:", data)

    return NextResponse.json({
      title: data.title || "새로운 YouTube 영상",
      author: data.author_name || "YouTube",
      thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      duration: "정보 없음", // oEmbed에서는 duration을 제공하지 않음
    })
  } catch (error) {
    console.error("[v0] Error fetching YouTube metadata:", error)

    // 실패 시 기본값 반환
    return NextResponse.json({
      title: "새로운 YouTube 영상",
      author: "YouTube",
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      duration: "정보 없음",
    })
  }
}
