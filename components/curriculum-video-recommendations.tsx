"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, PlayCircle, Plus } from "lucide-react"

interface CurriculumVideoRecommendationsProps {
  topic: string
  onAddVideo?: (videoData: any) => void
}

export function CurriculumVideoRecommendations({ topic, onAddVideo }: CurriculumVideoRecommendationsProps) {
  const [videos, setVideos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!topic) return

    async function fetchRecommendations() {
      setIsLoading(true)
      try {
        // Use our search API with the topic
        const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(topic + " 강의")}`)
        if (res.ok) {
          const data = await res.json()
          setVideos(data.videos?.slice(0, 8) || [])
        }
      } catch (error) {
        console.error("Failed to fetch curriculum recommendations:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchRecommendations()
  }, [topic])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (videos.length === 0) return null

  return (
    <div className="space-y-4 mt-8">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        이 커리큘럼에 추천하는 영상
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden group flex flex-col hover:border-primary/40 transition-colors">
            <div className="relative aspect-video">
              <img 
                src={video.thumbnail} 
                alt={video.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <PlayCircle className="w-10 h-10 text-white" />
              </div>
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                {video.duration}
              </div>
            </div>
            <div className="p-3 flex flex-col flex-1">
              <h4 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                {video.title}
              </h4>
              <p className="text-xs text-muted-foreground mb-3">{video.channel?.name}</p>
              <div className="mt-auto">
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="w-full text-xs h-8"
                  onClick={() => {
                    if (onAddVideo) {
                      onAddVideo(video)
                    }
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  커리큘럼에 바로 담기
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
