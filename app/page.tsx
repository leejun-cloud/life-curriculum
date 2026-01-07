"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  Clock,
  Users,
  Star,
  Heart,
  BookOpen,
  Search,
  Sparkles,
  Award,
  GitFork
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"

interface Curriculum {
  id: string
  title: string
  description: string
  category: string
  thumbnail?: string
  estimatedHours: number
  totalLessons: number
  author: {
    name: string
    avatar?: string
  }
  metadata: {
    likes: number
    forks: number
    views: number
    rating: number
    ratingCount: number
    isPublic: boolean
  }
  createdAt: string
}

// Mock data for popular curriculums
const POPULAR_CURRICULUMS: Curriculum[] = [
  {
    id: "1",
    title: "React 완벽 가이드",
    description: "초보자부터 고급 개발자까지, React의 모든 것을 배우는 완벽한 커리큘럼",
    category: "프로그래밍",
    estimatedHours: 40,
    totalLessons: 25,
    author: {
      name: "김철수",
      avatar: "👨‍💻"
    },
    metadata: {
      likes: 456,
      forks: 89,
      views: 1234,
      rating: 4.8,
      ratingCount: 124,
      isPublic: true
    },
    createdAt: "2024-01-15"
  },
  {
    id: "2",
    title: "Python 데이터 분석 마스터",
    description: "Pandas, NumPy, Matplotlib을 활용한 실전 데이터 분석",
    category: "데이터 과학",
    estimatedHours: 35,
    totalLessons: 20,
    author: {
      name: "이영희",
      avatar: "👩‍💼"
    },
    metadata: {
      likes: 342,
      forks: 67,
      views: 987,
      rating: 4.6,
      ratingCount: 89,
      isPublic: true
    },
    createdAt: "2024-02-01"
  },
  {
    id: "3",
    title: "UI/UX 디자인 기초",
    description: "피그마로 배우는 실무 디자인 프로세스",
    category: "디자인",
    estimatedHours: 25,
    totalLessons: 15,
    author: {
      name: "박지민",
      avatar: "🎨"
    },
    metadata: {
      likes: 289,
      forks: 45,
      views: 756,
      rating: 4.7,
      ratingCount: 67,
      isPublic: true
    },
    createdAt: "2024-01-20"
  }
]

export default function ExplorePage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [curriculums, setCurriculums] = useState<Curriculum[]>([])

  useEffect(() => {
    // Load all public curriculums
    const saved = localStorage.getItem("publicCurriculums")
    if (saved) {
      setCurriculums(JSON.parse(saved))
    } else {
      // Initialize with mock data
      setCurriculums(POPULAR_CURRICULUMS)
      localStorage.setItem("publicCurriculums", JSON.stringify(POPULAR_CURRICULUMS))
    }
  }, [])

  const categories = ["전체", "프로그래밍", "데이터 과학", "디자인", "마케팅", "비즈니스", "언어"]

  const filteredCurriculums = curriculums.filter((curriculum) => {
    const matchesSearch = curriculum.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      curriculum.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "전체" || curriculum.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const popularCurriculums = [...filteredCurriculums].sort((a, b) =>
    (b.metadata.likes + b.metadata.forks) - (a.metadata.likes + a.metadata.forks)
  ).slice(0, 6)

  const latestCurriculums = [...filteredCurriculums].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 6)

  const topRatedCurriculums = [...filteredCurriculums].sort((a, b) =>
    b.metadata.rating - a.metadata.rating
  ).slice(0, 6)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <header className="glass-effect border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 gradient-violet rounded-2xl flex items-center justify-center glow-violet">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient-violet">Life Curriculum</h1>
                <p className="text-xs text-muted-foreground">인생의 커리큘럼을 설계하세요</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Link href="/my-dashboard">
                    <Button variant="outline" className="border-primary/30">
                      <BookOpen className="w-4 h-4 mr-2" />
                      내 대시보드
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button className="gradient-violet">
                      <span className="text-lg mr-2">{user.avatar || "👤"}</span>
                      {user.name}
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" className="border-primary/30">
                      로그인
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="gradient-violet">
                      시작하기
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="pb-6">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="배우고 싶은 것을 검색해보세요..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg bg-input border-border/50 rounded-2xl"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 pb-6 overflow-x-auto">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "gradient-violet" : "border-primary/30"}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="popular" className="space-y-8">
          <TabsList className="bg-card/50">
            <TabsTrigger value="popular" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              인기 커리큘럼
            </TabsTrigger>
            <TabsTrigger value="latest" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              최신 커리큘럼
            </TabsTrigger>
            <TabsTrigger value="top-rated" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              최고 평점
            </TabsTrigger>
          </TabsList>

          {/* Popular Curriculums */}
          <TabsContent value="popular" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularCurriculums.map((curriculum) => (
                <CurriculumCard key={curriculum.id} curriculum={curriculum} />
              ))}
            </div>
            {popularCurriculums.length === 0 && (
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-12 text-center">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">검색 결과가 없습니다</h3>
                  <p className="text-muted-foreground">다른 키워드로 검색해보세요</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Latest Curriculums */}
          <TabsContent value="latest" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestCurriculums.map((curriculum) => (
                <CurriculumCard key={curriculum.id} curriculum={curriculum} />
              ))}
            </div>
          </TabsContent>

          {/* Top Rated Curriculums */}
          <TabsContent value="top-rated" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topRatedCurriculums.map((curriculum) => (
                <CurriculumCard key={curriculum.id} curriculum={curriculum} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function CurriculumCard({ curriculum }: { curriculum: Curriculum }) {
  return (
    <Link href={`/curriculum/${curriculum.id}`}>
      <Card className="bg-card/50 border-primary/20 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all h-full">
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              {curriculum.category}
            </Badge>
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold">{curriculum.metadata.rating}</span>
              <span className="text-muted-foreground">({curriculum.metadata.ratingCount})</span>
            </div>
          </div>

          <CardTitle className="text-xl line-clamp-2">{curriculum.title}</CardTitle>
          <CardDescription className="line-clamp-2">{curriculum.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Author */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">{curriculum.author.avatar}</span>
            <span className="text-sm font-medium">{curriculum.author.name}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {curriculum.estimatedHours}시간
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {curriculum.totalLessons}강
            </div>
          </div>

          {/* Engagement */}
          <div className="flex items-center gap-4 pt-2 border-t border-border/50">
            <div className="flex items-center gap-1 text-sm">
              <Heart className="w-4 h-4 text-chart-3" />
              <span>{curriculum.metadata.likes}</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <GitFork className="w-4 h-4 text-primary" />
              <span>{curriculum.metadata.forks}</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Users className="w-4 h-4 text-chart-2" />
              <span>{curriculum.metadata.views}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
