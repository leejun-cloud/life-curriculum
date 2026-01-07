"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Users, BookOpen, Target, ArrowLeft, Play, CheckCircle, Clock } from "lucide-react"
import { RoleGuard } from "@/components/role-guard"

interface TeamCurriculum {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  deadline: string
  assignedMembers: string[]
  status: "draft" | "active" | "completed"
  progress: number
  createdAt: string
}

interface CurriculumContent {
  id: string
  title: string
  type: "video" | "article" | "quiz"
  duration: string
  completed: boolean
  url?: string
}

export default function TeamCurriculumDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [curriculum, setCurriculum] = useState<TeamCurriculum | null>(null)
  const [contents, setContents] = useState<CurriculumContent[]>([])
  const [memberProgress, setMemberProgress] = useState<Record<string, number>>({})

  useEffect(() => {
    const saved = localStorage.getItem("teamCurriculums")
    if (saved) {
      const curriculums = JSON.parse(saved)
      const found = curriculums.find((c: TeamCurriculum) => c.id === params.id)
      setCurriculum(found || null)
    }

    setContents([])

    setMemberProgress({})
  }, [params.id])

  if (!curriculum) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">커리큘럼을 찾을 수 없습니다</h2>
          <Button onClick={() => router.back()}>돌아가기</Button>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play className="w-4 h-4" />
      case "article":
        return <BookOpen className="w-4 h-4" />
      case "quiz":
        return <Target className="w-4 h-4" />
      default:
        return <BookOpen className="w-4 h-4" />
    }
  }

  return (
    <RoleGuard allowedRoles={["team_leader", "admin"]}>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{curriculum.title}</h1>
            <p className="text-muted-foreground mt-1">{curriculum.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    커리큘럼 정보
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(curriculum.status)}>
                      {curriculum.status === "active"
                        ? "진행중"
                        : curriculum.status === "completed"
                          ? "완료"
                          : "준비중"}
                    </Badge>
                    <Badge className={getDifficultyColor(curriculum.difficulty)}>
                      {curriculum.difficulty === "beginner"
                        ? "초급"
                        : curriculum.difficulty === "intermediate"
                          ? "중급"
                          : "고급"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>완료 기한: {curriculum.deadline}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>배정 인원: {curriculum.assignedMembers.length}명</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">전체 진행률</span>
                    <span className="text-sm text-muted-foreground">{curriculum.progress}%</span>
                  </div>
                  <Progress value={curriculum.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="content" className="space-y-4">
              <TabsList>
                <TabsTrigger value="content">학습 콘텐츠</TabsTrigger>
                <TabsTrigger value="progress">진행 현황</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                {contents.map((content, index) => (
                  <Card key={content.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                            {content.completed ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              getContentIcon(content.type)
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium">{content.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {content.duration}
                              <Badge variant="outline" className="text-xs">
                                {content.type === "video" ? "영상" : content.type === "article" ? "글" : "퀴즈"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {content.completed && (
                            <Badge variant="secondary" className="text-xs">
                              완료
                            </Badge>
                          )}
                          <Button size="sm" variant="outline">
                            {content.completed ? "다시보기" : "시작하기"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="progress" className="space-y-4">
                {curriculum.assignedMembers.map((member) => (
                  <Card key={member}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-4 h-4" />
                          </div>
                          <span className="font-medium">{member}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{memberProgress[member] || 0}% 완료</span>
                      </div>
                      <Progress value={memberProgress[member] || 0} className="h-2" />
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">배정된 팀원</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {curriculum.assignedMembers.map((member) => (
                    <div key={member} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <span className="text-sm">{member}</span>
                      <Badge variant="outline" className="text-xs">
                        {memberProgress[member] || 0}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">학습 통계</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-green-50">
                    <div className="text-2xl font-bold text-green-600">
                      {contents.filter((c) => c.completed).length}
                    </div>
                    <div className="text-xs text-muted-foreground">완료된 콘텐츠</div>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50">
                    <div className="text-2xl font-bold text-blue-600">{contents.length}</div>
                    <div className="text-xs text-muted-foreground">전체 콘텐츠</div>
                  </div>
                </div>
                <div className="text-center p-3 rounded-lg bg-orange-50">
                  <div className="text-lg font-bold text-orange-600">
                    {Math.round(
                      Object.values(memberProgress).reduce((a, b) => a + b, 0) / curriculum.assignedMembers.length,
                    ) || 0}
                    %
                  </div>
                  <div className="text-xs text-muted-foreground">평균 진행률</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RoleGuard>
  )
}
