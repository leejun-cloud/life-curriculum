"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RoleGuard } from "@/components/role-guard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, TrendingDown, Users, Clock, Target, Award, BookOpen, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface TeamAnalytics {
  overview: {
    totalMembers: number
    activeMembers: number
    averageProgress: number
    totalLearningHours: number
    completionRate: number
    weeklyGrowth: number
  }
  memberPerformance: {
    id: string
    name: string
    progress: number
    hoursThisWeek: number
    completedCourses: number
    rank: number
    improvement: number
  }[]
  courseAnalytics: {
    courseName: string
    enrolledMembers: number
    completionRate: number
    averageScore: number
    timeSpent: number
  }[]
  weeklyStats: {
    week: string
    activeMembers: number
    hoursLearned: number
    coursesCompleted: number
  }[]
}

export default function TeamAnalytics() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<TeamAnalytics>({
    overview: {
      totalMembers: 12,
      activeMembers: 9,
      averageProgress: 68,
      totalLearningHours: 342,
      completionRate: 75,
      weeklyGrowth: 12,
    },
    memberPerformance: [
      {
        id: "1",
        name: "이서연",
        progress: 92,
        hoursThisWeek: 15,
        completedCourses: 4,
        rank: 1,
        improvement: 8,
      },
      {
        id: "2",
        name: "김민준",
        progress: 85,
        hoursThisWeek: 12,
        completedCourses: 3,
        rank: 2,
        improvement: 5,
      },
      {
        id: "3",
        name: "박지훈",
        progress: 45,
        hoursThisWeek: 3,
        completedCourses: 1,
        rank: 3,
        improvement: -2,
      },
      {
        id: "4",
        name: "최유진",
        progress: 15,
        hoursThisWeek: 8,
        completedCourses: 0,
        rank: 4,
        improvement: 15,
      },
    ],
    courseAnalytics: [
      {
        courseName: "React 기초",
        enrolledMembers: 8,
        completionRate: 87,
        averageScore: 92,
        timeSpent: 45,
      },
      {
        courseName: "TypeScript 마스터",
        enrolledMembers: 6,
        completionRate: 67,
        averageScore: 85,
        timeSpent: 38,
      },
      {
        courseName: "UI/UX 디자인",
        enrolledMembers: 4,
        completionRate: 100,
        averageScore: 95,
        timeSpent: 32,
      },
    ],
    weeklyStats: [
      { week: "1주차", activeMembers: 7, hoursLearned: 85, coursesCompleted: 2 },
      { week: "2주차", activeMembers: 8, hoursLearned: 92, coursesCompleted: 3 },
      { week: "3주차", activeMembers: 9, hoursLearned: 105, coursesCompleted: 4 },
      { week: "4주차", activeMembers: 9, hoursLearned: 98, coursesCompleted: 3 },
    ],
  })

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Badge className="bg-yellow-500 text-white">🥇 1위</Badge>
      case 2:
        return <Badge className="bg-gray-400 text-white">🥈 2위</Badge>
      case 3:
        return <Badge className="bg-amber-600 text-white">🥉 3위</Badge>
      default:
        return <Badge variant="outline">{rank}위</Badge>
    }
  }

  const getImprovementIcon = (improvement: number) => {
    if (improvement > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />
    } else if (improvement < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />
    }
    return null
  }

  return (
    <RoleGuard
      allowedRoles={["team_leader", "admin"]}
      fallback={<div className="p-8 text-center text-muted-foreground">팀장 권한이 필요합니다.</div>}
    >
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">팀 분석 보고서</h1>
                  <p className="text-sm text-muted-foreground">프론트엔드 개발팀</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">전체 현황</TabsTrigger>
              <TabsTrigger value="members">팀원 성과</TabsTrigger>
              <TabsTrigger value="courses">과정 분석</TabsTrigger>
              <TabsTrigger value="trends">트렌드</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-card-foreground">활성 팀원</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-card-foreground">
                      {analytics.overview.activeMembers}/{analytics.overview.totalMembers}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      전주 대비 +{analytics.overview.weeklyGrowth}%
                    </p>
                    <Progress
                      value={(analytics.overview.activeMembers / analytics.overview.totalMembers) * 100}
                      className="mt-2"
                    />
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-card-foreground">평균 진도</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-card-foreground">{analytics.overview.averageProgress}%</div>
                    <p className="text-xs text-muted-foreground">목표: 80%</p>
                    <Progress value={analytics.overview.averageProgress} className="mt-2" />
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-card-foreground">총 학습 시간</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-card-foreground">
                      {analytics.overview.totalLearningHours}시간
                    </div>
                    <p className="text-xs text-muted-foreground">
                      평균: {Math.round(analytics.overview.totalLearningHours / analytics.overview.totalMembers)}시간/인
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Team Goal Progress */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <Award className="w-5 h-5 text-primary" />팀 목표 달성률
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-card-foreground">Q1 React 마스터 과정 완료</span>
                      <span className="text-sm text-muted-foreground">{analytics.overview.completionRate}%</span>
                    </div>
                    <Progress value={analytics.overview.completionRate} className="h-2" />
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-card-foreground">8</div>
                        <div className="text-xs text-muted-foreground">완료</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-card-foreground">3</div>
                        <div className="text-xs text-muted-foreground">진행중</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-card-foreground">1</div>
                        <div className="text-xs text-muted-foreground">미시작</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members" className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">팀원별 성과 분석</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.memberPerformance.map((member) => (
                      <div key={member.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-card-foreground">{member.name}</h4>
                            {getRankBadge(member.rank)}
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">진도: </span>
                              <span className="font-medium text-card-foreground">{member.progress}%</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">주간 학습: </span>
                              <span className="font-medium text-card-foreground">{member.hoursThisWeek}시간</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">완료 과정: </span>
                              <span className="font-medium text-card-foreground">{member.completedCourses}개</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            {getImprovementIcon(member.improvement)}
                            <span className="text-sm font-medium text-card-foreground">
                              {member.improvement > 0 ? "+" : ""}
                              {member.improvement}%
                            </span>
                          </div>
                          <Progress value={member.progress} className="w-20 h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="courses" className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">과정별 분석</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.courseAnalytics.map((course, index) => (
                      <div key={index} className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-card-foreground">{course.courseName}</h4>
                          <Badge variant="secondary">{course.enrolledMembers}명 등록</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">완료율</div>
                            <div className="text-lg font-bold text-card-foreground">{course.completionRate}%</div>
                            <Progress value={course.completionRate} className="mt-1 h-1" />
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">평균 점수</div>
                            <div className="text-lg font-bold text-card-foreground">{course.averageScore}점</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">평균 학습시간</div>
                            <div className="text-lg font-bold text-card-foreground">{course.timeSpent}시간</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">주간 트렌드</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.weeklyStats.map((week, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="font-medium text-card-foreground">{week.week}</div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-card-foreground">{week.activeMembers}명 활성</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-card-foreground">{week.hoursLearned}시간</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-muted-foreground" />
                            <span className="text-card-foreground">{week.coursesCompleted}개 완료</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </RoleGuard>
  )
}
