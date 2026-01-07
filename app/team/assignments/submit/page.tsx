"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, FileText, Upload, Send, Clock, CheckCircle, AlertCircle } from "lucide-react"

interface Assignment {
  id: string
  title: string
  description: string
  type: "video_note" | "blog_post" | "file_upload"
  deadline: string
  curriculumId?: string
  videoId?: string
  createdAt: string
}

interface MySubmission {
  assignmentId: string
  content?: string
  fileUrl?: string
  fileName?: string
  submittedAt?: string
  status: "draft" | "submitted"
}

export default function SubmitAssignmentPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [mySubmissions, setMySubmissions] = useState<MySubmission[]>([])
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [submissionContent, setSubmissionContent] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    // Load assignments
    const savedAssignments = localStorage.getItem("teamAssignments")
    if (savedAssignments) {
      setAssignments(JSON.parse(savedAssignments))
    }

    // Load my submissions
    const savedSubmissions = localStorage.getItem("mySubmissions")
    if (savedSubmissions) {
      setMySubmissions(JSON.parse(savedSubmissions))
    }
  }, [])

  const handleSubmit = () => {
    if (!selectedAssignment) return

    if (selectedAssignment.type === "blog_post" && !submissionContent.trim()) {
      alert("과제 내용을 입력해주세요.")
      return
    }

    if (selectedAssignment.type === "file_upload" && !selectedFile) {
      alert("파일을 선택해주세요.")
      return
    }

    const submission: MySubmission = {
      assignmentId: selectedAssignment.id,
      content: submissionContent,
      fileName: selectedFile?.name,
      fileUrl: selectedFile ? `/uploads/${selectedFile.name}` : undefined,
      submittedAt: new Date().toISOString(),
      status: "submitted",
    }

    const updated = mySubmissions.filter((s) => s.assignmentId !== selectedAssignment.id)
    updated.push(submission)
    setMySubmissions(updated)
    localStorage.setItem("mySubmissions", JSON.stringify(updated))

    console.log("[v0] Submitted assignment:", selectedAssignment.title)
    alert(`과제 "${selectedAssignment.title}"이 성공적으로 제출되었습니다.`)

    setSubmissionContent("")
    setSelectedFile(null)
    setSelectedAssignment(null)
  }

  const handleSaveDraft = () => {
    if (!selectedAssignment) return

    const submission: MySubmission = {
      assignmentId: selectedAssignment.id,
      content: submissionContent,
      fileName: selectedFile?.name,
      fileUrl: selectedFile ? `/uploads/${selectedFile.name}` : undefined,
      status: "draft",
    }

    const updated = mySubmissions.filter((s) => s.assignmentId !== selectedAssignment.id)
    updated.push(submission)
    setMySubmissions(updated)
    localStorage.setItem("mySubmissions", JSON.stringify(updated))

    console.log("[v0] Saved draft for assignment:", selectedAssignment.title)
    alert("임시저장되었습니다.")
  }

  const getMySubmission = (assignmentId: string) => {
    return mySubmissions.find((s) => s.assignmentId === assignmentId)
  }

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date()
  }

  const getTimeRemaining = (deadline: string) => {
    const now = new Date()
    const due = new Date(deadline)
    const diff = due.getTime() - now.getTime()

    if (diff < 0) return "마감됨"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days}일 ${hours}시간 남음`
    if (hours > 0) return `${hours}시간 남음`
    return "곧 마감"
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

  const pendingAssignments = assignments.filter((a) => !getMySubmission(a.id)?.submittedAt)
  const submittedAssignments = assignments.filter((a) => getMySubmission(a.id)?.submittedAt)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">과제 제출</h1>
        <p className="text-muted-foreground mt-2">팀 과제를 확인하고 제출하세요</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">미제출 과제 ({pendingAssignments.length})</TabsTrigger>
          <TabsTrigger value="submitted">제출 완료 ({submittedAssignments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          {selectedAssignment ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{selectedAssignment.title}</CardTitle>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {getTypeIcon(selectedAssignment.type)}
                        {getTypeLabel(selectedAssignment.type)}
                      </Badge>
                    </div>
                    <CardDescription>{selectedAssignment.description}</CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedAssignment(null)}>
                    목록으로
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    제출 기한: {new Date(selectedAssignment.deadline).toLocaleString("ko-KR")}
                  </span>
                  <Badge variant="secondary" className="ml-auto">
                    {getTimeRemaining(selectedAssignment.deadline)}
                  </Badge>
                </div>

                {selectedAssignment.type === "blog_post" && (
                  <div className="space-y-4">
                    <Label htmlFor="content">과제 내용 작성</Label>
                    <Textarea
                      id="content"
                      value={submissionContent}
                      onChange={(e) => setSubmissionContent(e.target.value)}
                      placeholder="블로그 형태로 과제 내용을 작성해주세요. 마크다운 문법을 사용할 수 있습니다."
                      rows={15}
                      className="font-mono"
                    />
                    <div className="text-sm text-muted-foreground">
                      마크다운 문법을 사용하여 제목, 목록, 코드 블록 등을 작성할 수 있습니다.
                    </div>
                  </div>
                )}

                {selectedAssignment.type === "file_upload" && (
                  <div className="space-y-4">
                    <Label htmlFor="file">파일 선택</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <Input
                        id="file"
                        type="file"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="max-w-sm mx-auto"
                      />
                      {selectedFile && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          선택된 파일: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedAssignment.type === "video_note" && (
                  <div className="space-y-4">
                    <Label htmlFor="video-note">영상 시청 후 학습 노트</Label>
                    <Textarea
                      id="video-note"
                      value={submissionContent}
                      onChange={(e) => setSubmissionContent(e.target.value)}
                      placeholder="영상을 시청하면서 작성한 노트나 학습한 내용을 정리해주세요."
                      rows={10}
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
                    <Send className="w-4 h-4 mr-2" />
                    과제 제출
                  </Button>
                  <Button variant="outline" onClick={handleSaveDraft}>
                    임시저장
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingAssignments.map((assignment) => {
                const submission = getMySubmission(assignment.id)
                const overdue = isOverdue(assignment.deadline)

                return (
                  <Card
                    key={assignment.id}
                    className={`cursor-pointer hover:shadow-lg transition-shadow ${overdue ? "border-red-200" : ""}`}
                    onClick={() => {
                      setSelectedAssignment(assignment)
                      if (submission?.content) {
                        setSubmissionContent(submission.content)
                      }
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{assignment.title}</CardTitle>
                            <Badge variant="secondary" className="flex items-center gap-1">
                              {getTypeIcon(assignment.type)}
                              {getTypeLabel(assignment.type)}
                            </Badge>
                            {overdue && (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                마감됨
                              </Badge>
                            )}
                            {submission?.status === "draft" && (
                              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                임시저장됨
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="line-clamp-2">{assignment.description}</CardDescription>
                        </div>
                        <div className="text-right text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {getTimeRemaining(assignment.deadline)}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                )
              })}

              {pendingAssignments.length === 0 && (
                <Card className="text-center py-12">
                  <CardContent>
                    <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">모든 과제를 완료했습니다!</h3>
                    <p className="text-muted-foreground">새로운 과제가 배정되면 여기에 표시됩니다</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="submitted" className="space-y-6">
          <div className="grid gap-4">
            {submittedAssignments.map((assignment) => {
              const submission = getMySubmission(assignment.id)

              return (
                <Card key={assignment.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{assignment.title}</CardTitle>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            {getTypeIcon(assignment.type)}
                            {getTypeLabel(assignment.type)}
                          </Badge>
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            제출완료
                          </Badge>
                        </div>
                        <CardDescription>{assignment.description}</CardDescription>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        제출일:{" "}
                        {submission?.submittedAt && new Date(submission.submittedAt).toLocaleDateString("ko-KR")}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              )
            })}

            {submittedAssignments.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">아직 제출한 과제가 없습니다</h3>
                  <p className="text-muted-foreground">미제출 과제 탭에서 과제를 확인하고 제출해보세요</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
