"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  BookOpen,
  ArrowLeft,
  Search,
  Filter,
  Heart,
  Users,
  Star,
  Clock,
  Play,
  TrendingUp,
  Download,
  Plus,
  CheckSquare,
  Video,
  BookOpenCheck,
  X,
  FolderPlus,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useRealtime } from "@/components/realtime-provider"

const categories = [
  { name: "전체", count: 0, active: true },
  { name: "기술", count: 0, active: false },
  { name: "언어", count: 0, active: false },
  { name: "비즈니스", count: 0, active: false },
  { name: "디자인", count: 0, active: false },
  { name: "마케팅", count: 0, active: false },
  { name: "건강", count: 0, active: false },
  { name: "취미", count: 0, active: false },
]

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [contentType, setContentType] = useState("all") // "all", "curriculum", "video"
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [showImportModal, setShowImportModal] = useState(false)
  const [importedCurriculums, setImportedCurriculums] = useState<number[]>([])
  const [userCurriculums, setUserCurriculums] = useState<any[]>([])
  const [showNewCurriculumForm, setShowNewCurriculumForm] = useState(false)
  const [newCurriculumTitle, setNewCurriculumTitle] = useState("")
  const [newCurriculumDescription, setNewCurriculumDescription] = useState("")
  const router = useRouter()

  const { curriculums } = useRealtime()

  useEffect(() => {
    const loadUserCurriculums = () => {
      // Load imported curriculums
      const importedCurriculums = JSON.parse(localStorage.getItem("importedCurriculums") || "[]")
      const convertedImported = importedCurriculums.map((imported: any) => ({
        id: imported.id + 1000,
        title: imported.title,
        description: imported.description,
        category: imported.category,
        totalLessons: imported.lessons || 20,
        completedLessons: 0,
        thumbnail: imported.thumbnail,
        isImported: true,
      }))

      setUserCurriculums(convertedImported)
    }

    loadUserCurriculums()
  }, [])

  const handleLike = (id: number, type: string) => {
    console.log(`[v0] Liked ${type}:`, id)
    // Update likes in real data
  }

  const handleBookmark = (id: number, type: string) => {
    console.log(`[v0] Bookmarked ${type}:`, id)
    // Update bookmark status
  }

  const handlePreview = (id: string, type: string) => {
    console.log(`[v0] Preview ${type}:`, id)
    if (type === "curriculum") {
      router.push(`/curriculum/${id}`)
    } else {
      // Open video preview modal
      console.log(`[v0] Opening video preview for:`, id)
    }
  }

  const handleStart = (id: string, type: string) => {
    console.log(`[v0] Starting ${type}:`, id)
    if (type === "curriculum") {
      router.push(`/curriculum/${id}`)
    } else {
      // Start individual video
      console.log(`[v0] Starting video:`, id)
    }
  }

  const handleImportCurriculum = (curriculum: any) => {
    console.log(`[v0] Importing curriculum:`, curriculum.id)

    // Add to imported curriculums list
    setImportedCurriculums((prev) => [...prev, curriculum.id])

    // Store in localStorage for persistence
    const existingImported = JSON.parse(localStorage.getItem("importedCurriculums") || "[]")
    const newImported = [
      ...existingImported,
      {
        ...curriculum,
        importedAt: new Date().toISOString(),
        progress: 0,
        completedLessons: 0,
        isImported: true,
      },
    ]
    localStorage.setItem("importedCurriculums", JSON.stringify(newImported))

    alert(`"${curriculum.title}" 커리큘럼이 내 컬렉션에 추가되었습니다!`)
  }

  const handleSelectItem = (id: number) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const handleAddSelectedToMyCurriculum = () => {
    if (selectedItems.length === 0) return
    console.log(`[v0] Adding selected items to curriculum:`, selectedItems)
    setShowImportModal(true)
  }

  const handleAddToCurriculum = (curriculumId: string | number) => {
    const selectedContent = curriculums.filter((item: any) => selectedItems.includes(item.id))

    console.log("[v0] Adding content to curriculum:", {
      curriculumId,
      selectedContent: selectedContent.map((c: any) => ({ id: c.id, title: c.title })),
    })

    if (curriculumId === "new") {
      // Create new curriculum with selected content
      const newCurriculum = {
        id: Date.now(),
        title: newCurriculumTitle || "새 커리큘럼",
        description: newCurriculumDescription || "선택한 콘텐츠로 구성된 커리큘럼",
        category: "기타",
        contents: selectedContent.map((content: any) => ({
          id: content.id,
          title: content.title,
          type: "curriculum",
          thumbnail: content.thumbnail,
          completed: false,
        })),
        createdAt: new Date().toISOString(),
      }

      // Save to localStorage
      const existingCustomCurriculums = JSON.parse(localStorage.getItem("customCurriculums") || "[]")
      localStorage.setItem("customCurriculums", JSON.stringify([...existingCustomCurriculums, newCurriculum]))

      alert(`새 커리큘럼 "${newCurriculum.title}"이 생성되었고 ${selectedContent.length}개의 콘텐츠가 추가되었습니다!`)
    } else {
      // Add to existing curriculum
      const targetCurriculum = userCurriculums.find((c) => c.id === curriculumId)
      if (targetCurriculum) {
        // Save selected content to specific curriculum
        const existingSelections = JSON.parse(localStorage.getItem("curriculumAdditions") || "[]")
        const newAddition = {
          curriculumId,
          curriculumTitle: targetCurriculum.title,
          contents: selectedContent.map((content: any) => ({
            id: content.id,
            title: content.title,
            type: "curriculum",
            thumbnail: content.thumbnail,
            completed: false,
          })),
          addedAt: new Date().toISOString(),
        }

        localStorage.setItem("curriculumAdditions", JSON.stringify([...existingSelections, newAddition]))
        alert(`"${targetCurriculum.title}" 커리큘럼에 ${selectedContent.length}개의 콘텐츠가 추가되었습니다!`)
      }
    }

    // Reset states
    setSelectedItems([])
    setShowImportModal(false)
    setShowNewCurriculumForm(false)
    setNewCurriculumTitle("")
    setNewCurriculumDescription("")
  }

  const handleCreateNewCurriculum = () => {
    if (!newCurriculumTitle.trim()) {
      alert("커리큘럼 제목을 입력해주세요.")
      return
    }
    handleAddToCurriculum("new")
  }

  const filteredContent = curriculums.filter((item: any) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "전체" || item.category === selectedCategory
    // const matchesType = contentType === "all" || item.type === contentType // contentType is not used for filtering here
    return matchesSearch && matchesCategory // && matchesType
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-effect border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Link href="/">
              <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-violet rounded-2xl flex items-center justify-center glow-violet">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gradient-violet">Explore</h1>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md ml-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Find your next skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-input border-border/50 focus:border-primary/50"
                />
              </div>
            </div>

            {selectedItems.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/20 text-primary">{selectedItems.length}개 선택됨</Badge>
                <Button size="sm" className="gradient-violet" onClick={handleAddSelectedToMyCurriculum}>
                  <Plus className="w-4 h-4 mr-1" />내 커리큘럼에 추가
                </Button>
              </div>
            )}

            <Button variant="outline" size="sm" className="border-primary/30 hover:bg-primary/10">
              <Filter className="w-4 h-4 mr-2" />
              필터
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Content Type Filter - Not used in filtering logic, but kept for UI */}
            <div className="flex gap-2 mb-4">
              <Button
                variant={contentType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setContentType("all")}
              >
                <BookOpen className="w-4 h-4 mr-1" />
                전체
              </Button>
              <Button
                variant={contentType === "curriculum" ? "default" : "outline"}
                size="sm"
                onClick={() => setContentType("curriculum")}
              >
                <BookOpenCheck className="w-4 h-4 mr-1" />
                커리큘럼
              </Button>
              <Button
                variant={contentType === "video" ? "default" : "outline"}
                size="sm"
                onClick={() => setContentType("video")}
              >
                <Video className="w-4 h-4 mr-1" />
                개별 영상
              </Button>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <Button
                  key={category.name}
                  variant={category.name === selectedCategory ? "default" : "outline"}
                  size="sm"
                  className={`whitespace-nowrap ${category.name === selectedCategory
                    ? "gradient-violet"
                    : "border-primary/30 hover:bg-primary/10"
                    }`}
                  onClick={() => setSelectedCategory(category.name)}
                >
                  {category.name}
                </Button>
              ))}
            </div>

            {/* Personalized Recommendations Section - Removed as dummy data was removed */}
            {/* {personalizedRecommendations.length > 0 && ( ... */}

            {/* Featured Section - Now displays real curriculums */}
            {filteredContent.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">커리큘럼</h2>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedItems([])}
                    disabled={selectedItems.length === 0}
                  >
                    <CheckSquare className="w-4 h-4 mr-1" />
                    선택 해제
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredContent.map((item: any) => (
                    <Card
                      key={item.id}
                      className="bg-card/50 border-primary/20 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all group relative cursor-pointer overflow-hidden"
                      onClick={() => handlePreview(item.id, "curriculum")}
                    >
                      <div className="absolute top-3 left-3 z-10" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={() => handleSelectItem(item.id)}
                          className="bg-white/90 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                      </div>

                      <div className="relative">
                        <div
                          className="w-full h-48 bg-gradient-to-br from-primary/80 to-secondary/60"
                          style={{
                            backgroundImage: item.thumbnail ? `url(${item.thumbnail})` : undefined,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
                        </div>
                        <div className="absolute top-3 right-3 flex gap-2">
                          <Badge variant="secondary" className="bg-primary/90 text-white font-semibold">
                            {item.category || "TECH"}
                          </Badge>
                        </div>
                        <div className="absolute bottom-3 left-3">
                          <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm">
                            <BookOpenCheck className="w-3 h-3 mr-1" />
                            커리큘럼
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Author - Removed as not available in real-time data */}
                          {/* <div className="flex items-center gap-2"> ... </div> */}

                          {/* Title & Description */}
                          <div>
                            <h3 className="font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors">
                              {item.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                          </div>

                          {/* Stats - Simplified as not all fields are available */}
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                            {item.duration && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{item.duration}</span>
                              </div>
                            )}
                            {item.lessons && (
                              <div className="flex items-center gap-1">
                                <Play className="w-4 h-4" />
                                <span>{item.lessons}강</span>
                              </div>
                            )}
                            {item.students && (
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{item.students?.toLocaleString()}</span>
                              </div>
                            )}
                            {item.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-current text-yellow-500" />
                                <span>{item.rating}</span>
                              </div>
                            )}
                          </div>

                          {/* Tags */}
                          {item.hashtags && item.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {item.hashtags.slice(0, 3).map((tag: string) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            {/* Like and Bookmark buttons removed as they are not relevant for fetched data */}
                            {/* <div className="flex items-center gap-2"> ... </div> */}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleLike(item.id, "curriculum")
                                }}
                              >
                                <Heart className="w-4 h-4 mr-1" />
                                {item.likes || 0}
                              </Button>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleImportCurriculum(item)
                                }}
                                disabled={importedCurriculums.includes(item.id)}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                {importedCurriculums.includes(item.id) ? "가져옴" : "가져오기"}
                              </Button>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleStart(item.id, "curriculum")
                                }}
                              >
                                시작하기
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">커리큘럼이 없습니다</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery
                      ? "검색 조건에 맞는 커리큘럼이 없습니다."
                      : "아직 생성된 커리큘럼이 없습니다. 첫 번째 커리큘럼을 만들어보세요!"}
                  </p>
                  <Link href="/curriculum/create">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      커리큘럼 만들기
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Creators - Removed as dummy data was removed */}
            {/* <Card className="bg-card border-border"> ... </Card> */}

            {/* Learning Goals */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  이번 달 목표
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">새 커리큘럼 시작</span>
                    <span className="text-sm font-medium text-card-foreground">{curriculums.length}/3</span>
                  </div>
                  <Progress value={(curriculums.length / 3) * 100} className="h-2" />
                </div>

                {/* Other progress bars removed as they were tied to dummy data */}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              커리큘럼에 추가하기
            </DialogTitle>
            <DialogDescription>
              선택한 {selectedItems.length}개의 콘텐츠를 어떤 커리큘럼에 추가하시겠습니까?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Selected Content Preview */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-3 text-sm text-muted-foreground">선택된 콘텐츠</h4>
              <div className="flex flex-wrap gap-2">
                {filteredContent
                  .filter((item: any) => selectedItems.includes(item.id))
                  .map((item: any) => (
                    <Badge key={item.id} variant="secondary" className="text-xs">
                      <BookOpenCheck className="w-3 h-3 mr-1" />
                      {item.title}
                    </Badge>
                  ))}
              </div>
            </div>

            {/* New Curriculum Option */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">새 커리큘럼 만들기</h4>
                <Button
                  variant={showNewCurriculumForm ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setShowNewCurriculumForm(!showNewCurriculumForm)}
                >
                  <FolderPlus className="w-4 h-4 mr-2" />
                  {showNewCurriculumForm ? "취소" : "새로 만들기"}
                </Button>
              </div>

              {showNewCurriculumForm && (
                <Card className="border-dashed border-2 border-primary/30">
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">커리큘럼 제목</label>
                      <Input
                        placeholder="새 커리큘럼의 제목을 입력하세요"
                        value={newCurriculumTitle}
                        onChange={(e) => setNewCurriculumTitle(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">설명 (선택사항)</label>
                      <Textarea
                        placeholder="커리큘럼에 대한 간단한 설명을 입력하세요"
                        value={newCurriculumDescription}
                        onChange={(e) => setNewCurriculumDescription(e.target.value)}
                        className="mt-1 resize-none"
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleCreateNewCurriculum} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />새 커리큘럼 생성하고 콘텐츠 추가
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Existing Curriculums */}
            <div className="space-y-4">
              <h4 className="font-medium">기존 커리큘럼에 추가</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {userCurriculums.map((curriculum) => (
                  <Card
                    key={curriculum.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
                    onClick={() => handleAddToCurriculum(curriculum.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <img
                          src={curriculum.thumbnail || "/placeholder.svg"}
                          alt={curriculum.title}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm truncate">{curriculum.title}</h5>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{curriculum.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            {/* Category and isImported badges retained */}
                            {curriculum.category && (
                              <Badge variant="outline" className="text-xs">
                                {curriculum.category}
                              </Badge>
                            )}
                            {curriculum.isImported && (
                              <Badge variant="secondary" className="text-xs">
                                <Download className="w-3 h-3 mr-1" />
                                가져옴
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowImportModal(false)
                  setShowNewCurriculumForm(false)
                  setNewCurriculumTitle("")
                  setNewCurriculumDescription("")
                }}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                취소
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
