"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RoleGuard } from "@/components/role-guard"
import {
  BarChart3,
  Users,
  BookOpen,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Award,
  Calendar,
} from "lucide-react"

interface AnalyticsData {
  userGrowth: {
    total: number
    thisMonth: number
    growth: number
  }
  contentStats: {
    totalCurricula: number
    activeCurricula: number
    averageRating: number
    completionRate: number
  }
  learningStats: {
    totalHours: number
    averageSessionTime: number
    dailyActiveUsers: number
    weeklyRetention: number
  }
  topCategories: Array<{
    name: string
    count: number
    growth: number
  }>
  topCurricula: Array<{
    title: string
    author: string
    enrollments: number
    rating: number
    completionRate: number
  }>
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d")

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    userGrowth: {
      total: 12847,
      thisMonth: 1234,
      growth: 12.5,
    },
    contentStats: {
      totalCurricula: 1456,
      activeCurricula: 1289,
      averageRating: 4.6,
      completionRate: 68.3,
    },
    learningStats: {
      totalHours: 89432,
      averageSessionTime: 45,
      dailyActiveUsers: 3421,
      weeklyRetention: 72.8,
    },
    topCategories: [
      { name: "기술", count: 456, growth: 15.2 },
      { name: "언어", count: 234, growth: 8.7 },
      { name: "비즈니스", count: 189, growth: -2.1 },
      { name: "디자인", count: 167, growth: 22.4 },
      { name: "마케팅", count: 145, growth: 5.8 },
    ],
    topCurricula: [
      {
        title: "React 완벽 마스터",
        author: "김민준",
        enrollments: 2341,
        rating: 4.8,
        completionRate: 78.5,
      },
      {
        title: "Python 데이터 분석",
        author: "박지훈",
        enrollments: 1987,
        rating: 4.7,
        completionRate: 65.2,
      },
      {
        title: "영어 회화 완성",
        author: "이서연",
        enrollments: 1654,
        rating: 4.6,
        completionRate: 82.1,
      },
      {
        title: "디지털 마케팅",
        author: "최유진",
        enrollments: 1432,
        rating: 4.5,
        completionRate: 59.8,
      },
    ],
  })

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case "7d":
        return "최근 7일"
      case "30d":
        return "최근 30일"
      case "90d":
        return "최근 90일"
      case "1y":
        return "최근 1년"
      default:
        return "최근 30일"
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <RoleGuard
      allowedRoles={["admin"]}
      fallback={<div className="p-8 text-center text-muted-foreground">관리자 권한이 필요합니다.</div>}
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
                <h1 className="text-xl font-bold text-foreground">분석 대시보드</h1>
              </div>
              <div className="flex items-center gap-2">
                {(["7d", "30d", "90d", "1y"] as const).map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeRange(range)}
                  >
                    {getTimeRangeLabel(range)}
                  </Button>
                ))}
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
                  <CardTitle className="text-sm font-medium text-card-foreground">총 사용자</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-card-foreground">
                    {formatNumber(analyticsData.userGrowth.total)}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-primary" />+{analyticsData.userGrowth.growth}% (
                    {formatNumber(analyticsData.userGrowth.thisMonth)}명)
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">활성 커리큘럼</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-card-foreground">
                    {formatNumber(analyticsData.contentStats.activeCurricula)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    전체 {formatNumber(analyticsData.contentStats.totalCurricula)}개 중{" "}
                    {Math.round(
                      (analyticsData.contentStats.activeCurricula / analyticsData.contentStats.totalCurricula) * 100,
                    )}
                    %
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">총 학습 시간</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-card-foreground">
                    {formatNumber(analyticsData.learningStats.totalHours)}시간
                  </div>
                  <p className="text-xs text-muted-foreground">
                    평균 세션: {analyticsData.learningStats.averageSessionTime}분
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">완료율</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-card-foreground">
                    {analyticsData.contentStats.completionRate}%
                  </div>
                  <Progress value={analyticsData.contentStats.completionRate} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Categories */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">인기 카테고리</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.topCategories.map((category, index) => (
                      <div key={category.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">#{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-card-foreground">{category.name}</h4>
                            <p className="text-sm text-muted-foreground">{category.count}개 커리큘럼</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`flex items-center gap-1 text-sm ${
                              category.growth >= 0 ? "text-primary" : "text-destructive"
                            }`}
                          >
                            {category.growth >= 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {Math.abs(category.growth)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Curricula */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">인기 커리큘럼</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.topCurricula.map((curriculum, index) => (
                      <div key={curriculum.title} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-card-foreground">{curriculum.title}</h4>
                            <p className="text-sm text-muted-foreground">by {curriculum.author}</p>
                          </div>
                          <Badge variant="outline">#{index + 1}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">등록:</span>
                            <span className="ml-1 font-medium text-card-foreground">
                              {formatNumber(curriculum.enrollments)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">평점:</span>
                            <span className="ml-1 font-medium text-card-foreground">{curriculum.rating}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">완료:</span>
                            <span className="ml-1 font-medium text-card-foreground">{curriculum.completionRate}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <Activity className="w-5 h-5 text-primary" />
                    사용자 활동
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">일일 활성 사용자</span>
                    <span className="font-medium text-card-foreground">
                      {formatNumber(analyticsData.learningStats.dailyActiveUsers)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">주간 유지율</span>
                    <span className="font-medium text-card-foreground">
                      {analyticsData.learningStats.weeklyRetention}%
                    </span>
                  </div>
                  <Progress value={analyticsData.learningStats.weeklyRetention} />
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <Award className="w-5 h-5 text-primary" />
                    콘텐츠 품질
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">평균 평점</span>
                    <span className="font-medium text-card-foreground">
                      {analyticsData.contentStats.averageRating}/5.0
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">완료율</span>
                    <span className="font-medium text-card-foreground">
                      {analyticsData.contentStats.completionRate}%
                    </span>
                  </div>
                  <Progress value={analyticsData.contentStats.averageRating * 20} />
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <Calendar className="w-5 h-5 text-primary" />
                    성장 지표
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">월간 성장률</span>
                    <span className="font-medium text-primary">+{analyticsData.userGrowth.growth}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">신규 사용자</span>
                    <span className="font-medium text-card-foreground">
                      {formatNumber(analyticsData.userGrowth.thisMonth)}명
                    </span>
                  </div>
                  <Progress value={Math.min(analyticsData.userGrowth.growth * 5, 100)} />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </RoleGuard>
  )
}
