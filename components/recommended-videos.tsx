"use client"

import { useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, PlayCircle, Star, TrendingUp, MessageCircle, Eye, Clock } from "lucide-react"

// Mock Data
const RECOMMENDED_VIDEOS = [
  {
    id: "v1",
    title: "2024년 반드시 알아야 할 AI 트렌드 총정리 (완벽 분석)",
    channel: "AI 인사이트",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
    views: "125만회",
    publishedAt: "3일 전",
    duration: "15:24",
    comments: "3.2천",
    tags: ["AI", "Tech"],
    isTrending: true,
  },
  {
    id: "v2",
    title: "코딩 레벨테스트 1단계부터 10단계까지, 당신의 위치는?",
    channel: "개발자 김코딩",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800",
    views: "89만회",
    publishedAt: "1주 전",
    duration: "24:10",
    comments: "1.5천",
    tags: ["Programming", "Career"],
    isTrending: false,
  },
  {
    id: "v3",
    title: "성공하는 사람들의 아침 루틴 (뇌과학적 접근)",
    channel: "라이프해커",
    thumbnail: "https://images.unsplash.com/photo-1499209974431-9dddcece7fdd?auto=format&fit=crop&q=80&w=800",
    views: "210만회",
    publishedAt: "2주 전",
    duration: "18:45",
    comments: "5.1천",
    tags: ["Mindset", "Productivity"],
    isTrending: true,
  },
  {
    id: "v4",
    title: "Figma 기초강좌: 30분만에 끝내는 프로토타이핑",
    channel: "디자인 베이스",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800",
    views: "45만회",
    publishedAt: "5일 전",
    duration: "32:15",
    comments: "840",
    tags: ["Design", "Figma"],
    isTrending: false,
  },
  {
    id: "v5",
    title: "초보자를 위한 주식 투자 가이드 1편",
    channel: "경제유튜버",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800",
    views: "320만회",
    publishedAt: "1개월 전",
    duration: "45:00",
    comments: "1.2만",
    tags: ["Finance", "Investing"],
    isTrending: true,
  }
]

export function RecommendedVideos() {
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth + 100 : scrollLeft + clientWidth - 100
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' })
    }
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-red-500" />
            <span>오늘의 추천 우수 동영상</span>
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            최초 댓글, 조회수가 검증된 관련 트렌드 영상입니다.
          </p>
        </div>
        <div className="hidden sm:flex gap-2">
          <Button variant="outline" size="icon" onClick={() => scroll('left')} className="rounded-full shadow-sm">
             <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => scroll('right')} className="rounded-full shadow-sm">
             <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="relative group">
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {RECOMMENDED_VIDEOS.map((video) => (
            <Card key={video.id} className="min-w-[280px] sm:min-w-[320px] max-w-[320px] flex-shrink-0 snap-start bg-card/50 hover:bg-card border-transparent hover:border-primary/20 transition-all cursor-pointer overflow-hidden group/card shadow-sm hover:shadow-md">
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                />
                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {video.duration}
                </div>
                {/* Trending Badge */}
                {video.isTrending && (
                  <div className="absolute top-2 left-2 bg-red-500/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-bold shadow-lg flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    급상승
                  </div>
                )}
                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center">
                   <PlayCircle className="w-12 h-12 text-white opacity-90 drop-shadow-lg" />
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex gap-3 items-start">
                  {/* Channel Avatar Placeholder */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 shrink-0 mt-1 flex items-center justify-center text-white text-xs font-bold">
                    {video.channel.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[15px] line-clamp-2 leading-snug group-hover/card:text-primary transition-colors">
                      {video.title}
                    </h3>
                    <div className="text-xs text-muted-foreground mt-1.5 line-clamp-1">
                      {video.channel}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1">
                      <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {video.views}</span>
                      <span>•</span>
                      <span>{video.publishedAt}</span>
                    </div>
                    {/* Extra Engagement Info */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                       <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary hover:bg-primary/20 transition-colors pointer-events-none px-1.5 py-0 shadow-none">
                         <MessageCircle className="w-3 h-3 mr-1" />
                         댓글 {video.comments}
                       </Badge>
                       <div className="flex gap-1">
                         {video.tags.slice(0, 1).map(tag => (
                           <span key={tag} className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md font-medium">#{tag}</span>
                         ))}
                       </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
