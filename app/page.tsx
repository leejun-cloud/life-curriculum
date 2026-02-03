"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  PlayCircle,
  TrendingUp,
  Award,
  BookOpen
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { motion } from "framer-motion"

// Mock data
const POPULAR_TOPICS = ["React", "Python", "UX Design", "Marketing", "Data Science", "Writing"]

const RECOMMENDED_CURRICULUMS = [
  {
    id: "1",
    title: "React 완벽 가이드",
    author: "김철수",
    progress: 0,
    thumbnail: "/placeholder.svg",
    category: "Development"
  },
  {
    id: "2",
    title: "Python 데이터 분석",
    author: "이영희",
    progress: 35,
    thumbnail: "/placeholder.svg",
    category: "Data Science"
  }
]

const LIVE_ACTIVITIES = [
  { user: "Sarah", action: "started", target: "UX Design Basics", time: "2m ago" },
  { user: "Mike", action: "finished", target: "React Hooks", time: "5m ago" },
  { user: "Jin", action: "forked", target: "Python Master Class", time: "12m ago" },
]

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Search-Centric Hero Section */}
      <section className="relative pt-20 pb-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center overflow-hidden">
        
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent -z-10" />
        <div className="absolute top-20 right-10 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute top-40 left-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: "1s" }} />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl w-full space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              <span className="text-gradient-violet">무엇을 배우고 싶으세요?</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              나만의 커리큘럼을 만들고, 함께 성장하는 즐거움을 경험하세요.
            </p>
          </div>

          {/* Large Search Bar */}
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto w-full group">
            <div className={`
              absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-2xl opacity-20 blur-lg transition-opacity duration-300
              ${searchQuery ? "opacity-40" : "group-hover:opacity-30"}
            `} />
            <div className="relative flex items-center bg-card border border-border/50 rounded-2xl shadow-xl overflow-hidden p-2">
              <Search className="w-6 h-6 text-muted-foreground ml-4" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Python, React, 마케팅, 디자인..." 
                className="flex-1 border-none shadow-none focus-visible:ring-0 text-lg h-14 bg-transparent px-4"
              />
              <Button type="submit" size="lg" className="rounded-xl gradient-violet h-12 px-8">
                검색
              </Button>
            </div>
          </form>

          {/* Popular Topics Pills */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            <span className="text-sm text-muted-foreground mr-2 py-1">인기 주제:</span>
            {POPULAR_TOPICS.map((topic) => (
              <Button 
                key={topic} 
                variant="outline" 
                size="sm" 
                className="rounded-full bg-background/50 hover:bg-muted"
                onClick={() => setSearchQuery(topic)}
              >
                {topic}
              </Button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Personalized Section for Logged In Users */}
      {user && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <span className="text-gradient-violet">이어서 학습하기</span>
            </h2>
            <Link href="/my-dashboard">
              <Button variant="ghost" className="text-muted-foreground hover:text-primary">
                내 대시보드 <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {/* Simulating active curriculums */}
             <Card className="bg-card/50 border-primary/20 hover:border-primary/40 transition-all cursor-pointer group">
               <CardContent className="p-6 flex gap-4 items-center">
                 <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                   <PlayCircle className="w-8 h-8 text-primary" />
                 </div>
                 <div className="flex-1">
                   <h3 className="font-semibold group-hover:text-primary transition-colors">React 완벽 가이드</h3>
                   <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                     <span>진행률 45%</span>
                     <span>20분 전</span>
                   </div>
                   <div className="h-1.5 w-full bg-muted rounded-full mt-2 overflow-hidden">
                     <div className="h-full bg-primary w-[45%]" />
                   </div>
                 </div>
               </CardContent>
             </Card>
             
             {/* Recommendation Card */}
             <Card className="bg-muted/30 border-dashed border-border hover:border-primary/40 transition-all cursor-pointer">
               <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full min-h-[120px]">
                 <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                   <TrendingUp className="w-5 h-5 text-muted-foreground" />
                 </div>
                 <p className="font-medium text-sm">요즘 뜨는 'AI 에이전트' 배워보기</p>
               </CardContent>
             </Card>
          </div>
        </section>
      )}

      {/* Community Ticker / Activity */}
      <section className="py-12 border-t border-border/50 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-10">
             <h2 className="text-2xl font-bold mb-2">함께 성장하는 커뮤니티</h2>
             <p className="text-muted-foreground">지금 이 순간에도 1,234명의 동료들이 학습하고 있습니다.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Live Activity Feed */}
             <Card className="col-span-1 md:col-span-2 bg-card/50">
               <CardContent className="p-6">
                 <div className="flex items-center gap-2 mb-4">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   <h3 className="font-semibold">실시간 학습 현황</h3>
                 </div>
                 <div className="space-y-4">
                   {LIVE_ACTIVITIES.map((activity, i) => (
                     <div key={i} className="flex items-center justify-between text-sm animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${i * 100}ms` }}>
                       <div className="flex items-center gap-2">
                         <span className="font-medium text-primary">{activity.user}</span>
                         <span className="text-muted-foreground">
                           {activity.action === "started" && "님이 학습을 시작했습니다:"}
                           {activity.action === "finished" && "님이 과정을 완료했습니다:"}
                           {activity.action === "forked" && "님이 커리큘럼을 가져갔습니다:"}
                         </span>
                         <span className="font-medium">{activity.target}</span>
                       </div>
                       <span className="text-xs text-muted-foreground">{activity.time}</span>
                     </div>
                   ))}
                 </div>
               </CardContent>
             </Card>

             {/* Weekly Top Curator */}
             <Card className="bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border-primary/20">
               <CardContent className="p-6 flex flex-col items-center text-center">
                 <Award className="w-12 h-12 text-yellow-500 mb-4" />
                 <h3 className="font-bold text-lg mb-1">이번 주 베스트 큐레이터</h3>
                 <p className="text-sm text-muted-foreground mb-4">가장 많은 영감을 준 멘토</p>
                 <div className="flex items-center gap-3 bg-background/50 p-3 rounded-xl w-full">
                    <div className="w-10 h-10 rounded-full bg-muted" />
                    <div className="text-left">
                      <p className="font-semibold text-sm">DesignGuru</p>
                      <p className="text-xs text-muted-foreground">👍 142 Likes</p>
                    </div>
                 </div>
               </CardContent>
             </Card>
           </div>
        </div>
      </section>
    </div>
  )
}
