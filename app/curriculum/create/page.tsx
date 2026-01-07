"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  ArrowLeft,
  BookOpen,
  Plus,
  GripVertical,
  Trash2,
  Play,
  Clock,
  Globe,
  Lock,
  Loader2,
  X,
  Hash,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { createCurriculum } from "@/lib/firebase-collections"

const categories = [
  { id: "tech", name: "기술", icon: "💻" },
  { id: "business", name: "비즈니스", icon: "💼" },
  { id: "health", name: "건강", icon: "💪" },
  { id: "hobby", name: "취미", icon: "🎨" },
  { id: "humanities", name: "인문학", icon: "📚" },
  { id: "language", name: "언어", icon: "🌍" },
]

const levels = ["초급", "중급", "고급"]

interface ContentItem {
  id: string
  title: string
  url: string
  duration: string
  thumbnail: string
  type: "video" | "article" | "course"
}

function extractYouTubeVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

async function fetchYouTubeMetadata(url: string): Promise<Partial<ContentItem>> {
  const videoId = extractYouTubeVideoId(url)

  if (!videoId) {
    return {
      title: "새로운 학습 콘텐츠",
      duration: "15분",
      thumbnail: "/video-thumbnail.png",
    }
  }

  try {
    console.log("[v0] Fetching YouTube metadata for video ID:", videoId)

    // YouTube oEmbed API 사용
    const oEmbedResponse = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
    )

    if (oEmbedResponse.ok) {
      const oEmbedData = await oEmbedResponse.json()
      console.log("[v0] YouTube oEmbed data:", oEmbedData)

      return {
        title: oEmbedData.title || "새로운 학습 콘텐츠",
        duration: "15분", // oEmbed에서는 duration을 제공하지 않음
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      }
    }
  } catch (error) {
    console.error("[v0] Failed to fetch YouTube metadata:", error)
  }

  // 실패 시 기본값 반환
  return {
    title: "새로운 학습 콘텐츠",
    duration: "15분",
    thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
  }
}

export default function CreateCurriculumPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)

  const [hashtagInput, setHashtagInput] = useState("")
  const [hashtags, setHashtags] = useState<string[]>([])

  const [selectedCategory, setSelectedCategory] = useState("tech")
  const [selectedLevel, setSelectedLevel] = useState("중급")
  const [privacy, setPrivacy] = useState("public")
  const [newContentUrl, setNewContentUrl] = useState("")
  const [isLoadingContent, setIsLoadingContent] = useState(false)
  const [contents, setContents] = useState<ContentItem[]>([])

  const handleHashtagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setHashtagInput(value)

    if (value.includes(",")) {
      const newTags = value
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
      const uniqueTags = [...new Set([...hashtags, ...newTags])]
      setHashtags(uniqueTags)
      setHashtagInput("")
    }
  }

  const removeHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter((tag) => tag !== tagToRemove))
  }

  const addContent = async () => {
    if (!newContentUrl.trim()) return

    setIsLoadingContent(true)

    try {
      const metadata = await fetchYouTubeMetadata(newContentUrl)

      const newContent: ContentItem = {
        id: Date.now().toString(),
        title: metadata.title || "새로운 학습 콘텐츠",
        url: newContentUrl,
        duration: metadata.duration || "15분",
        thumbnail: metadata.thumbnail || "/video-thumbnail.png",
        type: "video",
      }

      setContents([...contents, newContent])
      setNewContentUrl("")
    } catch (error) {
      console.error("Failed to fetch metadata:", error)
      const newContent: ContentItem = {
        id: Date.now().toString(),
        title: "새로운 학습 콘텐츠",
        url: newContentUrl,
        duration: "15분",
        thumbnail: "/video-thumbnail.png",
        type: "video",
      }
      setContents([...contents, newContent])
      setNewContentUrl("")
    } finally {
      setIsLoadingContent(false)
    }
  }

  const removeContent = (id: string) => {
    setContents(contents.filter((content) => content.id !== id))
  }

  const moveContent = (fromIndex: number, toIndex: number) => {
    const newContents = [...contents]
    const [movedContent] = newContents.splice(fromIndex, 1)
    newContents.splice(toIndex, 0, movedContent)
    setContents(newContents)
  }

  const saveCurriculum = async () => {
    console.log("[v0] Current user state:", user)
    console.log("[v0] User ID:", user?.id)

    if (!user || !user.id) {
      console.error("[v0] No authenticated user or missing ID")
      alert("로그인이 필요합니다. 다시 로그인해주세요.")
      router.push("/login")
      return
    }

    if (!title.trim()) {
      alert("커리큘럼 제목을 입력해주세요.")
      return
    }

    try {
      const curriculumData = {
        title: title.trim(),
        description: description.trim() || "커리큘럼 설명을 추가해주세요.",
        category: selectedCategory,
        level: selectedLevel,
        privacy,
        hashtags,
        contents,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPublic: privacy === "public",
        progress: 0,
        totalVideos: contents.length,
        completedVideos: 0,
      }

      console.log("[v0] Saving curriculum to Firebase:", curriculumData)
      console.log("[v0] CreatedBy field:", curriculumData.createdBy)

      const curriculumId = await createCurriculum(curriculumData)
      console.log("[v0] Curriculum saved with ID:", curriculumId)

      alert("커리큘럼이 성공적으로 생성되었습니다!")
      router.push("/curriculum")
    } catch (error) {
      console.error("[v0] Failed to save curriculum:", error)
      alert("커리큘럼 저장에 실패했습니다. 다시 시도해주세요.")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Link href="/curriculum">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">새 커리큘럼 만들기</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-card-foreground">
                  커리큘럼 제목
                </Label>
                {isEditingTitle ? (
                  <Input
                    id="title"
                    placeholder="커리큘럼 제목을 입력하세요"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setIsEditingTitle(false)
                      if (e.key === "Escape") setIsEditingTitle(false)
                    }}
                    className="bg-input border-border"
                    autoFocus
                  />
                ) : (
                  <div
                    onClick={() => setIsEditingTitle(true)}
                    className="min-h-[40px] px-3 py-2 border border-border rounded-md cursor-text hover:border-primary/50 transition-colors flex items-center"
                  >
                    <span className={`${title ? "text-foreground" : "text-muted-foreground"}`}>
                      {title || "React 완전 정복"}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-card-foreground">
                  설명
                </Label>
                {isEditingDescription ? (
                  <Textarea
                    id="description"
                    placeholder="이 커리큘럼에서 무엇을 배울 수 있는지 설명해주세요"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={() => setIsEditingDescription(false)}
                    className="bg-input border-border min-h-[100px]"
                    autoFocus
                  />
                ) : (
                  <div
                    onClick={() => setIsEditingDescription(true)}
                    className="min-h-[100px] px-3 py-2 border border-border rounded-md cursor-text hover:border-primary/50 transition-colors flex items-start"
                  >
                    <span
                      className={`${description ? "text-foreground" : "text-muted-foreground"} whitespace-pre-wrap`}
                    >
                      {description ||
                        "초보자부터 실무자까지, React의 모든 것을 체계적으로 학습할 수 있는 커리큘럼입니다."}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hashtags" className="text-card-foreground flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  해시태그
                </Label>
                <Input
                  id="hashtags"
                  placeholder="단어를 입력하고 쉼표(,)를 눌러 해시태그를 추가하세요"
                  value={hashtagInput}
                  onChange={handleHashtagInput}
                  className="bg-input border-border"
                />
                <p className="text-xs text-muted-foreground">
                  💡 예: React, JavaScript, 프론트엔드, 웹개발 (쉼표로 구분)
                </p>

                {hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {hashtags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                        <Hash className="w-3 h-3" />
                        {tag}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeHashtag(tag)}
                          className="h-auto p-0 ml-1 hover:bg-transparent"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-card-foreground">카테고리</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all text-center ${
                        selectedCategory === category.id
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-card hover:border-primary/50"
                      }`}
                    >
                      <div className="text-2xl mb-2">{category.icon}</div>
                      <div className="font-medium">{category.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-card-foreground">난이도</Label>
                <div className="flex gap-3">
                  {levels.map((level) => (
                    <Button
                      key={level}
                      variant={selectedLevel === level ? "default" : "outline"}
                      onClick={() => setSelectedLevel(level)}
                      className="flex-1"
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-card-foreground">공개 설정</Label>
                <RadioGroup value={privacy} onValueChange={setPrivacy}>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="public" id="public" />
                    <Label htmlFor="public" className="flex items-center gap-2 cursor-pointer">
                      <Globe className="w-4 h-4" />
                      공개 (다른 사람이 볼 수 있음)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="private" id="private" />
                    <Label htmlFor="private" className="flex items-center gap-2 cursor-pointer">
                      <Lock className="w-4 h-4" />
                      비공개 (나만 볼 수 있음)
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Play className="w-5 h-5" />
                학습 콘텐츠
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-3">
                <Input
                  placeholder="YouTube 링크나 강의 URL을 입력하세요"
                  value={newContentUrl}
                  onChange={(e) => setNewContentUrl(e.target.value)}
                  className="flex-1 bg-input border-border"
                  onKeyPress={(e) => e.key === "Enter" && addContent()}
                />
                <Button
                  onClick={addContent}
                  disabled={isLoadingContent || !newContentUrl.trim()}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isLoadingContent ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  추가
                </Button>
              </div>

              <div className="space-y-3">
                {contents.map((content, index) => (
                  <div
                    key={content.id}
                    className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border border-border"
                  >
                    <div
                      className="cursor-grab text-muted-foreground hover:text-foreground"
                      onMouseDown={() => console.log("[v0] Drag started for item", index)}
                    >
                      <GripVertical className="w-5 h-5" />
                    </div>

                    <div className="w-20 h-15 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {content.thumbnail.startsWith("http") ? (
                        <img
                          src={content.thumbnail || "/placeholder.svg"}
                          alt={content.title}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                            e.currentTarget.nextElementSibling?.classList.remove("hidden")
                          }}
                        />
                      ) : null}
                      <Play className="w-6 h-6 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-card-foreground truncate">{content.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{content.duration}</span>
                        <span>•</span>
                        <span className="truncate">{content.url}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {index + 1}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeContent(content.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {contents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Play className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>첫 번째 학습 콘텐츠를 추가해보세요</p>
                  <p className="text-sm">YouTube URL을 입력하면 자동으로 제목과 썸네일을 가져옵니다</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-center gap-4">
            <Link href="/curriculum">
              <Button variant="outline" size="lg">
                취소
              </Button>
            </Link>
            <Button size="lg" onClick={saveCurriculum} className="bg-primary hover:bg-primary/90">
              커리큘럼 생성
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
