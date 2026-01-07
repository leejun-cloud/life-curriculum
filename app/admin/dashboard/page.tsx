"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RoleGuard } from "@/components/role-guard"
import {
  Users,
  BookOpen,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  Settings,
  UserCheck,
  FileCheck,
  Globe,
} from "lucide-react"

interface PlatformStats {
  totalUsers: number
  activeUsers: number
  totalCurricula: number
  pendingApprovals: number
  totalLearningHours: number
  systemHealth: number
}

interface RecentActivity {
  id: string
  type: "user_signup" | "curriculum_created" | "content_approved" | "system_alert"
  message: string
  timestamp: Date
  status: "success" | "warning" | "error"
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 12847,
    activeUsers: 8932,
    totalCurricula: 1456,
    pendingApprovals: 23,
    totalLearningHours: 89432,
    systemHealth: 98,
  })

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: "1",
      type: "user_signup",
      message: "새로운 사용자 25명이 가입했습니다",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      status: "success",
    },
    {
      id: "2",
      type: "curriculum_created",
      message: "React 고급 패턴 커리큘럼이 승인 대기 중입니다",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      status: "warning",
    },
    {
      id: "3",
      type: "content_approved",
      message: "Python 머신러닝 커리큘럼이 승인되었습니다",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      status: "success",
    },
    {
      id: "4",
      type: "system_alert",
      message: "서버 응답 시간이 평소보다 높습니다",
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      status: "error",
    },
  ])

  const getActivityIcon = (type: RecentActivity["type"]) => {
    switch (type) {
      case "user_signup":
        return <UserCheck className="w-4 h-4" />
      case "curriculum_created":
        return <BookOpen className="w-4 h-4" />
      case "content_approved":
        return <CheckCircle className="w-4 h-4" />
      case "system_alert":
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: RecentActivity["status"]) => {
    switch (status) {
      case "success":
        return "text-primary"
      case "warning":
        return "text-chart-3"
      case "error":
        return "text-destructive"
    }
  }

  const formatTimeAgo = (timestamp: Date) => {
    const minutes = Math.floor((Date.now() - timestamp.getTime()) / (1000 * 60))
    if (minutes < 60) return `${minutes}분 전`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}시간 전`
    const days = Math.floor(hours / 24)
    return `${days}일 전`
  }

  // Navigation handlers for all buttons
  const handleUserManagement = () => {
    console.log("[v0] Navigating to user management")
    router.push("/admin/users")
  }

  const handleContentApproval = () => {
    console.log("[v0] Navigating to content approval")
    router.push("/admin/content")
  }

  const handleAnalytics = () => {
    console.log("[v0] Navigating to analytics")
    router.push("/admin/analytics")
  }

  const handleSystemSettings = () => {
    console.log("[v0] Navigating to system settings")
    router.push("/admin/settings")
  }

  const handleAllActivities = () => {
    console.log("[v0] Navigating to all activities")
    router.push("/admin/activities")
  }

  const handleSystemStatus = () => {
    console.log("[v0] Navigating to system status")
    router.push("/admin/status")
  }

  return (
    <RoleGuard
      allowedRoles={["admin"]}
      fallback={<div className="p-8 text-center text-muted-foreground">접근 권한이 없습니다.</div>}
    >
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold text-foreground">관리자 대시보드</h1>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="gap-1">
                  <Activity className="w-3 h-3" />
                  시스템 정상
                </Badge>
                <Button variant="outline" size="sm" onClick={handleSystemSettings}>
                  <Settings className="w-4 h-4 mr-2" />
                  설정
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">전체 사용자</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-card-foreground">{stats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    활성 사용자: {stats.activeUsers.toLocaleString()} (
                    {Math.round((stats.activeUsers / stats.totalUsers) * 100)}%)
                  </p>
                  <Progress value={(stats.activeUsers / stats.totalUsers) * 100} className="mt-2" />
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">커리큘럼</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-card-foreground">{stats.totalCurricula.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    승인 대기: <span className="text-chart-3 font-medium">{stats.pendingApprovals}</span>
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">학습 시간</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-card-foreground">
                    {stats.totalLearningHours.toLocaleString()}시간
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline w-3 h-3 mr-1" />
                    전월 대비 +12%
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">시스템 상태</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-card-foreground">{stats.systemHealth}%</div>
                  <p className="text-xs text-primary">모든 시스템 정상 작동</p>
                  <Progress value={stats.systemHealth} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">빠른 작업</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    className="h-20 flex-col gap-2 bg-transparent"
                    variant="outline"
                    onClick={handleUserManagement}
                  >
                    <Users className="w-6 h-6" />
                    <span>사용자 관리</span>
                  </Button>
                  <Button
                    className="h-20 flex-col gap-2 bg-transparent relative"
                    variant="outline"
                    onClick={handleContentApproval}
                  >
                    <FileCheck className="w-6 h-6" />
                    <span>콘텐츠 승인</span>
                    {stats.pendingApprovals > 0 && (
                      <Badge variant="destructive" className="absolute -top-2 -right-2">
                        {stats.pendingApprovals}
                      </Badge>
                    )}
                  </Button>
                  <Button className="h-20 flex-col gap-2 bg-transparent" variant="outline" onClick={handleAnalytics}>
                    <BarChart3 className="w-6 h-6" />
                    <span>분석 보고서</span>
                  </Button>
                  <Button
                    className="h-20 flex-col gap-2 bg-transparent"
                    variant="outline"
                    onClick={handleSystemSettings}
                  >
                    <Settings className="w-6 h-6" />
                    <span>시스템 설정</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">최근 활동</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className={`mt-0.5 ${getStatusColor(activity.status)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-card-foreground">{activity.message}</p>
                          <p className="text-xs text-muted-foreground">{formatTimeAgo(activity.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4 bg-transparent" onClick={handleAllActivities}>
                    모든 활동 보기
                  </Button>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">시스템 상태</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-sm text-card-foreground">웹 서버</span>
                      </div>
                      <Badge variant="secondary">정상</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-sm text-card-foreground">데이터베이스</span>
                      </div>
                      <Badge variant="secondary">정상</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-chart-3" />
                        <span className="text-sm text-card-foreground">CDN</span>
                      </div>
                      <Badge variant="outline">지연</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-sm text-card-foreground">백업 시스템</span>
                      </div>
                      <Badge variant="secondary">정상</Badge>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4 bg-transparent" onClick={handleSystemStatus}>
                    <Globe className="w-4 h-4 mr-2" />
                    시스템 상태 페이지
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </RoleGuard>
  )
}
