"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Search,
  BookOpen,
  Plus,
  Play,
  Clock,
  Eye,
  MoreVertical,
  CheckSquare
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

function ExplorePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [level, setLevel] = useState("all")
  const [duration, setDuration] = useState("all")
  
  const [videos, setVideos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // Search effect
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery)
    }
  }, [initialQuery])

  const performSearch = async (query: string) => {
    if (!query.trim()) return

    setIsLoading(true)
    setError("")
    setVideos([])
    setSelectedItems([])
    
    try {
      const params = new URLSearchParams()
      params.append('q', query)
      if (level !== 'all') params.append('level', level)
      
      const res = await fetch(`/api/youtube/search?${params.toString()}`)
      const data = await res.json()
      
      if (data.error) throw new Error(data.error)
      
      // Client-side duration filtering (simple string match for MVP)
      let filteredVideos = data.videos || []
      if (duration !== 'all') {
         // duration string from ytsr is like "10:05", "4:30"
         // This is a naive filter. For robust filtering we'd parse this.
         // MVP: Skip strict duration filtering or implement basic logic
         if (duration === 'short') { // < 10 mins
            filteredVideos = filteredVideos.filter((v: any) => {
               const parts = v.duration?.split(':')
               return parts && parts.length === 2 && parseInt(parts[0]) < 10
            })
         } else if (duration === 'medium') { // 10-30 mins
             filteredVideos = filteredVideos.filter((v: any) => {
               const parts = v.duration?.split(':')
               return parts && (
                  (parts.length === 2 && parseInt(parts[0]) >= 10) || 
                  (parts.length === 2 && parseInt(parts[0]) < 30)
               )
            })
         }
      }

      setVideos(filteredVideos)
    } catch (err) {
      console.error(err)
      setError("동영상을 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(searchQuery)
  }

  const toggleSelect = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handleCreateCurriculum = () => {
    if (selectedItems.length === 0) return
    
    // Pass selected videos to creation page via LocalStorage
    const selectedVideos = videos.filter(v => selectedItems.includes(v.id))
    localStorage.setItem("temp_curriculum_videos", JSON.stringify(selectedVideos))
    
    router.push("/curriculum/create?source=explore")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <header className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            
            <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full flex items-center gap-2">
              <Search className="absolute left-3 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="어떤 강의를 찾고 계신가요?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 mr-2"
              />
              <Button type="submit" className="gradient-violet">검색</Button>
            </form>

            <div className="flex gap-2 w-full md:w-auto">
               <Select value={level} onValueChange={(v) => { setLevel(v); if(searchQuery) performSearch(searchQuery); }}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="난이도" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 난이도</SelectItem>
                  <SelectItem value="wangchobo">왕초보</SelectItem>
                  <SelectItem value="beginner">초급</SelectItem>
                  <SelectItem value="intermediate">중급</SelectItem>
                  <SelectItem value="advanced">고급</SelectItem>
                  <SelectItem value="expert">전문가</SelectItem>
                </SelectContent>
              </Select>

              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="w-[120px]">
                   <SelectValue placeholder="길이" />
                </SelectTrigger>
                 <SelectContent>
                  <SelectItem value="all">전체 길이</SelectItem>
                  <SelectItem value="short">10분 미만</SelectItem>
                  <SelectItem value="medium">10분~30분</SelectItem>
                  <SelectItem value="long">30분 이상</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[60vh]">
        {/* Bulk Action Bar */}
        {selectedItems.length > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5">
            <div className="bg-foreground text-background px-6 py-3 rounded-full shadow-2xl flex items-center gap-4">
              <span className="font-bold">{selectedItems.length}개 선택됨</span>
              <div className="h-4 w-px bg-background/20" />
              <Button 
                size="sm" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
                onClick={handleCreateCurriculum}
              >
                <Plus className="w-4 h-4 mr-2" />
                커리큘럼 만들기
              </Button>
              <Button 
                size="sm" variant="ghost" className="text-background hover:bg-background/20 rounded-full"
                onClick={() => setSelectedItems([])}
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                해제
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">유튜브에서 강의를 찾고 있습니다...</p>
          </div>
        ) : error ? (
           <div className="text-center py-20">
             <p className="text-destructive mb-2">{error}</p>
             <Button variant="outline" onClick={() => performSearch(searchQuery)}>다시 시도</Button>
           </div>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Card 
                key={video.id} 
                className={`
                  relative border transition-all cursor-pointer group bg-card
                  ${selectedItems.includes(video.id) ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border hover:border-primary/50'}
                `}
                onClick={() => toggleSelect(video.id)}
              >
                <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
                  {video.thumbnail ? (
                    <Image 
                       src={video.thumbnail} 
                       alt={video.title} 
                       fill
                       className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Checkbox 
                      checked={selectedItems.includes(video.id)}
                      className={`
                        w-6 h-6 border-2 border-white data-[state=checked]:bg-primary data-[state=checked]:border-primary shadow-sm
                        ${selectedItems.includes(video.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                        transition-opacity
                      `}
                    />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold line-clamp-2 mb-2 leading-tight group-hover:text-primary transition-colors">
                    {video.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-3">
                    {video.channel?.avatar && (
                      <Image 
                        src={video.channel.avatar} 
                        alt={video.channel.name} 
                        width={24} height={24} 
                        className="rounded-full"
                      />
                    )}
                    <span className="text-xs text-muted-foreground truncate">{video.channel?.name}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{video.views}</span>
                    </div>
                     <div className="flex items-center gap-1">
                      <span className="text-xs rounded-full bg-secondary/30 text-secondary-foreground px-2 py-0.5">
                        추천
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card/50 rounded-2xl border border-dashed">
            <Search className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">검색 결과가 없습니다</h2>
            <p className="text-muted-foreground mb-6">다른 키워드나 필터로 다시 검색해보세요.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ExplorePageContent />
    </Suspense>
  )
}
