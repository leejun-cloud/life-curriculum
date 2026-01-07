"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, FileText, Upload, Plus, Users, Clock, CheckCircle } from "lucide-react"
import { RoleGuard } from "@/components/role-guard"

interface Assignment {
  id: string
  title: string
  description: string
  type: "video_note" | "blog_post" | "file_upload"
  deadline: string
  curriculumId?: string
  videoId?: string
  createdAt: string
  submissions: Submission[]
}

interface Submission {
  id: string
  studentName: string
  content?: string
  fileUrl?: string
  fileName?: string
  submittedAt: string
  status: "submitted" | "reviewed" | "approved"
  feedback?: string
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    type: "blog_post" as const,
    deadline: "",
    curriculumId: "",
    videoId: "",
  })

  useEffect(() => {
    const saved = localStorage.getItem("teamAssignments")
    if (saved) {
      setAssignments(JSON.parse(saved))
    } else {
      setAssignments([])
      localStorage.setItem("teamAssignments", JSON.stringify([]))
    }
  }, [])

  const handleCreateAssignment = () => {
    if (!newAssignment.title || !newAssignment.deadline) {
      alert("제목과 제출 기한을 입력해주세요.")
      return
    }

    const assignment: Assignment = {
      id: Date.now().toString(),
      ...newAssignment,
      createdAt: new Date().toISOString().split("T")[0],
      submissions: [],
    }

    const updated = [...assignments, assignment]
    setAssignments(updated)
    localStorage.setItem("teamAssignments", JSON.stringify(updated))

    console.log("[v0] Created new assignment:", assignment.title)
    alert(`새 과제 "${newAssignment.title}"이 생성되었습니다. 팀원들에게 알림이 전송되었습니다.`)

    setNewAssignment({
      title: "",
      description: "",
      type: "blog_post",
      deadline: "",
      curriculumId: "",
      videoId: "",
    })
    setShowCreateForm(false)
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "video_note":
        return "영상 노트"
      case "blog_post":
        return "블로그 글"
      case "file_upload":
        return "파일 제출"
      default:
        return type
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video_note":
        return <Calendar className="w-4 h-4" />
      case "blog_post":
        return <FileText className="w-4 h-4" />
      case "file_upload":
        return <Upload className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "reviewed":
        return "bg-blue-100 text-blue-800"
      case "submitted":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "승인됨"
      case "reviewed":
        return "검토됨"
      case "submitted":
        return "제출됨"
      default:
        return status
    }
  }

  return (
    <RoleGuard allowedRoles={["team_leader", "admin"]}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="glass-effect border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-violet rounded-2xl flex items-center justify-center glow-violet">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gradient-violet">Assignment Management</h1>
                  <p className="text-xs text-muted-foreground">팀원들의 과제물을 생성하고 관리하세요</p>
                </div>
              </div>
              <Button onClick={() => setShowCreateForm(true)} className="gradient-violet">
                <Plus className="w-4 h-4 mr-2" />새 과제 생성
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">

            {showCreateForm && (
              <Card className="bg-card/50 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />새 과제 생성
                  </CardTitle>
                  <CardDescription>팀원들이 제출할 과제를 만들어보세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">과제 제목 *</Label>
                      <Input
                        id="title"
                        value={newAssignment.title}
                        onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                        placeholder="예: React Hooks 학습 후기"
                        className="bg-input border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deadline">제출 기한 *</Label>
                      <Input
                        id="deadline"
                        type="datetime-local"
                        value={newAssignment.deadline}
                        onChange={(e) => setNewAssignment({ ...newAssignment, deadline: e.target.value })}
                        className="bg-input border-border/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">과제 설명</Label>
                    <Textarea
                      id="description"
                      value={newAssignment.description}
                      onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                      placeholder="과제에 대한 자세한 설명을 입력하세요"
                      rows={4}
                      className="bg-input border-border/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>과제 유형</Label>
                    <div className="flex gap-2">
                      {[
                        { value: "blog_post", label: "블로그 글", icon: FileText },
                        { value: "file_upload", label: "파일 제출", icon: Upload },
                        { value: "video_note", label: "영상 노트", icon: Calendar },
                      ].map(({ value, label, icon: Icon }) => (
                        <Button
                          key={value}
                          variant={newAssignment.type === value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setNewAssignment({ ...newAssignment, type: value as any })}
                          className={newAssignment.type === value ? "gradient-violet" : "border-primary/30"}
                        >
                          <Icon className="w-4 h-4 mr-1" />
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleCreateAssignment} className="gradient-violet">
                      <Plus className="w-4 h-4 mr-2" />
                      과제 생성 및 알림 전송
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateForm(false)} className="border-border/50">
                      취소
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Tabs defaultValue="all" className="space-y-6">
              <TabsList>
                <TabsTrigger value="all">전체 과제</TabsTrigger>
                <TabsTrigger value="pending">미제출</TabsTrigger>
                <TabsTrigger value="submitted">제출됨</TabsTrigger>
                <TabsTrigger value="reviewed">검토완료</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-6">
                <div className="grid gap-6">
                  {assignments.map((assignment) => (
                    <Card key={assignment.id} className="bg-card/50 border-primary/20 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-xl">{assignment.title}</CardTitle>
                              <Badge variant="secondary" className="flex items-center gap-1 bg-primary/20 text-primary">
                                {getTypeIcon(assignment.type)}
                                {getTypeLabel(assignment.type)}
                              </Badge>
                            </div>
                            <CardDescription>{assignment.description}</CardDescription>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(assignment.deadline).toLocaleString("ko-KR")}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Users className="w-4 h-4" />
                                {assignment.submissions.length}명 제출
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <CheckCircle className="w-4 h-4" />
                                {assignment.submissions.filter((s) => s.status === "approved").length}명 승인
                              </div>
                            </div>
                            <Button size="sm" variant="outline" className="border-primary/30 hover:bg-primary/10">
                              <FileText className="w-4 h-4 mr-1" />
                              제출물 보기
                            </Button>
                          </div>

                          {assignment.submissions.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">최근 제출물</h4>
                              <div className="space-y-2">
                                {assignment.submissions.slice(0, 3).map((submission) => (
                                  <div
                                    key={submission.id}
                                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="font-medium text-sm">{submission.studentName}</div>
                                      <Badge className={getStatusColor(submission.status)} variant="secondary">
                                        {getStatusLabel(submission.status)}
                                      </Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {new Date(submission.submittedAt).toLocaleDateString("ko-KR")}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="pending">
                <Card className="text-center py-12">
                  <CardContent>
                    <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">미제출 과제물</h3>
                    <p className="text-muted-foreground">아직 제출되지 않은 과제물들이 여기에 표시됩니다</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="submitted">
                <Card className="text-center py-12">
                  <CardContent>
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">제출된 과제물</h3>
                    <p className="text-muted-foreground">검토가 필요한 제출물들이 여기에 표시됩니다</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviewed">
                <Card className="text-center py-12">
                  <CardContent>
                    <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">검토 완료</h3>
                    <p className="text-muted-foreground">검토가 완료된 과제물들이 여기에 표시됩니다</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {assignments.length === 0 && !showCreateForm && (
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">아직 과제가 없습니다</h3>
                  <p className="text-muted-foreground mb-4">팀원들을 위한 첫 번째 과제를 만들어보세요</p>
                  <Button onClick={() => setShowCreateForm(true)} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />첫 과제 생성하기
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </RoleGuard>
        )
}
