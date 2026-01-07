"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  BookOpen,
  CheckCircle2,
  Circle,
  Edit3,
  Save,
  Plus,
  X,
  Trash2,
  GripVertical,
  CheckSquare,
  Square,
  Copy,
  Loader2,
} from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { getCurriculum } from "@/lib/firebase-collections"
import { extractYouTubeId } from "@/lib/youtube-utils"

export default function CurriculumDetailPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const isFromCommunity = searchParams.get("source") === "community"
  const shouldContinue = searchParams.get("continue") === "true"

  const [curriculum, setCurriculum] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [currentContentIndex, setCurrentContentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [userNotes, setUserNotes] = useState("")

  const [isEditing, setIsEditing] = useState(false)
  const [contents, setContents] = useState<any[]>([])
  const [newVideoUrl, setNewVideoUrl] = useState("")
  const [newVideoTitle, setNewVideoTitle] = useState("")
  const [editingContentId, setEditingContentId] = useState<number | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false)

  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedVideos, setSelectedVideos] = useState<number[]>([])
  const [showCurriculumSelector, setShowCurriculumSelector] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  const playerRef = useRef<any>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const currentContent = contents.length > 0 ? contents[currentContentIndex] : null
  const progress = currentContent ? (currentTime / duration) * 100 : 0

  const saveProgressToFirebase = async (current: number, total: number) => {
    if (!user || !currentContent) return

    try {
      const { updateProgress } = await import("@/lib/firebase-collections")
      const progressPercent = total > 0 ? (current / total) * 100 : 0

      await updateProgress(user.id, params.id, {
        contentId: currentContent.id,
        currentTime: current,
        duration: total,
        progress: progressPercent,
        lastWatched: new Date().toISOString(),
      })

      console.log("[v0] Progress saved to Firebase:", progressPercent.toFixed(2), "%")
    } catch (error) {
      console.error("[v0] Error saving progress to Firebase:", error)
    }
  }

  const loadCurriculum = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    try {
      setLoading(true)
      console.log("[v0] Loading curriculum:", params.id)

      const curriculumData = await getCurriculum(params.id)
      if (!curriculumData) {
        setError("커리큘럼을 찾을 수 없습니다.")
        return
      }

      console.log("[v0] Loaded curriculum data:", curriculumData)
      setCurriculum(curriculumData)

      const curriculumContents = (curriculumData.contents || []).map((content: any) => {
        // If videoId already exists, use it
        if (content.videoId) {
          return content
        }

        // Otherwise, extract from URL
        const videoId = extractYouTubeId(content.url)

        console.log("[v0] Extracted videoId for content:", content.id, "->", videoId)

        return {
          ...content,
          videoId: videoId || undefined,
        }
      })

      setContents(curriculumContents)

      if (curriculumContents.length > 0) {
        setCurrentContentIndex(0)
      }
    } catch (err) {
      console.error("[v0] Error loading curriculum:", err)
      setError("커리큘럼을 불러오는 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const extractVideoMetadata = async (url: string) => {
    const videoId = extractYouTubeId(url)
    if (!videoId) {
      console.log("[v0] Invalid YouTube URL:", url)
      return null
    }

    console.log("[v0] Extracting metadata for video ID:", videoId)
    setIsLoadingMetadata(true)

    try {
      let title = newVideoTitle || "새로운 YouTube 영상"
      let author = "YouTube"

      try {
        const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
        console.log("[v0] Trying oEmbed API:", oEmbedUrl)

        const response = await fetch(oEmbedUrl)
        if (response.ok) {
          const data = await response.json()
          title = data.title || title
          author = data.author_name || author
          console.log("[v0] Successfully got metadata from oEmbed:", { title, author })
        }
      } catch (oEmbedError) {
        console.log("[v0] oEmbed API failed (likely CORS), using fallback:", oEmbedError)
      }

      if (title === "새로운 YouTube 영상" || title === newVideoTitle) {
        try {
          console.log("[v0] Trying proxy method for metadata")
          const proxyResponse = await fetch(`/api/youtube-metadata?videoId=${videoId}`)
          if (proxyResponse.ok) {
            const proxyData = await proxyResponse.json()
            title = proxyData.title || title
            author = proxyData.author || author
            console.log("[v0] Successfully got metadata from proxy:", { title, author })
          }
        } catch (proxyError) {
          console.log("[v0] Proxy method failed, using basic info:", proxyError)
        }
      }

      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

      const metadata = {
        title: title,
        duration: "정보 없음",
        videoId: videoId,
        thumbnail: thumbnailUrl,
        description: `${author}의 YouTube 영상`,
        author: author,
      }

      console.log("[v0] Final metadata:", metadata)
      return metadata
    } catch (error) {
      console.error("[v0] Error extracting metadata:", error)
      return {
        title: newVideoTitle || "새로운 YouTube 영상",
        duration: "정보 없음",
        videoId: videoId,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        description: "YouTube 영상",
        author: "YouTube",
      }
    } finally {
      setIsLoadingMetadata(false)
    }
  }

  const addVideo = async () => {
    if (!newVideoUrl.trim()) {
      alert("YouTube URL을 입력해주세요.")
      return
    }

    const videoId = extractYouTubeId(newVideoUrl)
    if (!videoId) {
      alert("올바른 YouTube URL을 입력해주세요.\n예: https://www.youtube.com/watch?v=VIDEO_ID")
      return
    }

    console.log("[v0] Adding new video:", newVideoUrl)
    console.log("[v0] Extracted video ID:", videoId)
    console.log("[v0] Current contents before adding:", contents)

    try {
      const metadata = await extractVideoMetadata(newVideoUrl)
      if (!metadata) {
        alert("YouTube 영상 정보를 가져올 수 없습니다. 다시 시도해주세요.")
        return
      }

      const newId = contents.length > 0 ? Math.max(...contents.map((c) => c.id)) + 1 : 1

      const newContent = {
        id: newId,
        title: metadata.title,
        duration: metadata.duration,
        completed: false,
        videoId: metadata.videoId,
        url: newVideoUrl,
        notes: "",
        thumbnail: metadata.thumbnail,
        description: metadata.description,
        author: metadata.author,
      }

      console.log("[v0] Adding new content:", newContent)

      const updatedContents = [...contents, newContent]
      setContents(updatedContents)

      try {
        const { updateCurriculum } = await import("@/lib/firebase-collections")
        await updateCurriculum(params.id, {
          contents: updatedContents,
          updatedAt: new Date().toISOString(),
        })
        console.log("[v0] Successfully saved to Firebase")
      } catch (firebaseError) {
        console.error("[v0] Error saving to Firebase:", firebaseError)
        // Firebase 저장 실패해도 로컬 상태는 유지
      }

      setNewVideoUrl("")
      setNewVideoTitle("")
      setShowAddForm(false)

      if (contents.length === 0) {
        setCurrentContentIndex(0)
      }

      alert(
        `✅ 새 영상이 추가되었습니다!\n\n📹 제목: ${metadata.title}\n👤 채널: ${metadata.author}\n🆔 Video ID: ${videoId}`,
      )
    } catch (error) {
      console.error("[v0] Error adding video:", error)
      alert("❌ 영상 추가 중 오류가 발생했습니다. 다시 시도해주세요.")
    }
  }

  const deleteVideo = (contentId: number) => {
    if (contents.length <= 1) {
      alert("최소 1개의 영상은 있어야 합니다.")
      return
    }

    console.log("[v0] Deleting video:", contentId)
    const updatedContents = contents.filter((c) => c.id !== contentId)
    setContents(updatedContents)

    if (currentContent.id === contentId) {
      setCurrentContentIndex(0)
    }

    alert("영상이 삭제되었습니다!")
  }

  const startEditingTitle = (contentId: number) => {
    setEditingContentId(contentId)
  }

  const saveTitle = (contentId: number, newTitle: string) => {
    console.log("[v0] Saving title:", contentId, newTitle)
    const updatedContents = contents.map((c) => (c.id === contentId ? { ...c, title: newTitle } : c))
    setContents(updatedContents)
    setEditingContentId(null)
  }

  const togglePlayPause = () => {
    if (playerRef.current) {
      const playerState = playerRef.current.getPlayerState()
      if (playerState === 1) {
        // 재생 중이면 일시정지
        playerRef.current.pauseVideo()
      } else {
        // 일시정지 중이면 재생
        playerRef.current.playVideo()
      }
    }
    console.log("[v0] Toggle play/pause")
  }

  const nextContent = () => {
    if (currentContentIndex < contents.length - 1) {
      setCurrentContentIndex(currentContentIndex + 1)
      setCurrentTime(0)
      console.log("[v0] Next content:", currentContentIndex + 1)
    }
  }

  const prevContent = () => {
    if (currentContentIndex > 0) {
      setCurrentContentIndex(currentContentIndex - 1)
      setCurrentTime(0)
      console.log("[v0] Previous content:", currentContentIndex - 1)
    }
  }

  const markAsComplete = async () => {
    console.log("[v0] Marking content as complete:", currentContent.id)
    const updatedContents = contents.map((c) => (c.id === currentContent.id ? { ...c, completed: true } : c))
    setContents(updatedContents)

    if (user) {
      try {
        const { updateCurriculum } = await import("@/lib/firebase-collections")
        await updateCurriculum(params.id, {
          contents: updatedContents,
          updatedAt: new Date().toISOString(),
        })
      } catch (error) {
        console.error("[v0] Error updating curriculum:", error)
      }
    }

    alert("강의를 완료로 표시했습니다!")
  }

  const saveNotes = () => {
    const noteData = {
      contentId: currentContent.id,
      notes: userNotes,
      timestamp: new Date().toISOString(),
    }

    console.log("[v0] Saving notes:", noteData)
    alert("노트가 저장되었습니다!")
  }

  const continueFromLastPosition = () => {
    const nextIncompleteIndex = contents.findIndex((c) => !c.completed)
    if (nextIncompleteIndex !== -1) {
      setCurrentContentIndex(nextIncompleteIndex)
      console.log("[v0] Continue learning from:", nextIncompleteIndex)
    }
  }

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    setSelectedVideos([])
  }

  const toggleVideoSelection = (videoId: number) => {
    setSelectedVideos((prev) => (prev.includes(videoId) ? prev.filter((id) => id !== videoId) : [...prev, videoId]))
  }

  const selectAllVideos = () => {
    if (selectedVideos.length === contents.length) {
      setSelectedVideos([])
    } else {
      setSelectedVideos(contents.map((c) => c.id))
    }
  }

  const addSelectedToMyCurriculum = () => {
    if (selectedVideos.length === 0) {
      alert("선택된 비디오가 없습니다.")
      return
    }

    console.log("[v0] Adding selected videos to curriculum:", selectedVideos)
    const selectedVideoData = contents.filter((c) => selectedVideos.includes(c.id))

    setShowCurriculumSelector(true)
  }

  const saveSelectedToMyCurriculum = () => {
    if (selectedVideos.length === 0) {
      alert("선택된 비디오가 없습니다.")
      return
    }

    console.log("[v0] Saving selected videos to my curriculum:", selectedVideos)
    setShowCurriculumSelector(true)
  }

  const handleAddToCurriculum = (targetCurriculumId: string) => {
    const selectedVideoData = contents.filter((c) => selectedVideos.includes(c.id))

    console.log("[v0] Adding videos to curriculum:", {
      targetCurriculumId,
      videos: selectedVideoData,
    })

    const existingSelections = JSON.parse(localStorage.getItem("selectedVideos") || "[]")
    const newSelection = {
      id: Date.now(),
      targetCurriculumId,
      videos: selectedVideoData,
      addedAt: new Date().toISOString(),
    }

    localStorage.setItem("selectedVideos", JSON.stringify([...existingSelections, newSelection]))

    alert(`${selectedVideos.length}개의 비디오가 선택한 커리큘럼에 추가되었습니다!`)
    setSelectedVideos([])
    setIsSelectionMode(false)
    setShowCurriculumSelector(false)
  }

  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode)
    console.log("[v0] Toggle preview mode:", !isPreviewMode)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  useEffect(() => {
    const loadAPI = async () => {
      try {
        const { loadYouTubeIframeAPI } = await import("@/lib/youtube-utils")
        await loadYouTubeIframeAPI()
        console.log("[v0] YouTube IFrame API loaded successfully")
      } catch (error) {
        console.error("[v0] Error loading YouTube IFrame API:", error)
      }
    }
    loadAPI()
  }, [])

  useEffect(() => {
    if (!currentContent || !window.YT || !playerContainerRef.current) {
      return
    }

    if (!currentContent.videoId) {
      console.error("[v0] No videoId found for current content:", currentContent)
      alert("이 영상의 ID를 찾을 수 없습니다. URL을 확인해주세요.")
      return
    }

    console.log("[v0] Initializing YouTube player for video:", currentContent.videoId)

    // 기존 플레이어 정리
    if (playerRef.current) {
      try {
        playerRef.current.destroy()
      } catch (e) {
        console.log("[v0] Error destroying previous player:", e)
      }
    }

    // 기존 인터벌 정리
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }

    // 새 플레이어 생성
    try {
      playerRef.current = new window.YT.Player(playerContainerRef.current, {
        videoId: currentContent.videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: (event: any) => {
            console.log("[v0] YouTube player ready")
            const videoDuration = event.target.getDuration()
            setDuration(videoDuration)
            console.log("[v0] Video duration:", videoDuration)

            // 저장된 진행률이 있으면 해당 위치로 이동
            const savedProgress = localStorage.getItem(`progress_${params.id}_${currentContent.id}`)
            if (savedProgress) {
              const savedTime = Number.parseFloat(savedProgress)
              event.target.seekTo(savedTime, true)
              console.log("[v0] Resumed from saved position:", savedTime)
            }
          },
          onStateChange: (event: any) => {
            console.log("[v0] Player state changed:", event.data)

            // 재생 중일 때 (state === 1)
            if (event.data === 1) {
              setIsPlaying(true)

              // 진행률 추적 시작
              progressIntervalRef.current = setInterval(() => {
                if (playerRef.current && playerRef.current.getCurrentTime) {
                  const current = playerRef.current.getCurrentTime()
                  const total = playerRef.current.getDuration()

                  setCurrentTime(current)
                  setDuration(total)

                  // localStorage에 진행률 저장
                  localStorage.setItem(`progress_${params.id}_${currentContent.id}`, current.toString())

                  // Firebase에 진행률 저장 (5초마다)
                  if (Math.floor(current) % 5 === 0 && user) {
                    saveProgressToFirebase(current, total)
                  }

                  console.log("[v0] Progress:", current, "/", total)
                }
              }, 1000)
            } else {
              // 일시정지, 종료 등
              setIsPlaying(false)

              if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current)
              }

              // 현재 진행률 저장
              if (playerRef.current && playerRef.current.getCurrentTime) {
                const current = playerRef.current.getCurrentTime()
                localStorage.setItem(`progress_${params.id}_${currentContent.id}`, current.toString())

                if (user) {
                  saveProgressToFirebase(current, duration)
                }
              }
            }

            // 영상 종료 시 (state === 0)
            if (event.data === 0) {
              console.log("[v0] Video ended")
              markAsComplete()

              // 다음 영상으로 자동 이동
              if (currentContentIndex < contents.length - 1) {
                setTimeout(() => {
                  nextContent()
                }, 2000)
              }
            }
          },
          onError: (event: any) => {
            console.error("[v0] YouTube player error:", event.data)
            let errorMessage = "YouTube 영상을 재생할 수 없습니다."

            switch (event.data) {
              case 2:
                errorMessage = "잘못된 비디오 ID입니다."
                break
              case 5:
                errorMessage = "HTML5 플레이어 오류가 발생했습니다."
                break
              case 100:
                errorMessage = "영상을 찾을 수 없습니다. (삭제되었거나 비공개)"
                break
              case 101:
              case 150:
                errorMessage = "영상 소유자가 임베드 재생을 허용하지 않습니다."
                break
            }

            alert(errorMessage)
          },
        },
      })
    } catch (error) {
      console.error("[v0] Error creating YouTube player:", error)
    }

    // 클린업
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
      if (playerRef.current) {
        try {
          playerRef.current.destroy()
        } catch (e) {
          console.log("[v0] Error destroying player on cleanup:", e)
        }
      }
    }
  }, [currentContent, currentContentIndex])

  useEffect(() => {
    loadCurriculum()
  }, [params.id, user, router])

  useEffect(() => {
    if (shouldContinue && contents.length > 0) {
      const nextIncompleteIndex = contents.findIndex((c) => !c.completed)
      if (nextIncompleteIndex !== -1) {
        setCurrentContentIndex(nextIncompleteIndex)
        console.log("[v0] Auto-continuing from lesson:", nextIncompleteIndex)
      }
    }
  }, [shouldContinue, contents])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">커리큘럼을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !curriculum) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || "커리큘럼을 찾을 수 없습니다."}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
        </div>
      </div>
    )
  }

  if (contents.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 h-16">
              <Link href={isFromCommunity ? "/community" : "/curriculum"}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">{curriculum.title}</h1>
                  <p className="text-sm text-muted-foreground">콘텐츠가 없습니다</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">아직 콘텐츠가 없습니다</h3>
              <p className="text-muted-foreground mb-4">이 커리큘럼에는 아직 학습 콘텐츠가 추가되지 않았습니다.</p>
              {!isFromCommunity && (
                <Button
                  onClick={() => {
                    console.log("[v0] 첫 번째 영상 추가하기 버튼 클릭됨")
                    console.log("[v0] Current showAddForm state:", showAddForm)
                    setShowAddForm(true)
                    console.log("[v0] showAddForm set to true")
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />첫 번째 영상 추가하기
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Link href={isFromCommunity ? "/community" : "/curriculum"}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  {curriculum.title}
                  {isFromCommunity && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      커뮤니티
                    </Badge>
                  )}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {contents.filter((c) => c.completed).length}/{contents.length} 완료
                </p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <Progress value={curriculum.progress || 0} className="w-32" />

              {isSelectionMode && selectedVideos.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{selectedVideos.length}개 선택됨</Badge>
                  <Button size="sm" onClick={isFromCommunity ? saveSelectedToMyCurriculum : addSelectedToMyCurriculum}>
                    <Copy className="w-4 h-4 mr-2" />
                    {isFromCommunity ? "저장하기" : "내 커리큘럼에 추가"}
                  </Button>
                </div>
              )}

              {isFromCommunity ? (
                <>
                  <Button variant={isPreviewMode ? "default" : "outline"} size="sm" onClick={togglePreviewMode}>
                    <Play className="w-4 h-4 mr-2" />
                    재생해보기
                  </Button>

                  <Button variant={isSelectionMode ? "default" : "outline"} size="sm" onClick={toggleSelectionMode}>
                    {isSelectionMode ? (
                      <>
                        <CheckSquare className="w-4 h-4 mr-2" />
                        선택 완료
                      </>
                    ) : (
                      <>
                        <Square className="w-4 h-4 mr-2" />
                        선택하기
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="default" size="sm" onClick={continueFromLastPosition}>
                    <Play className="w-4 h-4 mr-2" />
                    계속 학습
                  </Button>

                  <Button variant={isSelectionMode ? "default" : "outline"} size="sm" onClick={toggleSelectionMode}>
                    {isSelectionMode ? (
                      <>
                        <CheckSquare className="w-4 h-4 mr-2" />
                        선택 완료
                      </>
                    ) : (
                      <>
                        <Square className="w-4 h-4 mr-2" />
                        비디오 선택
                      </>
                    )}
                  </Button>

                  <Button
                    variant={isEditing ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        완료
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4 mr-2" />
                        편집
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-card-foreground">강의 목록</CardTitle>
                <div className="flex items-center gap-2">
                  {isSelectionMode && (
                    <Button size="sm" variant="outline" onClick={selectAllVideos}>
                      <CheckSquare className="w-4 h-4 mr-2" />
                      {selectedVideos.length === contents.length ? "전체 해제" : "전체 선택"}
                    </Button>
                  )}

                  {!isFromCommunity && (
                    <Button
                      size="sm"
                      variant={showAddForm ? "secondary" : "default"}
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="transition-all duration-200 hover:scale-105"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {showAddForm ? "취소" : "영상 추가"}
                    </Button>
                  )}

                  {(isEditing || isSelectionMode) && (
                    <Badge variant="outline" className="text-xs">
                      {isSelectionMode ? "선택 모드" : "편집 모드"}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isFromCommunity && showAddForm && (
                <Card className="bg-muted/50 border-dashed border-2 border-primary/30">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4 text-primary" />
                      <h4 className="font-medium text-sm text-primary">새 YouTube 영상 추가</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Input
                          placeholder="YouTube URL을 입력하세요 (예: https://www.youtube.com/watch?v=dQw4w9WgXcQ)"
                          value={newVideoUrl}
                          onChange={(e) => setNewVideoUrl(e.target.value)}
                          disabled={isLoadingMetadata}
                          className="font-mono text-sm focus:ring-2 focus:ring-primary/20"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          💡 지원 형식: youtube.com/watch?v=ID, youtu.be/ID
                        </p>
                      </div>
                      <div>
                        <Input
                          placeholder="영상 제목 (선택사항 - 비워두면 자동으로 가져옵니다)"
                          value={newVideoTitle}
                          onChange={(e) => setNewVideoTitle(e.target.value)}
                          disabled={isLoadingMetadata}
                          className="focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={addVideo}
                        disabled={isLoadingMetadata || !newVideoUrl.trim()}
                        className="min-w-[80px] bg-primary hover:bg-primary/90"
                      >
                        {isLoadingMetadata ? (
                          <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                            처리중...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            추가
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setNewVideoUrl("")
                          setNewVideoTitle("")
                          setShowAddForm(false)
                        }}
                        disabled={isLoadingMetadata}
                        className="hover:bg-muted"
                      >
                        <X className="w-4 h-4 mr-2" />
                        취소
                      </Button>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 p-3 rounded-lg border border-primary/10">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        🚀 <strong>자동 기능:</strong> YouTube URL을 입력하면 영상 제목, 썸네일, 채널 정보를 자동으로
                        가져옵니다.
                        <br />⚡ <strong>빠른 추가:</strong> URL만 입력하고 "추가" 버튼을 클릭하세요!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                {contents.map((content, index) => (
                  <div
                    key={content.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      index === currentContentIndex ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"
                    } ${isSelectionMode ? "cursor-default" : "cursor-pointer"}`}
                    onClick={() => !isEditing && !isSelectionMode && setCurrentContentIndex(index)}
                  >
                    {isSelectionMode && (
                      <Checkbox
                        checked={selectedVideos.includes(content.id)}
                        onCheckedChange={() => toggleVideoSelection(content.id)}
                        className="flex-shrink-0"
                      />
                    )}

                    {isEditing && !isSelectionMode && !isFromCommunity && (
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                    )}

                    <div className="flex-shrink-0">
                      {content.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      ) : index === currentContentIndex ? (
                        <Play className="w-5 h-5 text-primary" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {editingContentId === content.id ? (
                        <div className="flex gap-2">
                          <Input
                            defaultValue={content.title}
                            className="text-sm"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                saveTitle(content.id, e.currentTarget.value)
                              }
                              if (e.key === "Escape") {
                                setEditingContentId(null)
                              }
                            }}
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              const input = e.currentTarget.parentElement?.querySelector("input")
                              if (input) saveTitle(content.id, input.value)
                            }}
                          >
                            <Save className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <h4
                            className={`font-medium text-sm truncate ${
                              index === currentContentIndex ? "text-primary" : "text-card-foreground"
                            } ${selectedVideos.includes(content.id) ? "text-primary font-semibold" : ""}`}
                          >
                            {content.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">{content.duration}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" size="sm" className="text-xs">
                        {index + 1}
                      </Badge>

                      {isEditing && !isSelectionMode && !isFromCommunity && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              startEditingTitle(content.id)
                            }}
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteVideo(content.id)
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {showCurriculumSelector && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">어느 커리큘럼에 추가하시겠습니까?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto p-4 text-left bg-transparent"
                    onClick={() => handleAddToCurriculum("new")}
                  >
                    <div>
                      <h4 className="font-medium">새 커리큘럼 만들기</h4>
                      <p className="text-sm text-muted-foreground">선택한 비디오들로 새로운 커리큘럼을 생성합니다</p>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 text-left bg-transparent"
                    onClick={() => handleAddToCurriculum("existing-1")}
                  >
                    <div>
                      <h4 className="font-medium">React 마스터하기</h4>
                      <p className="text-sm text-muted-foreground">기존 커리큘럼에 추가합니다</p>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 text-left bg-transparent"
                    onClick={() => handleAddToCurriculum("existing-2")}
                  >
                    <div>
                      <h4 className="font-medium">영어 회화 완성</h4>
                      <p className="text-sm text-muted-foreground">기존 커리큘럼에 추가합니다</p>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 text-left bg-transparent"
                    onClick={() => handleAddToCurriculum("existing-3")}
                  >
                    <div>
                      <h4 className="font-medium">창업 준비 과정</h4>
                      <p className="text-sm text-muted-foreground">기존 커리큘럼에 추가합니다</p>
                    </div>
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCurriculumSelector(false)
                      setSelectedVideos([])
                      setIsSelectionMode(false)
                    }}
                  >
                    취소
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {(!isSelectionMode || (isFromCommunity && isPreviewMode)) && currentContent && (
            <div className="bg-card border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={prevContent} disabled={currentContentIndex === 0}>
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={togglePlayPause}>
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={nextContent}
                    disabled={currentContentIndex === contents.length - 1}
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{formatTime(currentTime)}</span>
                  <Progress value={progress} className="w-48" />
                  <span className="text-sm text-muted-foreground">{formatTime(duration)}</span>
                </div>
              </div>
              <div ref={playerContainerRef} className="w-full aspect-video bg-black rounded-lg overflow-hidden" />
              {!isFromCommunity && (
                <div className="mt-4">
                  <Textarea
                    placeholder="강의에 대한 노트를 작성하세요..."
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    className="resize-none"
                  />
                  <Button size="sm" onClick={saveNotes} className="mt-2">
                    <Save className="w-4 h-4 mr-2" />
                    노트 저장
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
