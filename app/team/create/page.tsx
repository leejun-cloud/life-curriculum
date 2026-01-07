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
import { createTeam, getCurrentUser } from "@/lib/auth"
import { ArrowLeft, Users, Settings, Lock, Mail, Copy, Check } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

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

export default function CreateTeam() {
  const router = useRouter()
  const [teamName, setTeamName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [maxMembers, setMaxMembers] = useState("20")
  const [inviteCode, setInviteCode] = useState("")
  const [autoApprove, setAutoApprove] = useState(true)
  const [allowMemberInvite, setAllowMemberInvite] = useState(false)
  const [copied, setCopied] = useState(false)

  const generateInviteCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setInviteCode(code)
  }

  const copyInviteCode = async () => {
    if (inviteCode) {
      await navigator.clipboard.writeText(inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCreateTeam = () => {
    if (!teamName.trim()) {
      alert("팀 이름을 입력해주세요.")
      return
    }

    const currentUser = getCurrentUser()
    const team = createTeam(teamName, currentUser.id)

    // 팀 설정 저장
    const teamSettings = {
      teamId: team.id,
      description,
      category,
      isPrivate,
      maxMembers: Number.parseInt(maxMembers),
      inviteCode,
      autoApprove,
      allowMemberInvite,
    }

    localStorage.setItem(`team_settings_${team.id}`, JSON.stringify(teamSettings))

    console.log("[v0] Team created:", team)
    console.log("[v0] Team settings:", teamSettings)

    alert("팀이 성공적으로 생성되었습니다!")
    router.push("/team/dashboard")
  }

  return (
    <RoleGuard
      allowedRoles={["user", "team_leader", "admin"]}
      fallback={<div className="p-8 text-center text-muted-foreground">로그인이 필요합니다.</div>}
    >
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 h-16">
              <Link href="/settings">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold text-foreground">새 팀 만들기</h1>
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
                  <Settings className="w-5 h-5 text-primary" />
                  기본 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="team-name">팀 이름 *</Label>
                  <Input
                    id="team-name"
                    placeholder="예: 프론트엔드 개발팀"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">팀 설명</Label>
                  <Textarea
                    id="description"
                    placeholder="팀의 목표와 활동에 대해 간단히 설명해주세요"
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

            {/* Invite Code */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Mail className="w-5 h-5 text-primary" />
                  초대 코드
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">팀원들이 이 코드를 사용해서 팀에 참여할 수 있습니다.</p>

                <div className="flex gap-2">
                  <Input
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="초대 코드를 입력하거나 생성하세요"
                    className="font-mono"
                  />
                  <Button variant="outline" onClick={generateInviteCode}>
                    생성
                  </Button>
                  <Button variant="outline" onClick={copyInviteCode} disabled={!inviteCode}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>

                {inviteCode && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-card-foreground">
                      초대 링크:{" "}
                      <code className="bg-muted px-1 rounded">
                        {window.location.origin}/team/join/{inviteCode}
                      </code>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <Link href="/settings">
                <Button variant="outline" size="lg">
                  취소
                </Button>
              </Link>
              <Button size="lg" onClick={handleCreateTeam} className="bg-primary hover:bg-primary/90">
                팀 만들기
              </Button>
            </div>
          </div>
        </main>
      </div>
    </RoleGuard>
  )
}
