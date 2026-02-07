"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Loader2, Play, Plus, User, Youtube, ExternalLink, Share2, Check } from "lucide-react"

interface VideoResult {
  id: string
  title: string
  thumbnail: string
  url: string
  duration: string
  views: string
  channel: {
    name: string
    avatar: string
  }
  uploadedAt: string
}

interface YouTubeAdvancedSearchProps {
  onAdd: (videoData: {
    videoId: string
    title: string
    author: string
    thumbnail: string
    url: string
  }) => void
  onCancel: () => void
  initialQuery?: string
}

export function YouTubeAdvancedSearch({ onAdd, onCancel, initialQuery = "" }: YouTubeAdvancedSearchProps) {
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<VideoResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [previewVideo, setPreviewVideo] = useState<VideoResult | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  
  const handleSearch = async (overrideQuery?: string) => {
    const searchQuery = overrideQuery || query
    if (!searchQuery.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchQuery)}`)
      if (!response.ok) throw new Error('Search failed')
      const data = await response.json()
      if (data.videos) {
        setResults(data.videos)
      }
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handlePreview = (video: VideoResult) => {
    setPreviewVideo(video)
    setIsCopied(false)
  }

  const handleShare = () => {
    if (previewVideo) {
      navigator.clipboard.writeText(previewVideo.url)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const handleAddVideo = () => {
    if (previewVideo) {
      onAdd({
        videoId: previewVideo.id,
        title: previewVideo.title,
        author: previewVideo.channel.name,
        thumbnail: previewVideo.thumbnail,
        url: previewVideo.url,
      })
      setPreviewVideo(null)
    }
  }

  const handleSearchChannel = () => {
    if (previewVideo) {
      const channelName = previewVideo.channel.name
      setQuery(channelName) // Update search bar
      setPreviewVideo(null) // Close modal
      handleSearch(channelName) // Trigger search
      // Note: A more advanced implementation might use a specific channel search API, 
      // but searching by channel name often yields good results for user intent "more from this creator".
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="검색어를 입력하세요 (예: React 기초, 김민준 강사)"
            className="pl-10 h-10"
          />
        </div>
        <Button onClick={() => handleSearch()} disabled={isLoading} className="gradient-violet h-10 w-24">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "검색"}
        </Button>
      </div>

      {/* Results Grid */}
      <ScrollArea className="h-[400px] pr-4 border rounded-md p-2">
        {results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {results.map((video) => (
              <Card 
                key={video.id} 
                className="cursor-pointer hover:border-primary transition-all group overflow-hidden border-border/50 bg-card/50"
                onClick={() => handlePreview(video)}
              >
                <div className="relative aspect-video">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform">
                        <Play className="w-6 h-6 text-white fill-current ml-1" />
                    </div>
                  </div>
                  <Badge variant="secondary" className="absolute bottom-2 right-2 bg-black/70 text-white border-none text-xs px-1.5 h-5">
                    {video.duration}
                  </Badge>
                </div>
                <CardContent className="p-3">
                  <h4 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-snug">
                    {video.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1 min-w-0">
                      <User className="w-3 h-3 shrink-0" />
                      <span className="truncate">{video.channel.name}</span>
                    </div>
                    <span className="shrink-0">•</span>
                    <span className="shrink-0">{video.views} views</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                <Youtube className="w-8 h-8 opacity-40" />
            </div>
            <div className="text-center">
                <p className="font-medium">동영상 검색</p>
                <p className="text-sm opacity-70">원하는 강의나 주제를 검색해보세요.</p>
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Preview Modal */}
      {previewVideo && (
        <Dialog open={!!previewVideo} onOpenChange={(open) => !open && setPreviewVideo(null)}>
            <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
                <DialogTitle>영상 미리보기</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
                {/* Video Player */}
                <div className="aspect-video bg-black rounded-lg overflow-hidden relative shadow-lg">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${previewVideo.id}?autoplay=1`}
                      title={previewVideo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0"
                    />
                </div>

                {/* Video Details */}
                <div className="space-y-2">
                    <h3 className="text-lg font-bold line-clamp-2">{previewVideo.title}</h3>
                    <div className="flex items-center flex-wrap gap-2 text-sm">
                        <Badge variant="secondary" className="flex items-center gap-1 hover:bg-secondary/80">
                            <User className="w-3 h-3" />
                            {previewVideo.channel.name}
                        </Badge>
                        <span className="text-muted-foreground">
                            조회수 {previewVideo.views} • {previewVideo.duration} • {previewVideo.uploadedAt}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-2">
                    <Button onClick={handleAddVideo} className="w-full gradient-violet h-12 text-base font-medium">
                        <Plus className="w-5 h-5 mr-2" />
                        커리큘럼에 추가
                    </Button>
                    <div className="flex gap-2 w-full">
                        <Button variant="outline" onClick={handleSearchChannel} className="flex-1 h-12">
                            <Search className="w-4 h-4 mr-2" />
                            이 채널 더보기
                        </Button>
                        <Button variant="outline" onClick={handleShare} className="flex-1 h-12">
                            {isCopied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Share2 className="w-4 h-4 mr-2" />}
                            {isCopied ? "복사됨" : "공유하기"}
                        </Button>
                        <Button variant="ghost" onClick={() => window.open(previewVideo.url, '_blank')} className="px-3 h-12" title="YouTube에서 보기">
                            <ExternalLink className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>
            </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
