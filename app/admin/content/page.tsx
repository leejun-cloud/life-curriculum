"use client"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { RoleGuard } from "@/components/role-guard"
import { Search, FileCheck } from "lucide-react"

interface PendingContent {
  id: string
  title: string
  description: string
  category: string
  author: {
    name: string
    email: string
    avatar?: string
  }
  submittedAt: Date
  status: "pending" | "approved" | "rejected" | "revision_requested"
  priority: "low" | "medium" | "high"
  videoCount: number
  estimatedDuration: string
  tags: string[]
  reviewNotes?: string
}

export default function ContentApproval() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected" | "revision_requested">(
    "all",
  )
  const [selectedContent, setSelectedContent] = useState<PendingContent | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")

  const [pendingContents, setPendingContents] = useState<PendingContent[]>([])

  const filteredContents = pendingContents.filter((content) => {
    const matchesSearch =
      content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filterStatus === "all" || content.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (status: PendingContent["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">검토 대기</Badge>
      case "approved":
        return <Badge variant="secondary">승인됨</Badge>
      case "rejected":
        return <Badge variant="destructive">거부됨</Badge>
      case "revision_requested":
        return (
          <Badge variant="outline" className="border-chart-3 text-chart-3">
            수정 요청
          </Badge>
        )
    }
  }

  const getPriorityBadge = (priority: PendingContent["priority"]) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">높음</Badge>
      case "medium":
        return <Badge variant="outline">보통</Badge>
      case "low":
        return <Badge variant="secondary">낮음</Badge>
    }
  }

  const handleApprove = (contentId: string) => {
    setPendingContents((prev) =>
      prev.map((content) => (content.id === contentId ? { ...content, status: "approved" as const } : content)),
    )
    console.log("[v0] Content approved:", contentId)
    alert("콘텐츠가 승인되었습니다!")
  }

  const handleReject = (contentId: string) => {
    if (!reviewNotes.trim()) {
      alert("거부 사유를 입력해주세요.")
      return
    }

    setPendingContents((prev) =>
      prev.map((content) =>
        content.id === contentId ? { ...content, status: "rejected" as const, reviewNotes: reviewNotes } : content,
      ),
    )
    console.log("[v0] Content rejected:", contentId, reviewNotes)
    setReviewNotes("")
    alert("콘텐츠가 거부되었습니다.")
  }

  const handleRequestRevision = (contentId: string) => {
    if (!reviewNotes.trim()) {
      alert("수정 요청 사항을 입력해주세요.")
      return
    }

    setPendingContents((prev) =>
      prev.map((content) =>
        content.id === contentId
          ? { ...content, status: "revision_requested" as const, reviewNotes: reviewNotes }
          : content,
      ),
    )
    console.log("[v0] Revision requested:", contentId, reviewNotes)
    setReviewNotes("")
    alert("수정 요청이 전송되었습니다.")
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <RoleGuard
      allowedRoles={["admin"]}
      fallback={<div className="p-8 text-center text-muted-foreground">관리자 권한이 필요합니다.</div>}
    >
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <FileCheck className="w-5 h-5 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold text-foreground">콘텐츠 승인</h1>
                <Badge variant="outline">{filteredContents.length}개</Badge>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="제목, 작성자, 태그로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={filterStatus === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus("all")}
                    >
                      전체
                    </Button>
                    <Button
                      variant={filterStatus === "pending" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus("pending")}
                    >
                      대기
                    </Button>
                    <Button
                      variant={filterStatus === "revision_requested" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus("revision_requested")}
                    >
                      수정요청
                    </Button>
                    <Button
                      variant={filterStatus === "approved" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus("approved")}
                    >
                      승인
                    </Button>
                    <Button
                      variant={filterStatus === "rejected" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus("rejected")}
                    >
                      거부
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {filteredContents.length === 0 && (
              <Card className="bg-card border-border">
                <CardContent className="p-12 text-center">
                  <FileCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">승인 대기 중인 콘텐츠가 없습니다</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? "검색 조건에 맞는 콘텐츠가 없습니다." : "현재 검토가 필요한 콘텐츠가 없습니다."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </RoleGuard>
  )
}
