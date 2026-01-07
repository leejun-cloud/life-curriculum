"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Calendar,
    Clock,
    FileText,
    Upload,
    ArrowLeft,
    CheckCircle,
    X,
    AlertCircle,
    Loader2
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { uploadAssignmentFile, validateFile, formatFileSize, getFileIcon } from "@/lib/file-upload"

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

export default function SubmitAssignmentPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const { user } = useAuth()
    const [assignment, setAssignment] = useState<Assignment | null>(null)
    const [submissionType, setSubmissionType] = useState<"text" | "file">("text")
    const [textContent, setTextContent] = useState("")
    const [blogUrl, setBlogUrl] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isUploading, setIsUploading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [dragActive, setDragActive] = useState(false)

    useEffect(() => {
        // Load assignment from localStorage
        const saved = localStorage.getItem("teamAssignments")
        if (saved) {
            const assignments = JSON.parse(saved)
            const found = assignments.find((a: Assignment) => a.id === params.id)
            setAssignment(found || null)

            // Set default submission type based on assignment type
            if (found) {
                if (found.type === "file_upload") {
                    setSubmissionType("file")
                } else if (found.type === "blog_post") {
                    setSubmissionType("text")
                }
            }
        }
    }, [params.id])

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0])
        }
    }, [])

    const handleFileSelect = (file: File) => {
        const validation = validateFile(file)
        if (!validation.valid) {
            alert(validation.error)
            return
        }
        setSelectedFile(file)
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0])
        }
    }

    const handleSubmit = async () => {
        if (!assignment || !user) return

        // Validate submission
        if (submissionType === "text") {
            if (assignment.type === "blog_post" && !blogUrl.trim()) {
                alert("블로그 URL을 입력해주세요.")
                return
            }
            if (assignment.type === "video_note" && !textContent.trim()) {
                alert("영상 노트 내용을 입력해주세요.")
                return
            }
        } else if (submissionType === "file") {
            if (!selectedFile) {
                alert("파일을 선택해주세요.")
                return
            }
        }

        setIsSubmitting(true)

        try {
            let fileUrl = ""
            let fileName = ""

            // Upload file if file submission
            if (submissionType === "file" && selectedFile) {
                setIsUploading(true)
                fileUrl = await uploadAssignmentFile(
                    selectedFile,
                    assignment.id,
                    user.uid || "demo-user",
                    (progress) => setUploadProgress(progress)
                )
                fileName = selectedFile.name
                setIsUploading(false)
            }

            // Create submission
            const submission = {
                id: Date.now().toString(),
                studentName: user.name || "학생",
                content: submissionType === "text" ? (assignment.type === "blog_post" ? blogUrl : textContent) : undefined,
                fileUrl: submissionType === "file" ? fileUrl : undefined,
                fileName: submissionType === "file" ? fileName : undefined,
                submittedAt: new Date().toISOString(),
                status: "submitted" as const,
            }

            // Save to localStorage
            const mySubmissions = JSON.parse(localStorage.getItem("mySubmissions") || "{}")
            mySubmissions[assignment.id] = submission
            localStorage.setItem("mySubmissions", JSON.stringify(mySubmissions))

            // Also add to team submissions for review
            const teamSubmissions = JSON.parse(localStorage.getItem("teamSubmissions") || "[]")
            teamSubmissions.push({
                ...submission,
                assignmentTitle: assignment.title,
                assignmentId: assignment.id,
            })
            localStorage.setItem("teamSubmissions", JSON.stringify(teamSubmissions))

            alert("과제가 성공적으로 제출되었습니다!")
            router.push("/assignments")
        } catch (error) {
            console.error("Submission error:", error)
            alert(error instanceof Error ? error.message : "과제 제출 중 오류가 발생했습니다.")
        } finally {
            setIsSubmitting(false)
            setIsUploading(false)
        }
    }

    if (!assignment) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="bg-card/50 border-border/50">
                    <CardContent className="p-12 text-center">
                        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">과제를 찾을 수 없습니다</h3>
                        <p className="text-muted-foreground mb-4">요청하신 과제가 존재하지 않습니다.</p>
                        <Link href="/assignments">
                            <Button variant="outline">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                과제 목록으로
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
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

    const isOverdue = new Date(assignment.deadline) < new Date()

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="glass-effect border-b border-border/50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/assignments">
                            <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                과제 목록
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                {new Date(assignment.deadline).toLocaleString("ko-KR")}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Assignment Info */}
                <Card className="bg-card/50 border-primary/20 mb-8">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <CardTitle className="text-2xl">{assignment.title}</CardTitle>
                                    <Badge variant="secondary" className="bg-primary/20 text-primary">
                                        {getTypeLabel(assignment.type)}
                                    </Badge>
                                    {isOverdue && (
                                        <Badge variant="destructive">
                                            <AlertCircle className="w-3 h-3 mr-1" />
                                            기한 만료
                                        </Badge>
                                    )}
                                </div>
                                <CardDescription className="text-base">{assignment.description}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Submission Form */}
                <Card className="bg-card/50 border-primary/20">
                    <CardHeader>
                        <CardTitle>과제 제출</CardTitle>
                        <CardDescription>
                            {assignment.type === "blog_post" && "블로그 URL을 입력하거나 직접 내용을 작성하세요"}
                            {assignment.type === "video_note" && "영상을 보고 학습한 내용을 작성하세요"}
                            {assignment.type === "file_upload" && "과제 파일을 업로드하세요"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Submission Type Toggle (for blog_post and video_note) */}
                        {assignment.type !== "file_upload" && (
                            <div className="flex gap-2">
                                <Button
                                    variant={submissionType === "text" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSubmissionType("text")}
                                    className={submissionType === "text" ? "gradient-violet" : "border-primary/30"}
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    텍스트 입력
                                </Button>
                                <Button
                                    variant={submissionType === "file" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSubmissionType("file")}
                                    className={submissionType === "file" ? "gradient-violet" : "border-primary/30"}
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    파일 업로드
                                </Button>
                            </div>
                        )}

                        {/* Text Input */}
                        {submissionType === "text" && (
                            <div className="space-y-4">
                                {assignment.type === "blog_post" && (
                                    <div className="space-y-2">
                                        <Label htmlFor="blogUrl">블로그 URL</Label>
                                        <Input
                                            id="blogUrl"
                                            type="url"
                                            placeholder="https://your-blog.com/post"
                                            value={blogUrl}
                                            onChange={(e) => setBlogUrl(e.target.value)}
                                            className="bg-input border-border/50"
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="content">
                                        {assignment.type === "blog_post" ? "또는 직접 작성" : "학습 내용"}
                                    </Label>
                                    <Textarea
                                        id="content"
                                        placeholder={
                                            assignment.type === "blog_post"
                                                ? "블로그 글 내용을 여기에 작성하세요..."
                                                : "영상을 보고 학습한 내용을 작성하세요..."
                                        }
                                        value={textContent}
                                        onChange={(e) => setTextContent(e.target.value)}
                                        rows={12}
                                        className="bg-input border-border/50 resize-none"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {textContent.length} 글자
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* File Upload */}
                        {submissionType === "file" && (
                            <div className="space-y-4">
                                <div
                                    className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${dragActive
                                            ? "border-primary bg-primary/10"
                                            : "border-border/50 hover:border-primary/50 hover:bg-card/80"
                                        }`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    {selectedFile ? (
                                        <div className="space-y-4">
                                            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto">
                                                <span className="text-3xl">{getFileIcon(selectedFile.name)}</span>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-foreground">{selectedFile.name}</p>
                                                <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedFile(null)}
                                                className="border-destructive/30 text-destructive hover:bg-destructive/10"
                                            >
                                                <X className="w-4 h-4 mr-2" />
                                                파일 제거
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto">
                                                <Upload className="w-8 h-8 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-semibold text-foreground mb-2">
                                                    파일을 드래그하여 업로드
                                                </p>
                                                <p className="text-sm text-muted-foreground mb-4">
                                                    또는 클릭하여 파일 선택
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    PDF, DOCX, ZIP, 이미지 파일 (최대 10MB)
                                                </p>
                                            </div>
                                            <input
                                                type="file"
                                                id="file-upload"
                                                className="hidden"
                                                onChange={handleFileInput}
                                                accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png,.gif,.txt"
                                            />
                                            <label htmlFor="file-upload">
                                                <Button variant="outline" className="border-primary/30" asChild>
                                                    <span>파일 선택</span>
                                                </Button>
                                            </label>
                                        </div>
                                    )}
                                </div>

                                {isUploading && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">업로드 중...</span>
                                            <span className="font-semibold text-primary">{Math.round(uploadProgress)}%</span>
                                        </div>
                                        <Progress value={uploadProgress} className="h-2" />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || isUploading || isOverdue}
                                className="flex-1 gradient-violet"
                                size="lg"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        제출 중...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        과제 제출
                                    </>
                                )}
                            </Button>
                            <Link href="/assignments">
                                <Button variant="outline" size="lg" className="border-border/50">
                                    취소
                                </Button>
                            </Link>
                        </div>

                        {isOverdue && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-destructive">제출 기한이 만료되었습니다</p>
                                    <p className="text-sm text-destructive/80">
                                        팀장에게 문의하여 기한 연장을 요청하세요.
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
