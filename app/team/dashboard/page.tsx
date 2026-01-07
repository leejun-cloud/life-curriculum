"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RoleGuard } from "@/components/role-guard"
import {
  Users,
  BookOpen,
  Clock,
  TrendingUp,
  Target,
  Award,
  MessageSquare,
  UserPlus,
  Settings,
  BarChart3,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: "member" | "co_leader"
  joinedAt: Date
  progress: number
  completedCourses: number
  totalLearningHours: number
  lastActive: Date
  status: "active" | "inactive" | "pending"
  tags: string[]
  position?: string
  expertise?: string[]
}

interface TeamStats {
  totalMembers: number
  activeMembers: number
  averageProgress: number
  totalCourses: number
  completedCourses: number
  totalLearningHours: number
  teamGoalProgress: number
}

export default function TeamDashboard() {
  const router = useRouter()
  const [teamStats, setTeamStats] = useState<TeamStats>({
    totalMembers: 12,
    activeMembers: 9,
    averageProgress: 68,
    totalCourses: 8,
    completedCourses: 5,
    totalLearningHours: 342,
    teamGoalProgress: 75,
  })

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "김민준",
      email: "minjun.kim@example.com",
      role: "member",
      joinedAt: new Date("2024-01-15"),
      progress: 85,
      completedCourses: 3,
      totalLearningHours: 45,
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: "active",
      tags: ["프론트엔드", "React", "시니어"],
      position: "시니어 개발자",
      expertise: ["React", "TypeScript", "Next.js"],
    },
    {
      id: "2",
      name: "이서연",
      email: "seoyeon.lee@example.com",
      role: "co_leader",
      joinedAt: new Date("2024-01-10"),
      progress: 92,
      completedCourses: 4,
      totalLearningHours: 62,
      lastActive: new Date(Date.now() - 30 * 60 * 1000),
      status: "active",
      tags: ["UI/UX", "디자인", "리드"],
      position: "디자인 리드",
      expertise: ["Figma", "UI/UX", "프로토타이핑"],
    },
    {
      id: "3",
      name: "박지훈",
      email: "jihoon.park@example.com",
      role: "member",
      joinedAt: new Date("2024-01-20"),
      progress: 45,
      completedCourses: 1,
      totalLearningHours: 28,
      lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: "inactive",
      tags: ["마케팅", "콘텐츠", "주니어"],
      position: "마케팅 담당자",
      expertise: ["콘텐츠 마케팅", "SNS", "브랜딩"],
    },
    {
      id: "4",
      name: "최유진",
      email: "yujin.choi@example.com",
      role: "member",
      joinedAt: new Date("2024-02-01"),
      progress: 15,
      completedCourses: 0,
      totalLearningHours: 8,
      lastActive: new Date(Date.now() - 5 * 60 * 1000),
      status: "pending",
      tags: ["신입", "백엔드", "학습중"],
      position: "신입 개발자",
      expertise: ["Java", "Spring", "MySQL"],
    },
  ])

  const getStatusColor = (status: TeamMember["status"]) => {
    switch (status) {
      case "active":
        return "text-primary"
      case "inactive":
        return "text-muted-foreground"
      case "pending":
        return "text-chart-3"
    }
  }

  const getStatusBadge = (status: TeamMember["status"]) => {
    switch (status) {
      case "active":
        return <Badge variant="secondary">활성</Badge>
      case "inactive":
        return <Badge variant="outline">비활성</Badge>
      case "pending":
        return <Badge variant="destructive">대기</Badge>
    }
  }

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60))
    if (minutes < 60) return `${minutes}분 전`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}시간 전`
    const days = Math.floor(hours / 24)
    return `${days}일 전`
  }

  const handleInviteMembers = () => {
    console.log("[v0] Opening team member invitation")
    router.push("/team/invite")
  }

  const handleViewAllMembers = () => {
    console.log("[v0] Navigating to all team members")
    router.push("/team/members")
  }

  const handleTeamSettings = () => {
    console.log("[v0] Opening team settings")
    router.push("/team/settings")
  }

  const handleAnnouncements = () => {
    console.log("[v0] Opening team announcements")
    router.push("/team/announcements")
  }

  const handleAnalytics = () => {
    console.log("[v0] Opening team analytics")
    router.push("/team/analytics")
  }

  const handleSchedule = () => {
    console.log("[v0] Opening team schedule")
    router.push("/team/schedule")
  }

  const handleTeamCurriculum = () => {
    console.log("[v0] Opening team curriculum")
    router.push("/team/curriculum")
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
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">팀 대시보드</h1>
                  <p className="text-sm text-muted-foreground">프론트엔드 개발팀</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={handleInviteMembers}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  팀원 초대
                </Button>
                <Button variant="outline" size="sm" onClick={handleTeamSettings}>
                  <Settings className="w-4 h-4 mr-2" />팀 설정
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Team Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">팀원 수</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-card-foreground">{teamStats.totalMembers}</div>
                  <p className="text-xs text-muted-foreground">
                    활성: {teamStats.activeMembers} (
                    {Math.round((teamStats.activeMembers / teamStats.totalMembers) * 100)}%)
                  </p>
                  <Progress value={(teamStats.activeMembers / teamStats.totalMembers) * 100} className="mt-2" />
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">평균 진도</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-card-foreground">{teamStats.averageProgress}%</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline w-3 h-3 mr-1" />
                    전주 대비 +5%
                  </p>
                  <Progress value={teamStats.averageProgress} className="mt-2" />
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">완료 과정</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-card-foreground">
                    {teamStats.completedCourses}/{teamStats.totalCourses}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    완료율: {Math.round((teamStats.completedCourses / teamStats.totalCourses) * 100)}%
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">학습 시간</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-card-foreground">{teamStats.totalLearningHours}시간</div>
                  <p className="text-xs text-muted-foreground">
                    평균: {Math.round(teamStats.totalLearningHours / teamStats.totalMembers)}시간/인
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">빠른 작업</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    className="h-16 flex-col gap-1 bg-transparent"
                    variant="outline"
                    onClick={handleTeamCurriculum}
                  >
                    <BookOpen className="w-5 h-5" />
                    <span className="text-xs">팀 커리큘럼</span>
                  </Button>
                  <Button
                    className="h-16 flex-col gap-1 bg-transparent"
                    variant="outline"
                    onClick={handleAnnouncements}
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-xs">공지사항</span>
                  </Button>
                  <Button className="h-16 flex-col gap-1 bg-transparent" variant="outline" onClick={handleAnalytics}>
                    <BarChart3 className="w-5 h-5" />
                    <span className="text-xs">분석 보고서</span>
                  </Button>
                  <Button className="h-16 flex-col gap-1 bg-transparent" variant="outline" onClick={handleSchedule}>
                    <Calendar className="w-5 h-5" />
                    <span className="text-xs">일정 관리</span>
                  </Button>
                  <Button className="h-16 flex-col gap-1 bg-transparent" variant="outline" onClick={handleTeamSettings}>
                    <Settings className="w-5 h-5" />
                    <span className="text-xs">팀 설정</span>
                  </Button>
                  <Button
                    className="h-16 flex-col gap-1 bg-transparent"
                    variant="outline"
                    onClick={handleViewAllMembers}
                  >
                    <Users className="w-5 h-5" />
                    <span className="text-xs">팀원 관리</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Team Goal Progress */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Award className="w-5 h-5 text-primary" />팀 목표 진행률
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-card-foreground">Q1 React 마스터 과정 완료</span>
                    <span className="text-sm text-muted-foreground">{teamStats.teamGoalProgress}%</span>
                  </div>
                  <Progress value={teamStats.teamGoalProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    목표 달성까지 {100 - teamStats.teamGoalProgress}% 남음 (예상 완료: 3월 15일)
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Team Members */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-card-foreground">팀원 현황</CardTitle>
                    <Button variant="outline" size="sm" className="bg-transparent" onClick={handleInviteMembers}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      초대
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-card-foreground">{member.name}</h4>
                            {member.role === "co_leader" && <Badge variant="secondary">부팀장</Badge>}
                            {getStatusBadge(member.status)}
                          </div>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {member.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span>진도: {member.progress}%</span>
                            <span>완료: {member.completedCourses}개</span>
                            <span>마지막 활동: {formatTimeAgo(member.lastActive)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-card-foreground">
                            {member.totalLearningHours}시간
                          </div>
                          <Progress value={member.progress} className="w-16 h-1 mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4 bg-transparent" onClick={handleViewAllMembers}>
                    모든 팀원 보기
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Notifications */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">최근 알림</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-2 bg-muted/50 rounded">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                      <div className="flex-1 text-sm">
                        <p className="text-card-foreground">김민준님이 React 기초 과정을 완료했습니다</p>
                        <p className="text-xs text-muted-foreground">2시간 전</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-2 bg-muted/50 rounded">
                      <AlertCircle className="w-4 h-4 text-chart-3 mt-0.5" />
                      <div className="flex-1 text-sm">
                        <p className="text-card-foreground">박지훈님이 3일간 비활성 상태입니다</p>
                        <p className="text-xs text-muted-foreground">1일 전</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-2 bg-muted/50 rounded">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                      <div className="flex-1 text-sm">
                        <p className="text-card-foreground">새로운 팀원 최유진님이 합류했습니다</p>
                        <p className="text-xs text-muted-foreground">3일 전</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </RoleGuard>
  )
}
