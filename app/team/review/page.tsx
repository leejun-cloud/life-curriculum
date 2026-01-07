"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileText, Star, CheckCircle, XCircle, MessageSquare, Calendar, User, Download } from "lucide-react"
import { RoleGuard } from "@/components/role-guard"

interface Submission {
  id: string
  assignmentId: string
  assignmentTitle: string
  studentName: string
  content?: string
  fileUrl?: string
  fileName?: string
  submittedAt: string
  status: "submitted" | "reviewed" | "approved" | "rejected"
  feedback?: string
  score?: number
  grade?: string
  reviewedAt?: string
  reviewedBy?: string
}

export default function ReviewPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [reviewForm, setReviewForm] = useState({
    feedback: "",
    score: "",
    grade: "",
    status: "reviewed" as const,
  })

  useEffect(() => {
    const saved = localStorage.getItem("teamSubmissions")
    if (saved) {
      setSubmissions(JSON.parse(saved))
    } else {
      setSubmissions([])
      localStorage.setItem("teamSubmissions", JSON.stringify([]))
    }
  }, [])

  const handleReview = () => {
    if (!selectedSubmission || !reviewForm.feedback) {
      alert("피드백을 입력해주세요.")
      return
    }

    const updatedSubmission: Submission = {
      ...selectedSubmission,
      status: reviewForm.status,
      feedback: reviewForm.feedback,
      score: reviewForm.score ? Number.parseInt(reviewForm.score) : undefined,
      grade: reviewForm.grade || undefined,
      reviewedAt: new Date().toISOString(),
      reviewedBy: "팀장",
    }

    const updated = submissions.map((s) => (s.id === selectedSubmission.id ? updatedSubmission : s))
    setSubmissions(updated)
    localStorage.setItem("teamSubmissions", JSON.stringify(updated))

    console.log("[v0] Reviewed submission:", selectedSubmission.studentName, reviewForm.status)
    alert(`${selectedSubmission.studentName}님의 과제물 검토가 완료되었습니다.`)

    setSelectedSubmission(null)
    setReviewForm({
      feedback: "",
      score: "",
      grade: "",
      status: "reviewed",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
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
      case "rejected":
        return "반려됨"
      case "reviewed":
        return "검토됨"
      case "submitted":
        return "제출됨"
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />
      case "rejected":
        return <XCircle className="w-4 h-4" />
      case "reviewed":
        return <MessageSquare className="w-4 h-4" />
      case "submitted":
        return <FileText className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "text-green-600"
    if (grade.startsWith("B")) return "text-blue-600"
    if (grade.startsWith("C")) return "text-yellow-600"
    if (grade.startsWith("D")) return "text-orange-600"
    return "text-red-600"
  }

  const pendingSubmissions = submissions.filter((s) => s.status === "submitted")
  const reviewedSubmissions = submissions.filter((s) => s.status !== "submitted")

  return (
    <RoleGuard allowedRoles={["team_leader", "admin"]}>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">과제물 검토</h1>
            <p className="text-muted-foreground mt-2">팀원들이 제출한 과제물을 검토하고 피드백을 제공하세요</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              검토 대기: {pendingSubmissions.length}개
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">검토 대기 ({pendingSubmissions.length})</TabsTrigger>
            <TabsTrigger value="reviewed">검토 완료 ({reviewedSubmissions.length})</TabsTrigger>
            <TabsTrigger value="stats">통계</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            <div className="grid gap-4">
              {pendingSubmissions.map((submission) => (
                <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{submission.assignmentTitle}</CardTitle>
                          <Badge className={getStatusColor(submission.status)} variant="secondary">
                            {getStatusIcon(submission.status)}
                            {getStatusLabel(submission.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {submission.studentName}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(submission.submittedAt).toLocaleString("ko-KR")}
                          </div>
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            onClick={() => {
                              setSelectedSubmission(submission)
                              setReviewForm({
                                feedback: submission.feedback || "",
                                score: submission.score?.toString() || "",
                                grade: submission.grade || "",
                                status: "reviewed",
                              })
                            }}
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            검토하기
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>과제물 검토: {submission.assignmentTitle}</DialogTitle>
                            <DialogDescription>
                              {submission.studentName}님이 제출한 과제물을 검토하고 피드백을 제공하세요
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold">제출 내용</h3>
                              {submission.content ? (
                                <div className="p-4 bg-muted/50 rounded-lg">
                                  <pre className="whitespace-pre-wrap text-sm">{submission.content}</pre>
                                </div>
                              ) : submission.fileName ? (
                                <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
                                  <FileText className="w-5 h-5" />
                                  <span className="font-medium">{submission.fileName}</span>
                                  <Button size="sm" variant="outline" className="ml-auto bg-transparent">
                                    <Download className="w-4 h-4 mr-1" />
                                    다운로드
                                  </Button>
                                </div>
                              ) : (
                                <p className="text-muted-foreground">제출 내용이 없습니다.</p>
                              )}
                            </div>

                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold">검토 및 피드백</h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="score">점수 (0-100)</Label>
                                  <Input
                                    id="score"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={reviewForm.score}
                                    onChange={(e) => setReviewForm({ ...reviewForm, score: e.target.value })}
                                    placeholder="85"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="grade">등급</Label>
                                  <Select
                                    value={reviewForm.grade}
                                    onValueChange={(value) => setReviewForm({ ...reviewForm, grade: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="등급 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="A+">A+</SelectItem>
                                      <SelectItem value="A">A</SelectItem>
                                      <SelectItem value="B+">B+</SelectItem>
                                      <SelectItem value="B">B</SelectItem>
                                      <SelectItem value="C+">C+</SelectItem>
                                      <SelectItem value="C">C</SelectItem>
                                      <SelectItem value="D">D</SelectItem>
                                      <SelectItem value="F">F</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="status">상태</Label>
                                  <Select
                                    value={reviewForm.status}
                                    onValueChange={(value: any) => setReviewForm({ ...reviewForm, status: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="reviewed">검토됨</SelectItem>
                                      <SelectItem value="approved">승인됨</SelectItem>
                                      <SelectItem value="rejected">반려됨</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="feedback">피드백 *</Label>
                                <Textarea
                                  id="feedback"
                                  value={reviewForm.feedback}
                                  onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                                  placeholder="학생에게 전달할 피드백을 작성해주세요..."
                                  rows={6}
                                />
                              </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                              <Button onClick={handleReview} className="bg-primary hover:bg-primary/90">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                검토 완료
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                </Card>
              ))}

              {pendingSubmissions.length === 0 && (
                <Card className="text-center py-12">
                  <CardContent>
                    <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">모든 과제물을 검토했습니다!</h3>
                    <p className="text-muted-foreground">새로운 제출물이 있으면 여기에 표시됩니다</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reviewed" className="space-y-6">
            <div className="grid gap-4">
              {reviewedSubmissions.map((submission) => (
                <Card key={submission.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{submission.assignmentTitle}</CardTitle>
                          <Badge className={getStatusColor(submission.status)} variant="secondary">
                            {getStatusIcon(submission.status)}
                            {getStatusLabel(submission.status)}
                          </Badge>
                          {submission.grade && (
                            <Badge variant="outline" className={getGradeColor(submission.grade)}>
                              <Star className="w-3 h-3 mr-1" />
                              {submission.grade}
                            </Badge>
                          )}
                          {submission.score && <Badge variant="outline">{submission.score}점</Badge>}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {submission.studentName}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            검토: {submission.reviewedAt && new Date(submission.reviewedAt).toLocaleDateString("ko-KR")}
                          </div>
                        </div>
                        {submission.feedback && (
                          <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm">{submission.feedback}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    전체 제출물
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{submissions.length}</div>
                  <p className="text-muted-foreground">총 제출물 수</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    검토 완료율
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {submissions.length > 0 ? Math.round((reviewedSubmissions.length / submissions.length) * 100) : 0}%
                  </div>
                  <p className="text-muted-foreground">
                    {reviewedSubmissions.length}/{submissions.length} 완료
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    평균 점수
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {reviewedSubmissions.filter((s) => s.score).length > 0
                      ? Math.round(
                          reviewedSubmissions.filter((s) => s.score).reduce((acc, s) => acc + (s.score || 0), 0) /
                            reviewedSubmissions.filter((s) => s.score).length,
                        )
                      : 0}
                  </div>
                  <p className="text-muted-foreground">점수가 있는 과제물 기준</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  )
}
