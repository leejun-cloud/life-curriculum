"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RoleGuard } from "@/components/role-guard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Calendar,
  Clock,
  Users,
  Plus,
  ArrowLeft,
  MapPin,
  Video,
  BookOpen,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface ScheduleEvent {
  id: string
  title: string
  description: string
  date: string
  time: string
  duration: number
  type: "meeting" | "deadline" | "study" | "review"
  attendees: string[]
  location?: string
  isOnline: boolean
  status: "upcoming" | "ongoing" | "completed" | "cancelled"
  priority: "low" | "medium" | "high"
}

export default function TeamSchedule() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: 60,
    type: "meeting" as const,
    attendees: [] as string[],
    location: "",
    isOnline: true,
    priority: "medium" as const,
  })

  const [events, setEvents] = useState<ScheduleEvent[]>([
    {
      id: "1",
      title: "React 스터디 세션",
      description: "React Hooks 심화 학습 및 실습",
      date: "2024-03-15",
      time: "14:00",
      duration: 120,
      type: "study",
      attendees: ["김민준", "이서연", "최유진"],
      isOnline: true,
      status: "upcoming",
      priority: "high",
    },
    {
      id: "2",
      title: "프로젝트 진도 회의",
      description: "주간 진도 점검 및 다음 주 계획 수립",
      date: "2024-03-16",
      time: "10:00",
      duration: 60,
      type: "meeting",
      attendees: ["김민준", "이서연", "박지훈", "최유진"],
      location: "회의실 A",
      isOnline: false,
      status: "upcoming",
      priority: "medium",
    },
    {
      id: "3",
      title: "TypeScript 과제 제출",
      description: "TypeScript 고급 패턴 과제 제출 마감",
      date: "2024-03-18",
      time: "23:59",
      duration: 0,
      type: "deadline",
      attendees: ["김민준", "최유진"],
      isOnline: true,
      status: "upcoming",
      priority: "high",
    },
    {
      id: "4",
      title: "코드 리뷰 세션",
      description: "팀 프로젝트 코드 리뷰 및 피드백",
      date: "2024-03-14",
      time: "16:00",
      duration: 90,
      type: "review",
      attendees: ["김민준", "이서연"],
      isOnline: true,
      status: "completed",
      priority: "medium",
    },
  ])

  const teamMembers = [
    { id: "1", name: "김민준", email: "minjun.kim@example.com" },
    { id: "2", name: "이서연", email: "seoyeon.lee@example.com" },
    { id: "3", name: "박지훈", email: "jihoon.park@example.com" },
    { id: "4", name: "최유진", email: "yujin.choi@example.com" },
  ]

  const getEventTypeIcon = (type: ScheduleEvent["type"]) => {
    switch (type) {
      case "meeting":
        return <Users className="w-4 h-4" />
      case "deadline":
        return <AlertCircle className="w-4 h-4" />
      case "study":
        return <BookOpen className="w-4 h-4" />
      case "review":
        return <CheckCircle className="w-4 h-4" />
    }
  }

  const getEventTypeColor = (type: ScheduleEvent["type"]) => {
    switch (type) {
      case "meeting":
        return "bg-blue-500"
      case "deadline":
        return "bg-red-500"
      case "study":
        return "bg-green-500"
      case "review":
        return "bg-purple-500"
    }
  }

  const getPriorityBadge = (priority: ScheduleEvent["priority"]) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">높음</Badge>
      case "medium":
        return <Badge variant="secondary">보통</Badge>
      case "low":
        return <Badge variant="outline">낮음</Badge>
    }
  }

  const getStatusBadge = (status: ScheduleEvent["status"]) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-blue-500 text-white">예정</Badge>
      case "ongoing":
        return <Badge className="bg-green-500 text-white">진행중</Badge>
      case "completed":
        return <Badge variant="secondary">완료</Badge>
      case "cancelled":
        return <Badge variant="destructive">취소</Badge>
    }
  }

  const handleAddEvent = () => {
    const event: ScheduleEvent = {
      id: Date.now().toString(),
      ...newEvent,
      status: "upcoming",
    }
    setEvents([...events, event])
    setNewEvent({
      title: "",
      description: "",
      date: "",
      time: "",
      duration: 60,
      type: "meeting",
      attendees: [],
      location: "",
      isOnline: true,
      priority: "medium",
    })
    setShowAddEvent(false)
    console.log("[v0] New event added:", event.title)
  }

  const todayEvents = events.filter((event) => event.date === new Date().toISOString().split("T")[0])
  const upcomingEvents = events.filter((event) => event.status === "upcoming").slice(0, 5)

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
                  <Calendar className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">팀 일정 관리</h1>
                  <p className="text-sm text-muted-foreground">프론트엔드 개발팀</p>
                </div>
              </div>
              <Button onClick={() => setShowAddEvent(true)}>
                <Plus className="w-4 h-4 mr-2" />
                일정 추가
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue="calendar" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="calendar">캘린더</TabsTrigger>
              <TabsTrigger value="upcoming">예정된 일정</TabsTrigger>
              <TabsTrigger value="history">지난 일정</TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Events */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">오늘의 일정</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {todayEvents.length > 0 ? (
                      <div className="space-y-3">
                        {todayEvents.map((event) => (
                          <div key={event.id} className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)}`} />
                              <h4 className="font-medium text-card-foreground">{event.title}</h4>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {event.time}
                              {event.duration > 0 && ` (${event.duration}분)`}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">오늘 예정된 일정이 없습니다.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">일정 현황</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">이번 주 일정</span>
                        <span className="font-medium text-card-foreground">
                          {events.filter((e) => e.status === "upcoming").length}개
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">완료된 일정</span>
                        <span className="font-medium text-card-foreground">
                          {events.filter((e) => e.status === "completed").length}개
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">마감 임박</span>
                        <span className="font-medium text-red-500">
                          {events.filter((e) => e.type === "deadline" && e.status === "upcoming").length}개
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Team Availability */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">팀원 가용성</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {teamMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src="/placeholder.svg" />
                              <AvatarFallback className="text-xs">{member.name.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-card-foreground">{member.name}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            가능
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">예정된 일정</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full ${getEventTypeColor(event.type)}`} />
                            <div>
                              <h4 className="font-medium text-card-foreground">{event.title}</h4>
                              <p className="text-sm text-muted-foreground">{event.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getPriorityBadge(event.priority)}
                            {getStatusBadge(event.status)}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-card-foreground">{event.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-card-foreground">
                              {event.time}
                              {event.duration > 0 && ` (${event.duration}분)`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {event.isOnline ? (
                              <Video className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                            )}
                            <span className="text-card-foreground">
                              {event.isOnline ? "온라인" : event.location || "오프라인"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-card-foreground">{event.attendees.length}명 참석</span>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">참석자:</span>
                          {event.attendees.map((attendee, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {attendee}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">지난 일정</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {events
                      .filter((event) => event.status === "completed")
                      .map((event) => (
                        <div key={event.id} className="p-4 bg-muted/50 rounded-lg opacity-75">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full ${getEventTypeColor(event.type)}`} />
                              <h4 className="font-medium text-card-foreground">{event.title}</h4>
                            </div>
                            {getStatusBadge(event.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{event.date}</span>
                            <span>{event.time}</span>
                            <span>{event.attendees.length}명 참석</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Add Event Modal */}
          {showAddEvent && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4">
                <CardHeader>
                  <CardTitle>새 일정 추가</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">제목</Label>
                    <Input
                      id="title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      placeholder="일정 제목을 입력하세요"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">설명</Label>
                    <Textarea
                      id="description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      placeholder="일정 설명을 입력하세요"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">날짜</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">시간</Label>
                      <Input
                        id="time"
                        type="time"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button onClick={handleAddEvent} className="flex-1">
                      추가
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddEvent(false)} className="flex-1">
                      취소
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </RoleGuard>
  )
}
