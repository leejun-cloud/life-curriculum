"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Plus, BookOpen, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { getUserCurriculums, updateCurriculum, createCurriculum } from "@/lib/firebase-collections"
import { extractYouTubeId } from "@/lib/youtube-utils"

interface CurriculumSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  videoData: any
}

export function CurriculumSelectorModal({ isOpen, onClose, videoData }: CurriculumSelectorModalProps) {
  const { user } = useAuth()
  const [curriculums, setCurriculums] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [successCurriculumId, setSuccessCurriculumId] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && user) {
      fetchCurriculums()
    }
  }, [isOpen, user])

  const fetchCurriculums = async () => {
    setIsLoading(true)
    try {
      const data = await getUserCurriculums(user!.id)
      setCurriculums(data)
    } catch (error) {
      console.error("Failed to load curriculums:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveToCurriculum = async (curriculum: any) => {
    if (!user || !videoData) return
    setIsSaving(true)

    try {
      // Create new content object
      const currentContents = curriculum.contents || []
      const newId = currentContents.length > 0 ? Math.max(...currentContents.map((c: any) => c.id)) + 1 : 1
      
      const newContent = {
        id: newId,
        title: videoData.title || "새로운 YouTube 영상",
        duration: videoData.duration || "0:00",
        completed: false,
        videoId: videoData.videoId || extractYouTubeId(videoData.url) || videoData.id || "",
        url: videoData.url || (videoData.id ? `https://www.youtube.com/watch?v=${videoData.id}` : ""),
        notes: "",
        thumbnail: videoData.thumbnail || "",
        description: videoData.description || "",
        author: videoData.author || videoData.channel?.name || "Unknown",
        views: videoData.views || "0"
      }

      const updatedContents = [...currentContents, newContent]

      await updateCurriculum(curriculum.id, {
        contents: updatedContents,
        updatedAt: new Date().toISOString()
      })

      setSuccessCurriculumId(curriculum.id)
      setTimeout(() => {
        onClose()
        setSuccessCurriculumId(null)
      }, 1500)

    } catch (error) {
      console.error("Failed to save to curriculum:", error)
      alert("저장 중 오류가 발생했습니다.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateNewAndSave = async () => {
    if (!user || !videoData) return
    setIsSaving(true)

    try {
        const title = prompt("새로운 커리큘럼 제목을 입력하세요:", `${videoData.title} 학습 노트`)
        if (!title) {
            setIsSaving(false)
            return
        }

        const newId = 1
        const newContent = {
            id: newId,
            title: videoData.title || "새로운 YouTube 영상",
            duration: videoData.duration || "0:00",
            completed: false,
            videoId: videoData.videoId || extractYouTubeId(videoData.url) || videoData.id || "",
            url: videoData.url || (videoData.id ? `https://www.youtube.com/watch?v=${videoData.id}` : ""),
            notes: "",
            thumbnail: videoData.thumbnail || "",
            description: videoData.description || "",
            author: videoData.author || videoData.channel?.name || "Unknown",
            views: videoData.views || "0"
        }

        const curriculumData = {
            title: title,
            description: "YouTube 추천 영상을 통해 생성된 커리큘럼입니다.",
            category: "기타",
            tags: [],
            isPublic: false,
            contents: [newContent]
        }

        await createCurriculum(user.id, curriculumData)
        
        setSuccessCurriculumId("new")
        setTimeout(() => {
            onClose()
            setSuccessCurriculumId(null)
        }, 1500)

    } catch (error) {
        console.error("Failed to create and save:", error)
        alert("저장 중 오류가 발생했습니다.")
    } finally {
        setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md bg-background border-border shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle>어떤 커리큘럼에 담을까요?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 bg-muted/30 p-2 rounded-lg items-center">
             <img src={videoData?.thumbnail} alt="" className="w-16 h-10 object-cover rounded shadow-sm" />
             <p className="text-sm font-medium line-clamp-1 flex-1">{videoData?.title}</p>
          </div>

          {!user ? (
            <div className="py-8 text-center text-muted-foreground">
               커리큘럼에 담으려면 먼저 로그인해주세요.
            </div>
          ) : isLoading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              <ScrollArea className="h-[240px] pr-3">
                <div className="space-y-2">
                    {curriculums.map((curr) => (
                    <Button 
                        key={curr.id}
                        variant="outline" 
                        className="w-full justify-start h-auto py-3 relative group overflow-hidden border-border/50 hover:border-primary/50 transition-all" 
                        onClick={() => handleSaveToCurriculum(curr)}
                        disabled={isSaving}
                    >
                        {successCurriculumId === curr.id ? (
                          <CheckCircle2 className="w-4 h-4 mr-3 text-green-500" />
                        ) : (
                          <BookOpen className="w-4 h-4 mr-3 text-muted-foreground group-hover:text-primary transition-colors" />
                        )}
                        <div className="flex flex-col items-start gap-1">
                          <span className="font-semibold">{curr.title}</span>
                          <span className="text-xs text-muted-foreground">{curr.contents?.length || 0}개의 영상</span>
                        </div>
                    </Button>
                    ))}
                    
                    {curriculums.length === 0 && (
                        <div className="text-sm text-center py-4 text-muted-foreground">
                            생성된 커리큘럼이 없습니다.
                        </div>
                    )}
                </div>
              </ScrollArea>

              <div className="border-t border-border pt-3">
                <Button 
                    variant="ghost" 
                    className="w-full border border-dashed border-primary/30 text-primary hover:bg-primary/10" 
                    onClick={handleCreateNewAndSave}
                    disabled={isSaving}
                >
                    <Plus className="w-4 h-4 mr-2" /> 새 커리큘럼 만들어서 담기
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button variant="ghost" onClick={onClose} disabled={isSaving}>닫기</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
