"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { RoleGuard } from "@/components/role-guard"
import { Users, Search, UserPlus, Mail, Calendar, MoreHorizontal } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: "user" | "team_leader" | "admin"
  status: "active" | "inactive" | "suspended"
  joinDate: Date
  lastActive: Date
  teamCount?: number
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "김도현",
      email: "dohyun.kim@example.com",
      role: "admin",
      status: "active",
      joinDate: new Date("2024-01-15"),
      lastActive: new Date(),
    },
    {
      id: "2",
      name: "이수빈",
      email: "subin.lee@example.com",
      role: "team_leader",
      status: "active",
      joinDate: new Date("2024-02-20"),
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
      teamCount: 3,
    },
    {
      id: "3",
      name: "박준서",
      email: "junseo.park@example.com",
      role: "user",
      status: "active",
      joinDate: new Date("2024-03-10"),
      lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("all")

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === "all" || user.role === selectedRole
    return matchesSearch && matchesRole
  })

  const getRoleBadge = (role: User["role"]) => {
    switch (role) {
      case "admin":
        return <Badge variant="destructive">관리자</Badge>
      case "team_leader":
        return <Badge variant="secondary">팀장</Badge>
      case "user":
        return <Badge variant="outline">일반 사용자</Badge>
    }
  }

  const getStatusBadge = (status: User["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">활성</Badge>
      case "inactive":
        return <Badge variant="secondary">비활성</Badge>
      case "suspended":
        return <Badge variant="destructive">정지</Badge>
    }
  }

  const handleUserAction = (userId: string, action: string) => {
    console.log(`[v0] User action: ${action} for user ${userId}`)
    // 실제 사용자 관리 로직 구현
  }

  return (
    <RoleGuard
      allowedRoles={["admin"]}
      fallback={<div className="p-8 text-center text-muted-foreground">접근 권한이 없습니다.</div>}
    >
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold text-foreground">사용자 관리</h1>
              </div>
              <Button onClick={() => handleUserAction("", "create")}>
                <UserPlus className="w-4 h-4 mr-2" />새 사용자 추가
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="사용자 이름 또는 이메일 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="px-3 py-2 border border-input bg-background rounded-md"
                  >
                    <option value="all">모든 역할</option>
                    <option value="admin">관리자</option>
                    <option value="team_leader">팀장</option>
                    <option value="user">일반 사용자</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Users List */}
            <Card>
              <CardHeader>
                <CardTitle>사용자 목록 ({filteredUsers.length}명)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">{user.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{user.name}</h3>
                            {getRoleBadge(user.role)}
                            {getStatusBadge(user.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              가입: {user.joinDate.toLocaleDateString()}
                            </span>
                            {user.teamCount && <span>팀 {user.teamCount}개 관리</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleUserAction(user.id, "edit")}>
                          편집
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserAction(user.id, user.status === "active" ? "suspend" : "activate")}
                        >
                          {user.status === "active" ? "정지" : "활성화"}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleUserAction(user.id, "more")}>
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </RoleGuard>
  )
}
