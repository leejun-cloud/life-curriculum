"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { RoleGuard } from "@/components/role-guard"
import { ArrowLeft, Settings, Users, Lock, Mail, Trash2, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function TeamSettings() {
  const [teamName, setTeamName] = useState("프론트엔드 개발팀")
  const [description, setDescription] = useState(
    "React, TypeScript, Next.js를 활용한 모던 웹 개발을 함께 학습하는 팀입니다.",
  )
  const [category, setCategory] = useState("개발팀")
  const [isPrivate, setIsPrivate] = useState(false)
  const [maxMembers, setMaxMembers] = useState("20")
  const [inviteCode, setInviteCode] = useState("ABC123")
  const [autoApprove, setAutoApprove] = useState(true)
  const [allowMemberInvite, setAllowMemberInvite] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const teamCategories = [
    "개발팀",
    "디자인팀",
    "마케팅팀",
    "기획팀",
    "영업팀",
    "HR팀",
    "스터디그룹",
    "프로젝트팀",
    "기타",
  ]

  const handleSaveSettings = () => {
    const teamSettings = {
      teamName,
      description,
      category,
      isPrivate,
      maxMembers: Number.parseInt(maxMembers),
      inviteCode,
      autoApprove,
      allowMemberInvite,
    }

    console.log("[v0] Saving team settings:", teamSettings)
    alert("팀 설정이 저장되었습니다!")
  }

  const handleDeleteTeam = () => {
    if (showDeleteConfirm) {
      console.log("[v0] Deleting team")
      alert("팀이 삭제되었습니다.")
      // 실제 환경에서는 팀 삭제 API 호출 후 리다이렉트
    } else {
      setShowDeleteConfirm(true)
      setTimeout(() => setShowDeleteConfirm(false), 5000)
    }
  }

  return (
    <RoleGuard
      allowedRoles={["team_leader", "admin"]}
      fallback={<div className="p-8 text-center text-muted-foreground">팀장 권한이 필요합니다.</div>}
    >
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 h-16">
              <Link href="/team/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold text-foreground">팀 설정</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Basic Information */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Users className="w-5 h-5 text-primary" />
                  기본 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="team-name">팀 이름</Label>
                  <Input id="team-name" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">팀 설명</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-3">
                  <Label>팀 카테고리</Label>
                  <div className="flex flex-wrap gap-2">
                    {teamCategories.map((cat) => (
                      <Badge
                        key={cat}
                        variant={category === cat ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/80 transition-colors"
                        onClick={() => setCategory(cat)}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-members">최대 팀원 수</Label>
                  <Input
                    id="max-members"
                    type="number"
                    min="2"
                    max="100"
                    value={maxMembers}
                    onChange={(e) => setMaxMembers(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Lock className="w-5 h-5 text-primary" />
                  개인정보 및 접근 설정
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="private-team" className="text-base font-medium">
                      비공개 팀
                    </Label>
                    <p className="text-sm text-muted-foreground">초대받은 사람만 팀에 참여할 수 있습니다</p>
                  </div>
                  <Switch id="private-team" checked={isPrivate} onCheckedChange={setIsPrivate} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-approve" className="text-base font-medium">
                      자동 승인
                    </Label>
                    <p className="text-sm text-muted-foreground">가입 요청을 자동으로 승인합니다</p>
                  </div>
                  <Switch id="auto-approve" checked={autoApprove} onCheckedChange={setAutoApprove} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="member-invite" className="text-base font-medium">
                      팀원 초대 허용
                    </Label>
                    <p className="text-sm text-muted-foreground">일반 팀원도 다른 사람을 초대할 수 있습니다</p>
                  </div>
                  <Switch id="member-invite" checked={allowMemberInvite} onCheckedChange={setAllowMemberInvite} />
                </div>
              </CardContent>
            </Card>

            {/* Invite Management */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Mail className="w-5 h-5 text-primary" />
                  초대 관리
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-code">초대 코드</Label>
                  <div className="flex gap-2">
                    <Input
                      id="invite-code"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      className="font-mono"
                    />
                    <Button variant="outline">새로 생성</Button>
                  </div>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-card-foreground">
                    초대 링크:{" "}
                    <code className="bg-muted px-1 rounded">
                      {typeof window !== "undefined" ? window.location.origin : ""}/team/join/{inviteCode}
                    </code>
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    링크 복사
                  </Button>
                  <Button variant="outline" size="sm">
                    이메일로 초대
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="bg-card border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  위험 구역
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-destructive/10 rounded-lg">
                  <h4 className="font-medium text-destructive mb-2">팀 삭제</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    팀을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다. 팀원들은 자동으로 팀에서
                    제외됩니다.
                  </p>
                  <Button variant="destructive" onClick={handleDeleteTeam} className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    {showDeleteConfirm ? "정말 삭제하시겠습니까?" : "팀 삭제"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <Link href="/team/dashboard">
                <Button variant="outline" size="lg">
                  취소
                </Button>
              </Link>
              <Button size="lg" onClick={handleSaveSettings} className="bg-primary hover:bg-primary/90">
                설정 저장
              </Button>
            </div>
          </div>
        </main>
      </div>
    </RoleGuard>
  )
}
