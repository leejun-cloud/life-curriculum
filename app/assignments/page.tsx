"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, FileText, Upload, AlertCircle, CheckCircle, BookOpen } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"

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
    score?: number
    grade?: string
}

export default function StudentAssignmentsPage() {
    const { user } = useAuth()
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [mySubmissions, setMySubmissions] = useState<Map<string, Submission>>(new Map())

    useEffect(() => {
        // Load assignments from localStorage
        const saved = localStorage.getItem("teamAssignments")
        if (saved) {
            setAssignments(JSON.parse(saved))
        }

        // Load my submissions
        const submissionsSaved = localStorage.getItem("mySubmissions")
        if (submissionsSaved) {
            const submissions = JSON.parse(submissionsSaved)
            setMySubmissions(new Map(Object.entries(submissions)))
        }
    }, [])

    const getMySubmission = (assignmentId: string): Submission | undefined => {
        return mySubmissions.get(assignmentId)
    }

    const isOverdue = (deadline: string): boolean => {
        return new Date(deadline) < new Date()
    }

    const isDueSoon = (deadline: string): boolean => {
        const now = new Date()
        const due = new Date(deadline)
        const hoursDiff = (due.getTime() - now.getTime()) / (1000 * 60 * 60)
        return hoursDiff > 0 && hoursDiff <= 24
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

    const getStatusBadge = (assignment: Assignment) => {
        const submission = getMySubmission(assignment.id)

        if (!submission) {
            if (isOverdue(assignment.deadline)) {
                return (
                    <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        기한 만료
                    </Badge>
                )
            }
            if (isDueSoon(assignment.deadline)) {
                return (
                    <Badge variant="secondary" className="bg-chart-3/20 text-chart-3 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        마감 임박
                    </Badge>
                )
            }
            return (
                <Badge variant="outline" className="border-primary/30">
                    미제출
                </Badge>
            )
        }

        switch (submission.status) {
            case "approved":
                return (
                    <Badge variant="secondary" className="bg-chart-2/20 text-chart-2 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        승인됨
                    </Badge>
                )
            case "reviewed":
                return (
                    <Badge variant="secondary" className="bg-primary/20 text-primary flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        검토됨
                    </Badge>
                )
            case "submitted":
                return (
                    <Badge variant="secondary" className="bg-chart-4/20 text-chart-4">
                        제출완료
                    </Badge>
                )
        }
    }

    const pendingAssignments = assignments.filter((a) => !getMySubmission(a.id) && !isOverdue(a.deadline))
    const submittedAssignments = assignments.filter((a) => getMySubmission(a.id))
    const overdueAssignments = assignments.filter((a) => !getMySubmission(a.id) && isOverdue(a.deadline))

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="glass-effect border-b border-border/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 gradient-violet rounded-2xl flex items-center justify-center glow-violet">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gradient-violet">My Assignments</h1>
                                <p className="text-xs text-muted-foreground">할당된 과제를 확인하고 제출하세요</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-card/50 border-primary/20 hover:border-primary/40 transition-all">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">미제출</p>
                                    <p className="text-3xl font-bold text-foreground">{pendingAssignments.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-chart-3/20 rounded-2xl flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-chart-3" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 border-primary/20 hover:border-primary/40 transition-all">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">제출완료</p>
                                    <p className="text-3xl font-bold text-foreground">{submittedAssignments.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 border-primary/20 hover:border-primary/40 transition-all">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">기한 만료</p>
                                    <p className="text-3xl font-bold text-foreground">{overdueAssignments.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-destructive/20 rounded-2xl flex items-center justify-center">
                                    <AlertCircle className="w-6 h-6 text-destructive" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Assignments List */}
                <Tabs defaultValue="pending" className="space-y-6">
                    <TabsList className="bg-card/50">
                        <TabsTrigger value="pending">미제출 ({pendingAssignments.length})</TabsTrigger>
                        <TabsTrigger value="submitted">제출완료 ({submittedAssignments.length})</TabsTrigger>
                        <TabsTrigger value="overdue">기한만료 ({overdueAssignments.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending" className="space-y-4">
                        {pendingAssignments.map((assignment) => (
                            <Card key={assignment.id} className="bg-card/50 border-primary/20 hover:border-primary/40 transition-all">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <CardTitle className="text-xl">{assignment.title}</CardTitle>
                                                <Badge variant="secondary" className="flex items-center gap-1">
                                                    {getTypeIcon(assignment.type)}
                                                    {getTypeLabel(assignment.type)}
                                                </Badge>
                                                {getStatusBadge(assignment)}
                                            </div>
                                            <CardDescription>{assignment.description}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                마감: {new Date(assignment.deadline).toLocaleString("ko-KR")}
                                            </div>
                                            {isDueSoon(assignment.deadline) && (
                                                <Badge variant="secondary" className="bg-chart-3/20 text-chart-3">
                                                    24시간 이내
                                                </Badge>
                                            )}
                                        </div>
                                        <Link href={`/assignments/${assignment.id}/submit`}>
                                            <Button className="gradient-violet">
                                                <Upload className="w-4 h-4 mr-2" />
                                                과제 제출
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {pendingAssignments.length === 0 && (
                            <Card className="bg-card/50 border-border/50">
                                <CardContent className="p-12 text-center">
                                    <CheckCircle className="w-12 h-12 text-chart-2 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">모든 과제를 제출했습니다!</h3>
                                    <p className="text-muted-foreground">미제출 과제가 없습니다.</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="submitted" className="space-y-4">
                        {submittedAssignments.map((assignment) => {
                            const submission = getMySubmission(assignment.id)!
                            return (
                                <Card key={assignment.id} className="bg-card/50 border-primary/20">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <CardTitle className="text-xl">{assignment.title}</CardTitle>
                                                    <Badge variant="secondary" className="flex items-center gap-1">
                                                        {getTypeIcon(assignment.type)}
                                                        {getTypeLabel(assignment.type)}
                                                    </Badge>
                                                    {getStatusBadge(assignment)}
                                                </div>
                                                <CardDescription>{assignment.description}</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                제출: {new Date(submission.submittedAt).toLocaleString("ko-KR")}
                                            </div>
                                        </div>

                                        {submission.feedback && (
                                            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                                                <h4 className="font-semibold text-sm flex items-center gap-2">
                                                    <FileText className="w-4 h-4" />
                                                    피드백
                                                </h4>
                                                <p className="text-sm text-muted-foreground">{submission.feedback}</p>
                                                {submission.score && (
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline">{submission.score}점</Badge>
                                                        {submission.grade && <Badge variant="outline">{submission.grade}</Badge>}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })}

                        {submittedAssignments.length === 0 && (
                            <Card className="bg-card/50 border-border/50">
                                <CardContent className="p-12 text-center">
                                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">제출한 과제가 없습니다</h3>
                                    <p className="text-muted-foreground">미제출 탭에서 과제를 제출해보세요.</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="overdue" className="space-y-4">
                        {overdueAssignments.map((assignment) => (
                            <Card key={assignment.id} className="bg-card/50 border-destructive/20">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <CardTitle className="text-xl">{assignment.title}</CardTitle>
                                                <Badge variant="secondary" className="flex items-center gap-1">
                                                    {getTypeIcon(assignment.type)}
                                                    {getTypeLabel(assignment.type)}
                                                </Badge>
                                                {getStatusBadge(assignment)}
                                            </div>
                                            <CardDescription>{assignment.description}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4 text-destructive" />
                                            마감: {new Date(assignment.deadline).toLocaleString("ko-KR")}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {overdueAssignments.length === 0 && (
                            <Card className="bg-card/50 border-border/50">
                                <CardContent className="p-12 text-center">
                                    <CheckCircle className="w-12 h-12 text-chart-2 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">기한이 만료된 과제가 없습니다</h3>
                                    <p className="text-muted-foreground">모든 과제를 기한 내에 제출했습니다!</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}
