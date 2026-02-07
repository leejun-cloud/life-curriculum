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
  Search, // Added Search
} from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { getCurriculum } from "@/lib/firebase-collections"
import { extractYouTubeId } from "@/lib/youtube-utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" // Added Tabs

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

  // Search State
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      if (data.videos) {
        setSearchResults(data.videos)
      }
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const addVideoFromSearch = async (video: any) => {
    const newContent = {
      id: contents.length > 0 ? Math.max(...contents.map((c) => c.id)) + 1 : 1,
      title: video.title,
      duration: video.duration, 
      completed: false,
      videoId: video.id,
      url: video.url,
      notes: "",
      thumbnail: video.thumbnail,
      description: video.title, 
      author: video.channel.name,
    }

    const updatedContents = [...contents, newContent]
    setContents(updatedContents)
    
     try {
        const { updateCurriculum } = await import("@/lib/firebase-collections")
        await updateCurriculum(params.id, {
          contents: updatedContents,
          updatedAt: new Date().toISOString(),
        })
      } catch (firebaseError) {
        console.error("Error saving to Firebase:", firebaseError)
      }

    alert(`✅ 추가됨: ${video.title}`)
  }

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

      await updateProgress(user.id, params.id, currentContent.id, {
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
      
      // Load user progress
      let userProgressMap: Record<number, any> = {}
      try {
         const { getCurriculumProgress } = await import("@/lib/firebase-collections")
         const progressList = await getCurriculumProgress(user.id, params.id)
         progressList.forEach((p: any) => {
             userProgressMap[p.contentId] = p
         })
      } catch (e) {
         console.error("Error loading progress:", e)
      }

      const curriculumContents = (curriculumData.contents || []).map((content: any) => {
        const userP = userProgressMap[content.id]
        
        // If videoId already exists, use it
        let videoId = content.videoId
        if (!videoId) {
           videoId = extractYouTubeId(content.url)
        }

        return {
          ...content,
          videoId: videoId || undefined,
          // Override with user progress details
          completed: userP ? (userP.progress > 90 || content.completed) : content.completed, 
          progress: userP ? userP.progress : 0,
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

  // Load Notes and Progress for current content
  useEffect(() => {
    if (!currentContent || !user) {
        // Try local storage for notes if no user
        if (currentContent) {
            const localNote = localStorage.getItem(`note_${params.id}_${currentContent.id}`)
            if (localNote) setUserNotes(localNote)
            else setUserNotes("")
        }
        return
    }

    const loadUserData = async () => {
        try {
            const { getUserNote, getProgress } = await import("@/lib/firebase-collections")
            
            // Load Note
            const note = await getUserNote(user.id, params.id, currentContent.id)
            setUserNotes(note || "")

            // Load Progress
            const progressData = await getProgress(user.id, params.id, currentContent.id)
            
            if (progressData) {
                console.log("[v0] Found saved progress for this content:", progressData.currentTime)
                if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
                    playerRef.current.seekTo(progressData.currentTime)
                }
            }
        } catch (e) {
            console.error("Error loading user data:", e)
        }
    }
    loadUserData()
  }, [currentContent, user, params.id])

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

  const deleteVideo = async (contentId: number) => {
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

    if (user) {
      try {
        const { updateCurriculum } = await import("@/lib/firebase-collections")
        await updateCurriculum(params.id, {
          contents: updatedContents,
          updatedAt: new Date().toISOString(),
        })
      } catch (error) {
        console.error("[v0] Error updating curriculum (delete):", error)
        // If fail, maybe revert state or alert user? For now just log.
      }
    }
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
    
    if (user) {
       import("@/lib/firebase-collections").then(({ saveNote }) => {
          saveNote(user.id, params.id, currentContent.id, userNotes)
            .then(() => alert("노트가 저장되었습니다!"))
            .catch(err => {
               console.error("Error saving note:", err)
               alert("노트 저장 실패")
            })
       })
    } else {
       // Local only fallback or prompt login
       localStorage.setItem(`note_${params.id}_${currentContent.id}`, userNotes)
       alert("노트가 로컬에 저장되었습니다 (로그인 필요)")
    }
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
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
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
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                  {curriculum.title}
                  {isFromCommunity && (
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                      커뮤니티
                    </Badge>
                  )}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {contents.filter((c) => c.completed).length}/{contents.length} 강의 완료
                </p>
              </div>
            </div>
            <div className="ml-auto hidden md:flex items-center gap-4">
               {/* Progress Bar in Header - Optional or Simplified */}
              <div className="flex items-center gap-2">
                 <span className="text-xs text-muted-foreground">{Math.round(curriculum.progress || 0)}%</span>
                 <Progress value={curriculum.progress || 0} className="w-24 h-2" />
              </div>

              {isSelectionMode && selectedVideos.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{selectedVideos.length}개 선택됨</Badge>
                  <Button size="sm" onClick={isFromCommunity ? saveSelectedToMyCurriculum : addSelectedToMyCurriculum}>
                    <Copy className="w-4 h-4 mr-2" />
                    {isFromCommunity ? "저장하기" : "내 커리큘럼에 추가"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column: Player & Active Content */}
          <div className="lg:col-span-2 space-y-6 order-1">
             {(!isSelectionMode || (isFromCommunity && isPreviewMode)) && currentContent ? (
                <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm sticky top-20 z-10">
                   {/* Player Container */}
                   <div ref={playerContainerRef} className="w-full aspect-video bg-black" />
                   
                   {/* Player Controls & Info */}
                   <div className="p-4 md:p-6 space-y-4">
                      <div className="flex items-center justify-between">
                         <h2 className="text-xl font-bold truncate pr-4">{currentContent.title}</h2>
                         <div className="flex items-center gap-2 shrink-0">
                            <Button size="sm" variant="ghost" onClick={prevContent} disabled={currentContentIndex === 0}>
                              <SkipBack className="w-5 h-5" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={togglePlayPause}>
                              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={nextContent} disabled={currentContentIndex === contents.length - 1}>
                              <SkipForward className="w-5 h-5" />
                            </Button>
                         </div>
                      </div>
                      
                      {/* Timeline */}
                      <div className="flex items-center gap-3">
                         <span className="text-xs text-muted-foreground font-mono w-10 text-right">{formatTime(currentTime)}</span>
                         <Progress value={progress} className="h-1.5 flex-1" />
                         <span className="text-xs text-muted-foreground font-mono w-10">{formatTime(duration)}</span>
                      </div>

                      {/* Video Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                         <div className="flex items-center gap-2">
                             <Badge variant="outline" className="font-normal">
                                {currentContent.author || "YouTube"}
                             </Badge>
                             {currentContent.completed && (
                                <Badge variant="default" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200">
                                   <CheckCircle2 className="w-3 h-3 mr-1" /> 완료됨
                                </Badge>
                             )}
                         </div>
                         <div className="flex gap-2">
                             <Button size="sm" variant="outline" onClick={markAsComplete}>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                {currentContent.completed ? "완료 해제" : "완료 표시"}
                             </Button>
                         </div>
                      </div>
                   </div>

                   {/* Notes Section - Collapsible or Inline */}
                   {!isFromCommunity && (
                      <div className="px-4 pb-4 md:px-6 md:pb-6">
                        <div className="bg-muted/30 rounded-lg p-3">
                           <div className="flex items-center justify-between mb-2">
                              <h3 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                                 <Edit3 className="w-4 h-4" /> 내 노트
                              </h3>
                              <Button size="sm" variant="ghost" onClick={saveNotes} className="h-7 text-xs">저장</Button>
                           </div>
                           <Textarea
                             placeholder="이 강의에 대한 중요 포인트나 메모를 남겨보세요..."
                             value={userNotes}
                             onChange={(e) => setUserNotes(e.target.value)}
                             className="min-h-[80px] text-sm resize-y bg-background border-border/50"
                           />
                        </div>
                      </div>
                   )}
                </div>
             ) : (
                <div className="aspect-video bg-muted rounded-xl flex items-center justify-center border border-border">
                   <div className="text-center p-6">
                      <Play className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground">재생할 영상을 선택해주세요</p>
                      {isSelectionMode && <p className="text-primary text-sm mt-2">비디오 선택 모드입니다</p>}
                   </div>
                </div>
             )}
          </div>

          {/* Right Column: Playlist */}
          <div className="lg:col-span-1 order-2 h-full">
            <div className="lg:sticky lg:top-20 flex flex-col gap-4 max-h-[calc(100vh-6rem)]">
              {/* List Header */}
              <Card className="border-border shadow-sm shrink-0">
                  <CardHeader className="py-4 px-5">
                    <div className="flex items-center justify-between">
                       <CardTitle className="text-base font-bold">커리큘럼 목록</CardTitle>
                       
                       <div className="flex items-center gap-1">
                          {isSelectionMode && (
                             <Button size="sm" variant="ghost" onClick={selectAllVideos} className="h-8 text-xs">
                                {selectedVideos.length === contents.length ? "해제" : "전체"}
                             </Button>
                          )}
                           {!isFromCommunity && (
                            <Button size="sm" variant="ghost" onClick={() => setShowAddForm(!showAddForm)} className="h-8 w-8 p-0">
                               <Plus className="w-4 h-4" />
                            </Button>
                           )}
                           <Button size="sm" variant="ghost" onClick={toggleSelectionMode} className="h-8 w-8 p-0">
                               {isSelectionMode ? <CheckSquare className="w-4 h-4 text-primary" /> : <CheckSquare className="w-4 h-4" />}
                           </Button>
                       </div>
                    </div>
                  </CardHeader>
                  
                  {/* Add Form (Inline) */}
                  {showAddForm && (
                     <div className="px-4 pb-4 border-b border-border/50 animate-in slide-in-from-top-2">
                       <Card className="bg-muted/50 border-dashed border-primary/20">
                         <CardContent className="p-3">
                           <Tabs defaultValue="url" className="w-full">
                              <TabsList className="grid w-full grid-cols-2 mb-3 h-8">
                                <TabsTrigger value="url" className="text-xs">링크로 추가</TabsTrigger>
                                <TabsTrigger value="search" className="text-xs">검색으로 추가</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="url" className="space-y-2 mt-0">
                                 <Input
                                   placeholder="YouTube URL..."
                                   value={newVideoUrl}
                                   onChange={(e) => setNewVideoUrl(e.target.value)}
                                   className="h-8 text-xs bg-background"
                                   onKeyDown={(e) => e.key === "Enter" && addVideo()}
                                 />
                                 <div className="flex justify-end gap-2">
                                   <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)} className="h-7 text-xs">취소</Button>
                                   <Button size="sm" onClick={addVideo} disabled={isLoadingMetadata} className="h-7 text-xs bg-primary text-primary-foreground">
                                     {isLoadingMetadata ? "..." : "추가"}
                                   </Button>
                                 </div>
                              </TabsContent>

                              <TabsContent value="search" className="mt-0">
                                 <YouTubeAdvancedSearch 
                                    onAdd={(videoData) => {
                                       addVideoFromSearch({
                                          id: videoData.videoId,
                                          title: videoData.title,
                                          thumbnail: videoData.thumbnail,
                                          channel: { name: videoData.author, avatar: "" }, // Avatar might be missing but handled
                                          duration: "0:00", // Duration might need parsing or be passed
                                          views: "0",
                                          uploadedAt: ""
                                       })
                                    }}
                                    onCancel={() => {}}
                                 />
                              </TabsContent>
                           </Tabs>
                         </CardContent>
                       </Card>
                     </div>
                  )}
              </Card>

              {/* Scrollable List */}
              <Card className="border-border shadow-sm flex-1 overflow-hidden flex flex-col">
                 <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {contents.map((content, index) => {
                       const isActive = index === currentContentIndex && !isSelectionMode;
                       return (
                          <div
                            key={content.id}
                            id={`content-${index}`}
                            className={`
                               group relative flex gap-3 p-3 rounded-lg transition-all border-l-4
                               ${isActive 
                                 ? "bg-primary/5 border-primary" 
                                 : "border-transparent hover:bg-muted/50"
                               }
                               ${content.completed ? "opacity-75 hover:opacity-100" : ""}
                               cursor-pointer
                            `}
                            onClick={() => {
                               if (isSelectionMode) toggleVideoSelection(content.id)
                               else if (!isEditing) setCurrentContentIndex(index)
                            }}
                          >
                             {/* Selecting / Status Icon */}
                             <div className="shrink-0 flex items-start pt-1">
                                {isSelectionMode ? (
                                   <Checkbox 
                                     checked={selectedVideos.includes(content.id)}
                                     onCheckedChange={() => toggleVideoSelection(content.id)}
                                   />
                                ) : (
                                   isActive ? (
                                      <div className="relative">
                                        <div className="w-4 h-4 rounded-full bg-primary/20 animate-ping absolute inset-0" />
                                        <Play className="w-4 h-4 text-primary relative z-10 fill-current" />
                                      </div>
                                   ) : content.completed ? (
                                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                                   ) : (
                                      <span className="text-xs font-mono text-muted-foreground w-4 text-center">{index + 1}</span>
                                   )
                                )}
                             </div>
                             
                             {/* Details */}
                             <div className="flex-1 min-w-0">
                                <h4 className={`text-sm font-medium leading-tight mb-1 line-clamp-2 ${isActive ? "text-primary" : "text-foreground"}`}>
                                   {content.title}
                                </h4>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                   <span>{content.duration}</span>
                                </div>
                                
                                {/* Item Progress Bar (Fake or Real if we track individual progress detailedly) */}
                                {content.completed && (
                                   <div className="mt-2 h-1 w-full bg-green-500/20 rounded-full overflow-hidden">
                                      <div className="h-full bg-green-500 w-full" />
                                   </div>
                                )}
                             </div>

                             {/* Actions (Hover) */}
                             {!isFromCommunity && !isSelectionMode && (
                                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-background/80 backdrop-blur rounded-md p-0.5">
                                   <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); deleteVideo(content.id); }}>
                                      <Trash2 className="w-3 h-3 text-destructive" />
                                   </Button>
                                </div>
                             )}
                          </div>
                       )
                    })}
                 </div>
              </Card>
            </div>
          </div>

        </div>

        {/* Modal for Curriculum Selection (preserved logic) */}
        {showCurriculumSelector && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
               <Card className="w-full max-w-lg bg-background border-border shadow-xl">
                  <CardHeader>
                     <CardTitle>저장할 커리큘럼 선택</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <p>선택한 {selectedVideos.length}개의 영상을 어디에 저장할까요?</p>
                     <div className="grid gap-2">
                        <Button variant="outline" className="justify-start h-auto py-3" onClick={() => handleAddToCurriculum("new")}>
                           <Plus className="w-4 h-4 mr-2" /> 새 커리큘럼 만들기
                        </Button>
                        <Button variant="outline" className="justify-start h-auto py-3" onClick={() => handleAddToCurriculum("existing")}>
                           <BookOpen className="w-4 h-4 mr-2" /> 기존 커리큘럼에 추가 (기능 준비중)
                        </Button>
                     </div>
                     <div className="flex justify-end pt-2">
                        <Button variant="ghost" onClick={() => setShowCurriculumSelector(false)}>취소</Button>
                     </div>
                  </CardContent>
               </Card>
            </div>
        )}
      </div>
    </div>
  )
}
