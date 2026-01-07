export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
    /youtube\.com\/shorts\/([^&?/]+)/,
    /youtube\.com\/v\/([^&?/]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`
}

export function getYouTubeThumbnail(videoId: string, quality: "maxres" | "hq" | "mq" | "sd" = "maxres"): string {
  const qualityMap = {
    maxres: "maxresdefault",
    hq: "hqdefault",
    mq: "mqdefault",
    sd: "sddefault",
  }
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`
}

export function validateYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null
}

// YouTube IFrame API 타입 정의
declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export function loadYouTubeIframeAPI(): Promise<void> {
  return new Promise((resolve) => {
    // 이미 로드되어 있으면 바로 resolve
    if (window.YT && window.YT.Player) {
      resolve()
      return
    }

    // 스크립트가 이미 추가되어 있는지 확인
    if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      // 스크립트는 있지만 아직 로드 안됨
      window.onYouTubeIframeAPIReady = () => {
        resolve()
      }
      return
    }

    // 새로 스크립트 추가
    window.onYouTubeIframeAPIReady = () => {
      resolve()
    }

    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"
    const firstScriptTag = document.getElementsByTagName("script")[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
  })
}
