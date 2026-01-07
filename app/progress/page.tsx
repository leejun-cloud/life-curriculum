"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressTracker } from "@/components/progress-tracker"
import { ArrowLeft, Calendar, BarChart3, Target, Plus } from "lucide-react"
import Link from "next/link"

export default function ProgressPage() {
  const [selectedDate, setSelectedDate] = useState<number | null>(15)
  const [learningDays] = useState([1, 2, 3, 5, 8, 9, 10, 12, 14, 15, 16, 17])

  const handleDateClick = (day: number) => {
    if (day > 0 && day <= 31) {
      setSelectedDate(day)
      console.log("[v0] Selected date:", day)

      if (learningDays.includes(day)) {
        alert(`${day}일에 2시간 30분 학습했습니다!\n- React 기초 강의 (1시간 20분)\n- JavaScript 문법 (1시간 10분)`)
      } else {
        alert(`${day}일에는 학습 기록이 없습니다.`)
      }
    }
  }

  const setLearningGoal = () => {
    const goal = prompt("이번 달 학습 목표 시간을 입력하세요 (시간):", "40")
    if (goal) {
      console.log("[v0] Setting learning goal:", goal, "hours")
      alert(`이번 달 학습 목표가 ${goal}시간으로 설정되었습니다!`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">학습 진행률</h1>
            </div>
            <div className="ml-auto">
              <Button size="sm" onClick={setLearningGoal}>
                <Target className="w-4 h-4 mr-2" />
                목표 설정
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Progress Overview */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">진행률 대시보드</h2>
            <ProgressTracker />
          </div>

          {/* Learning Calendar */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Calendar className="w-5 h-5 text-primary" />
                학습 달력
                {selectedDate && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">({selectedDate}일 선택됨)</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }, (_, i) => {
                  const day = i - 6 + 1
                  const isToday = day === 15
                  const hasLearning = learningDays.includes(day)
                  const isCurrentMonth = day > 0 && day <= 31
                  const isSelected = day === selectedDate

                  return (
                    <div
                      key={i}
                      onClick={() => handleDateClick(day)}
                      className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-colors cursor-pointer ${
                        !isCurrentMonth
                          ? "text-muted-foreground/50"
                          : isSelected
                            ? "bg-primary text-primary-foreground font-bold ring-2 ring-primary/50"
                            : isToday
                              ? "bg-primary text-primary-foreground font-bold"
                              : hasLearning
                                ? "bg-accent/20 text-accent font-medium hover:bg-accent/30"
                                : "hover:bg-muted/50"
                      }`}
                    >
                      {isCurrentMonth ? day : ""}
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-accent/20 rounded"></div>
                  <span className="text-muted-foreground">학습한 날</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded"></div>
                  <span className="text-muted-foreground">오늘</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded ring-2 ring-primary/50"></div>
                  <span className="text-muted-foreground">선택된 날</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Plus className="w-5 h-5 text-primary" />
                빠른 작업
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 bg-transparent"
                onClick={() => {
                  console.log("[v0] Adding manual learning record")
                  alert("학습 기록 추가 기능을 준비 중입니다!")
                }}
              >
                <Plus className="w-5 h-5" />
                학습 기록 추가
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 bg-transparent"
                onClick={() => {
                  console.log("[v0] Exporting progress report")
                  alert("진행률 리포트를 내보내는 중...")
                }}
              >
                <BarChart3 className="w-5 h-5" />
                리포트 내보내기
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent" onClick={setLearningGoal}>
                <Target className="w-5 h-5" />
                목표 수정
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
