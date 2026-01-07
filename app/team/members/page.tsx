"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RoleGuard } from "@/components/role-guard"
import { Search, UserPlus, MoreHorizontal, MessageSquare, BarChart3 } from "lucide-react"

interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: "member" | "co_leader"
  joinedAt: Date
  progress: number
  completedCourses: number
  totalLearningHours: number
  lastActive: Date
  status: "active" | "inactive" | "pending"
  skills: string[]
}

export default function TeamMembers() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "pending">("all")

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "김민준",
      email: "minjun.kim@example.com",
      role: "member",
      joinedAt: new Date("2024-01-15"),
      progress: 85,
      completedCourses: 3,
      totalLearningHours: 45,
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: "active",
      skills: ["React", "TypeScript", "Node.js"],
    },
    {
      id: "2",
      name: "이서연",
      email: "seoyeon.lee@example.com",
      role: "co_leader",
      joinedAt: new Date("2024-01-10"),
      progress: 92,
      completedCourses: 4,
      totalLearningHours: 62,
      lastActive: new Date(Date.now() - 30 * 60 * 1000),
      status: "active",
      skills: ["UI/UX", "Figma", "React"],
    },
    {
      id: "3",
      name: "박지훈",
      email: "jihoon.park@example.com",
      role: "member",
      joinedAt: new Date("2024-01-20"),
      progress: 45,
      completedCourses: 1,
      totalLearningHours: 28,
      lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: "inactive",
      skills: ["Marketing", "Analytics"],
    },
    {
      id: "4",
      name: "최유진",
      email: "yujin.choi@example.com",
      role: "member",
      joinedAt: new Date("2024-02-01"),
      progress: 15,
      completedCourses: 0,
      totalLearningHours: 8,
      lastActive: new Date(Date.now() - 5 * 60 * 1000),
      status: "pending",
      skills: ["JavaScript"],
    },
  ])

  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || member.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (status: TeamMember["status"]) => {
    switch (status) {
      case "active":
        return <Badge variant="secondary">활성</Badge>
      case "inactive":
        return <Badge variant="outline">비활성</Badge>
      case "pending":
        return <Badge variant="destructive">대기</Badge>
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

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
                <h1 className="text-xl font-bold text-foreground">팀원 관리</h1>
                <Badge variant="outline">{filteredMembers.length}명</Badge>
              </div>
              <Button className="gap-2">
                <UserPlus className="w-4 h-4" />
                팀원 초대
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Search and Filter */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="팀원 이름 또는 이메일로 검색..."
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
                      variant={filterStatus === "active" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus("active")}
                    >
                      활성
                    </Button>
                    <Button
                      variant={filterStatus === "inactive" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus("inactive")}
                    >
                      비활성
                    </Button>
                    <Button
                      variant={filterStatus === "pending" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus("pending")}
                    >
                      대기
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Members List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredMembers.map((member) => (
                <Card key={member.id} className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-card-foreground">{member.name}</h3>
                          {member.role === "co_leader" && <Badge variant="secondary">부팀장</Badge>}
                          {getStatusBadge(member.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{member.email}</p>

                        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">진도율:</span>
                            <span className="ml-1 font-medium text-card-foreground">{member.progress}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">완료 과정:</span>
                            <span className="ml-1 font-medium text-card-foreground">{member.completedCourses}개</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">학습 시간:</span>
                            <span className="ml-1 font-medium text-card-foreground">
                              {member.totalLearningHours}시간
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">가입일:</span>
                            <span className="ml-1 font-medium text-card-foreground">{formatDate(member.joinedAt)}</span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-xs text-muted-foreground mb-2">보유 스킬:</p>
                          <div className="flex flex-wrap gap-1">
                            {member.skills.map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            메시지
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                            <BarChart3 className="w-3 h-3 mr-1" />
                            분석
                          </Button>
                          <Button size="sm" variant="outline" className="bg-transparent">
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredMembers.length === 0 && (
              <Card className="bg-card border-border">
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">검색 조건에 맞는 팀원이 없습니다.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </RoleGuard>
  )
}
