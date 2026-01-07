"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Target, TrendingUp, Award } from "lucide-react"

interface ProgressData {
  dailyGoal: number
  dailyCompleted: number
  weeklyGoal: number
  weeklyCompleted: number
  monthlyGoal: number
  monthlyCompleted: number
  streak: number
  totalHours: number
  completedCourses: number
}

const progressData: ProgressData = {
  dailyGoal: 2, // hours
  dailyCompleted: 1.5,
  weeklyGoal: 10,
  weeklyCompleted: 8.5,
  monthlyGoal: 40,
  monthlyCompleted: 23.5,
  streak: 7,
  totalHours: 156.5,
  completedCourses: 12,
}

export function ProgressTracker() {
  const dailyProgress = (progressData.dailyCompleted / progressData.dailyGoal) * 100
  const weeklyProgress = (progressData.weeklyCompleted / progressData.weeklyGoal) * 100
  const monthlyProgress = (progressData.monthlyCompleted / progressData.monthlyGoal) * 100

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Daily Progress */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm text-card-foreground">
            <Target className="w-4 h-4 text-primary" />
            오늘의 목표
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">{progressData.dailyCompleted}h</span>
            <Badge variant={dailyProgress >= 100 ? "default" : "secondary"}>{Math.round(dailyProgress)}%</Badge>
          </div>
          <Progress value={dailyProgress} className="h-2" />
          <p className="text-xs text-muted-foreground">목표: {progressData.dailyGoal}시간</p>
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm text-card-foreground">
            <Calendar className="w-4 h-4 text-accent" />
            이번 주 진행률
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-accent">{progressData.weeklyCompleted}h</span>
            <Badge variant={weeklyProgress >= 100 ? "default" : "secondary"}>{Math.round(weeklyProgress)}%</Badge>
          </div>
          <Progress value={weeklyProgress} className="h-2" />
          <p className="text-xs text-muted-foreground">목표: {progressData.weeklyGoal}시간</p>
        </CardContent>
      </Card>

      {/* Monthly Progress */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm text-card-foreground">
            <TrendingUp className="w-4 h-4 text-chart-3" />
            이번 달 진행률
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-chart-3">{progressData.monthlyCompleted}h</span>
            <Badge variant={monthlyProgress >= 100 ? "default" : "secondary"}>{Math.round(monthlyProgress)}%</Badge>
          </div>
          <Progress value={monthlyProgress} className="h-2" />
          <p className="text-xs text-muted-foreground">목표: {progressData.monthlyGoal}시간</p>
        </CardContent>
      </Card>

      {/* Learning Streak */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm text-card-foreground">
            <Award className="w-4 h-4 text-chart-2" />
            연속 학습
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center">
            <span className="text-3xl font-bold text-chart-2">{progressData.streak}</span>
            <p className="text-sm text-muted-foreground">일 연속</p>
          </div>
          <div className="flex justify-center">
            <Badge variant="outline" className="text-chart-2 border-chart-2">
              🔥 연속 학습 중
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Total Hours */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm text-card-foreground">
            <Clock className="w-4 h-4 text-chart-4" />총 학습시간
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center">
            <span className="text-3xl font-bold text-chart-4">{progressData.totalHours}h</span>
            <p className="text-sm text-muted-foreground">누적 학습시간</p>
          </div>
          <div className="text-center">
            <Badge variant="outline" className="text-chart-4 border-chart-4">
              {progressData.completedCourses}개 코스 완료
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Achievement */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm text-card-foreground">
            <Award className="w-4 h-4 text-primary" />
            이번 달 성취
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">목표 달성률</span>
              <span className="font-semibold text-primary">87%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">완료한 강의</span>
              <span className="font-semibold text-accent">47개</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">평균 학습시간</span>
              <span className="font-semibold text-chart-3">1.8h/일</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
