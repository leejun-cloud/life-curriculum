import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { db } from '@/lib/firebase'
import { collection, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'

// Initialize YouTube API
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY
})

// Search topics
const SEARCH_TOPICS = [
  "자바스크립트 강의", 
  "파이썬 기초", 
  "AI 트렌드 2024", 
  "프론트엔드 개발", 
  "자기계발 동기부여", 
  "주식 투자 기초",
  "React 기초",
  "Next.js 강의"
]

const CACHE_COLLECTION = 'recommended_videos_cache'
const CACHE_DOC_ID = 'daily_recommendations'
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000 // 24 hours

export async function GET() {
  try {
    // 1. Check Cache first
    const cacheRef = doc(collection(db, CACHE_COLLECTION), CACHE_DOC_ID)
    const cacheSnap = await getDoc(cacheRef)

    if (cacheSnap.exists()) {
      const data = cacheSnap.data()
      const now = Date.now()
      const lastUpdated = data.updatedAt?.toMillis() || 0

      // If cache is fresh (less than 24h old), return cached data
      if (now - lastUpdated < CACHE_DURATION_MS && data.videos && data.videos.length > 0) {
        console.log('[API] Returning cached YouTube recommendations')
        return NextResponse.json({ 
          videos: data.videos,
          fromCache: true,
          updatedAt: data.updatedAt 
        })
      }
    }

    // 2. Cache is missing or expired, fetch from YouTube API
    console.log('[API] Cache expired or missing. Fetching fresh data from YouTube API...')
    
    // Pick 2 random topics to search for variety
    const shuffledTopics = [...SEARCH_TOPICS].sort(() => 0.5 - Math.random())
    const selectedTopics = shuffledTopics.slice(0, 2)
    
    let allVideos: any[] = []

    // Calculate 'publishedAfter' for recent trending (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const publishedAfter = thirtyDaysAgo.toISOString()

    for (const topic of selectedTopics) {
      try {
        const searchRes = await youtube.search.list({
          part: ['snippet'],
          q: topic,
          type: ['video'],
          order: 'viewCount', // Get most viewed
          maxResults: 10,
          publishedAfter: publishedAfter,
          regionCode: 'KR', // Korea
          relevanceLanguage: 'ko'
        })

        if (!searchRes.data.items || searchRes.data.items.length === 0) continue

        // Get video IDs to fetch statistics
        const videoIds = searchRes.data.items.map((item: any) => item.id?.videoId).filter(Boolean) as string[]
        
        if (videoIds.length === 0) continue

        const statsRes = await youtube.videos.list({
          part: ['statistics', 'contentDetails'],
          id: videoIds,
        })

        const videosWithStats = searchRes.data.items.map((item: any) => {
          const videoId = item.id?.videoId
          const stats = statsRes.data.items?.find((v: any) => v.id === videoId)
          
          return {
            id: videoId || `temp-${Math.random()}`,
            title: item.snippet?.title || '제목 없음',
            channel: item.snippet?.channelTitle || '채널 정보 없음',
            thumbnail: item.snippet?.thumbnails?.maxres?.url || item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url || '/placeholder.svg',
            
            // Format numbers
            views: formatNumber(stats?.statistics?.viewCount || '0'),
            comments: formatNumber(stats?.statistics?.commentCount || '0'),
            
            // Raw numbers for sorting/scoring
            rawViews: parseInt(stats?.statistics?.viewCount || '0'),
            rawComments: parseInt(stats?.statistics?.commentCount || '0'),
            
            publishedAt: formatTimeAgo(item.snippet?.publishedAt || ''),
            duration: formatDuration(stats?.contentDetails?.duration || 'PT0S'),
            tags: [topic.split(' ')[0], "Trending"],
            isTrending: true, // we filtered by viewCount and recent
          }
        })

        allVideos = [...allVideos, ...videosWithStats]
      } catch (topicError: any) {
        console.error(`[API] Error fetching topic ${topic}:`, topicError.message)
        // Continue to next topic instead of failing entirely
      }
    }

    // Fallback if API completely fails or quota exceeded
    if (allVideos.length === 0) {
      console.warn('[API] YouTube API returned no videos, falling back to mock data')
      return getFallbackResponse()
    }

    // Sort by a simple engagement score (comments carry high weight)
    const sortedVideos = allVideos
      .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i) // Remove duplicates
      .sort((a, b) => {
         const scoreA = a.rawViews + (a.rawComments * 10)
         const scoreB = b.rawViews + (b.rawComments * 10)
         return scoreB - scoreA
      })
      .slice(0, 16) // Keep top 16 for 2 rows

    // 3. Save to Firestore Cache
    try {
      await setDoc(cacheRef, {
        videos: sortedVideos,
        updatedAt: serverTimestamp()
      })
      console.log('[API] Successfully cached new recommendations')
    } catch (cacheError) {
      console.error('[API] Failed to update cache:', cacheError)
      // We still return the data even if caching fails
    }

    return NextResponse.json({ 
      videos: sortedVideos,
      fromCache: false,
      timestamp: Date.now()
    })

  } catch (error: any) {
    console.error('[API] Error in recommended videos route:', error)
    
    // On severe error (like quota exceeded), try to return existing cache even if expired
    try {
       const cacheRef = doc(collection(db, CACHE_COLLECTION), CACHE_DOC_ID)
       const cacheSnap = await getDoc(cacheRef)
       if (cacheSnap.exists() && cacheSnap.data().videos) {
         console.log('[API] Returning expired cache due to API error')
         return NextResponse.json({ videos: cacheSnap.data().videos, fromCache: true, isExpired: true })
       }
    } catch (e) {
       // Ignore
    }

    // Ultimate fallback
    return getFallbackResponse()
  }
}

// Helper functions (same as before or tailored for API)
function formatNumber(numStr: string): string {
  const num = parseInt(numStr, 10)
  if (isNaN(num)) return '0'
  if (num >= 10000) return `${(num / 10000).toFixed(1).replace(/\.0$/, '')}만`
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}천`
  return num.toString()
}

function formatTimeAgo(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return '오늘'
  if (diffDays < 7) return `${diffDays}일 전`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`
  return `${Math.floor(diffDays / 30)}개월 전`
}

function formatDuration(isoStr: string): string {
  const match = isoStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return '0:00'
  
  const h = parseInt(match[1] || '0')
  const m = parseInt(match[2] || '0')
  const s = parseInt(match[3] || '0')
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m}:${s.toString().padStart(2, '0')}`
}

function getFallbackResponse() {
  return NextResponse.json({
    videos: [
      {
        id: "v1_fallback",
        title: "2024년 반드시 알아야 할 AI 트렌드 총정리 (완벽 분석)",
        channel: "AI 인사이트",
        thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
        views: "125만",
        publishedAt: "3일 전",
        duration: "15:24",
        comments: "3.2천",
        tags: ["AI", "Tech"],
        isTrending: true,
      },
      {
        id: "v2_fallback",
        title: "코딩 레벨테스트 1단계부터 10단계까지, 당신의 위치는?",
        channel: "개발자 김코딩",
        thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800",
        views: "89만",
        publishedAt: "1주 전",
        duration: "24:10",
        comments: "1.5천",
        tags: ["Programming"],
        isTrending: false,
      }
    ],
    fromCache: true,
    isFallback: true
  })
}
