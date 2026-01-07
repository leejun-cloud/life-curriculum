"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState, useMemo, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Clock,
  Users,
  Star,
  Play,
  MoreVertical,
  Edit,
  Trash2,
  Download,
} from "lucide-react"
import Link from "next/link"
import { useRealtime } from "@/components/realtime-provider"
import { deleteCurriculum } from "@/lib/firebase-collections"

const categories = ["전체", "기술", "비즈니스", "건강", "취미", "인문학", "언어"]

export default function CurriculumPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [showFilters, setShowFilters] = useState(false)
  const { curriculums: firebaseCurriculums } = useRealtime()
  const [importedCurriculums, setImportedCurriculums] = useState<any[]>([])

  useEffect(() => {
    const imported = JSON.parse(localStorage.getItem("importedCurriculums") || "[]")
    setImportedCurriculums(imported)
  }, [])

  const allCurriculums = useMemo(() => {
    const converted = importedCurriculums.map((imported: any) => ({
      id: `imported-${imported.id}`,
      title: imported.title,
      description: imported.description,
      category: imported.category || "기술",
      level: imported.level || "중급",
      progress: imported.progress || 0,
      totalLessons: imported.lessons || imported.totalLessons || 20,
      completedLessons: imported.completedLessons || 0,
      estimatedHours: Number.parseInt(imported.duration) || 15,
      isPublic: false,
      likes: 0,
      students: 1,
      thumbnail: imported.thumbnail || "/placeholder.svg",
      isImported: true,
      originalId: imported.id,
    }))

    return [...firebaseCurriculums, ...converted]
  }, [firebaseCurriculums, importedCurriculums])

  const filteredCurriculums = useMemo(() => {
    return allCurriculums.filter((curriculum) => {
      const matchesSearch =
        curriculum.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        curriculum.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "전체" || curriculum.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory, allCurriculums])

  const handleCategoryChange = (category: string) => {
    console.log("[v0] Category changed to:", category)
    setSelectedCategory(category)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("[v0] Search query:", e.target.value)
    setSearchQuery(e.target.value)
  }

  const handleContinueLearning = (curriculumId: string) => {
    console.log("[v0] Continue learning curriculum:", curriculumId)
    router.push(`/curriculum/${curriculumId}`)
  }

  const handleEditCurriculum = (curriculumId: string) => {
    console.log("[v0] Edit curriculum:", curriculumId)
    router.push(`/curriculum/create?edit=${curriculumId}`)
  }

  const handleDeleteCurriculum = async (curriculumId: string) => {
    console.log("[v0] Delete curriculum:", curriculumId)
    if (!confirm("정말로 이 커리큘럼을 삭제하시겠습니까?")) {
      return
    }

    try {
      // Check if it's an imported curriculum
      if (typeof curriculumId === "string" && curriculumId.startsWith("imported-")) {
        // Delete from localStorage
        const originalId = curriculumId.replace("imported-", "")
        const imported = JSON.parse(localStorage.getItem("importedCurriculums") || "[]")
        const updated = imported.filter((c: any) => c.id !== originalId)
        localStorage.setItem("importedCurriculums", JSON.stringify(updated))
        setImportedCurriculums(updated)
      } else {
        // Delete from Firebase
        await deleteCurriculum(curriculumId)
      }

      console.log("[v0] Curriculum deleted successfully")
    } catch (error) {
      console.error("[v0] Error deleting curriculum:", error)
      alert("커리큘럼 삭제 중 오류가 발생했습니다.")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">LifeCurriculum</h1>
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/curriculum/create">
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />새 커리큘럼
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="커리큘럼 검색..."
              className="pl-10 bg-card border-border"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4 mr-2" />
              필터
            </Button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === selectedCategory ? "default" : "outline"}
              size="sm"
              className="whitespace-nowrap"
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Results Info */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {searchQuery && `"${searchQuery}"에 대한 검색 결과: `}
            {filteredCurriculums.length}개의 커리큘럼
            {selectedCategory !== "전체" && ` (${selectedCategory} 카테고리)`}
          </p>
        </div>

        {/* Curriculum Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCurriculums.map((curriculum) => (
            <Card
              key={curriculum.id}
              className="bg-card border-border hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className="relative">
                <img
                  src={curriculum.thumbnail || "/placeholder.svg"}
                  alt={curriculum.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute top-3 right-3">
                  <Button variant="ghost" size="sm" className="bg-black/20 hover:bg-black/40 text-white">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
                <div className="absolute bottom-3 left-3 flex gap-2">
                  <Badge variant="secondary" className="bg-black/60 text-white">
                    {curriculum.category}
                  </Badge>
                  {curriculum.isImported && (
                    <Badge variant="secondary" className="bg-primary/80 text-white">
                      <Download className="w-3 h-3 mr-1" />
                      가져옴
                    </Badge>
                  )}
                </div>
              </div>

              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <Link href={`/curriculum/${curriculum.id}`}>
                      <h3 className="font-semibold text-card-foreground mb-1 group-hover:text-primary transition-colors">
                        {curriculum.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-2">{curriculum.description}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">진행률</span>
                    <span className="font-medium text-card-foreground">
                      {curriculum.completedLessons}/{curriculum.totalLessons}
                    </span>
                  </div>
                  <Progress value={curriculum.progress} className="h-2" />

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{curriculum.estimatedHours}시간 남음</span>
                    </div>
                    <Badge variant="outline" size="sm">
                      {curriculum.level}
                    </Badge>
                  </div>

                  {curriculum.isPublic && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-border">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        <span>{curriculum.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{curriculum.students}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button className="flex-1" size="sm" onClick={() => handleContinueLearning(curriculum.id)}>
                    <Play className="w-4 h-4 mr-2" />
                    계속 학습
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEditCurriculum(curriculum.id)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCurriculum(curriculum.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredCurriculums.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              {searchQuery ? "검색 결과가 없습니다" : "아직 커리큘럼이 없습니다"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? "다른 검색어를 시도해보거나 필터를 조정해보세요"
                : "첫 번째 커리큘럼을 만들어 학습을 시작해보세요"}
            </p>
            {!searchQuery && (
              <Link href="/curriculum/create">
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />새 커리큘럼 만들기
                </Button>
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
