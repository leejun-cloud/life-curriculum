"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { RoleGuard } from "@/components/role-guard"
import { MessageSquare, Plus, Pin, Calendar, Users } from "lucide-react"

interface Announcement {
  id: string
  title: string
  content: string
  author: string
  createdAt: Date
  isPinned: boolean
  priority: "low" | "medium" | "high"
}

export default function TeamAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: "1",
      title: "Q1 학습 목표 설정 완료",
      content: "팀 전체의 Q1 학습 목표가 설정되었습니다. React 마스터 과정을 3월 15일까지 완료하는 것이 목표입니다.",
      author: "김태현",
      createdAt: new Date("2024-02-01"),
      isPinned: true,
      priority: "high",
    },
    {
      id: "2",
      title: "주간 팀 미팅 일정 변경",
      content: "이번 주 팀 미팅이 목요일 오후 3시로 변경되었습니다. Zoom 링크는 별도로 공유드리겠습니다.",
      author: "김태현",
      createdAt: new Date("2024-01-29"),
      isPinned: false,
      priority: "medium",
    },
  ])

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium")

  const handleCreateAnnouncement = () => {
    if (!newTitle.trim() || !newContent.trim()) return

    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      title: newTitle,
      content: newContent,
      author: "김태현",
      createdAt: new Date(),
      isPinned: false,
      priority: newPriority,
    }

    setAnnouncements([newAnnouncement, ...announcements])
    setNewTitle("")
    setNewContent("")
    setNewPriority("medium")
    setShowCreateForm(false)
    console.log("[v0] New announcement created:", newAnnouncement)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">높음</Badge>
      case "medium":
        return <Badge variant="secondary">보통</Badge>
      case "low":
        return <Badge variant="outline">낮음</Badge>
      default:
        return <Badge variant="outline">보통</Badge>
    }
  }

  return (
    <RoleGuard
      allowedRoles={["team_leader", "admin"]}
      fallback={<div className="p-8 text-center text-muted-foreground">팀장 권한이 필요합니다.</div>}
    >
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">팀 공지사항</h1>
                  <p className="text-sm text-muted-foreground">팀원들에게 중요한 소식을 전달하세요</p>
                </div>
              </div>
              <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                <Plus className="w-4 h-4 mr-2" />새 공지사항
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 새 공지사항 작성 폼 */}
          {showCreateForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>새 공지사항 작성</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">제목</Label>
                  <Input
                    id="title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="공지사항 제목을 입력하세요"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="content">내용</Label>
                  <Textarea
                    id="content"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="공지사항 내용을 입력하세요"
                    className="mt-1"
                    rows={6}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">우선순위</Label>
                  <select
                    id="priority"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as "low" | "medium" | "high")}
                    className="mt-1 w-full p-2 border border-border rounded-md bg-background"
                  >
                    <option value="low">낮음</option>
                    <option value="medium">보통</option>
                    <option value="high">높음</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateAnnouncement}>공지사항 게시</Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    취소
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 공지사항 목록 */}
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id} className={announcement.isPinned ? "border-primary" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {announcement.isPinned && <Pin className="w-4 h-4 text-primary" />}
                        <h3 className="font-semibold text-lg">{announcement.title}</h3>
                        {getPriorityBadge(announcement.priority)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {announcement.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {announcement.createdAt.toLocaleDateString("ko-KR")}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-card-foreground whitespace-pre-wrap">{announcement.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </RoleGuard>
  )
}
