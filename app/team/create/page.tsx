"use client"

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RoleGuard } from "@/components/role-guard"
import { createTeam, getCurrentUser } from "@/lib/auth"
import { ArrowLeft, Users, Copy, Check, BookOpen } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

function CreateTeamContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [teamName, setTeamName] = useState("")
  const [description, setDescription] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [copied, setCopied] = useState(false)
  const [curriculumId, setCurriculumId] = useState<string | null>(null)
  const [curriculumTitle, setCurriculumTitle] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    const cid = searchParams.get("curriculumId")
    const cTitle = searchParams.get("title")

    if (cid) {
      setCurriculumId(cid)
      if (cTitle) {
        setCurriculumTitle(cTitle)
        setTeamName(`${cTitle} 스터디`)
        setDescription(`'${cTitle}' 커리큘럼을 같이 공부하는 모임입니다.`)
      }
    }

    // Auto-generate invite code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setInviteCode(code)
  }, [searchParams])

  const copyInviteLink = async () => {
    const link = `${window.location.origin}/team/join/${inviteCode}`
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      alert("그룹 이름을 입력해주세요.")
      return
    }

    setIsCreating(true)

    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        alert("로그인이 필요합니다.")
        setIsCreating(false)
        return
      }

      const team = await createTeam(teamName, currentUser.id, {
        description,
        inviteCode,
        curriculumId,
        curriculumTitle,
      })

      console.log("[v0] Team created:", team)
      alert("그룹이 생성되었습니다!")
      router.push(`/team/${team.id}`)
    } catch (error) {
      console.error("[v0] Error creating team:", error)
      alert("그룹 생성 중 오류가 발생했습니다.")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">새 그룹 만들기</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Curriculum Info */}
          {curriculumId && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="flex items-center gap-3 p-4">
                <BookOpen className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">연결된 커리큘럼</p>
                  <p className="font-medium text-foreground">{curriculumTitle || "선택된 커리큘럼"}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Basic Info */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">그룹 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="team-name">그룹 이름 *</Label>
                <Input
                  id="team-name"
                  placeholder="예: React 스터디"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">설명 (선택)</Label>
                <Textarea
                  id="description"
                  placeholder="그룹에 대해 간단히 설명해주세요"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Invite Link */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">초대 링크</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                이 링크를 공유하면 누구나 그룹에 참여할 수 있습니다.
              </p>
              <div className="flex gap-2">
                <Input
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/team/join/${inviteCode}`}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button variant="outline" onClick={copyInviteLink}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-center gap-4 pt-4">
            <Link href="/">
              <Button variant="outline" size="lg">취소</Button>
            </Link>
            <Button 
              size="lg" 
              onClick={handleCreateTeam} 
              disabled={isCreating}
              className="bg-primary hover:bg-primary/90"
            >
              {isCreating ? "생성 중..." : "그룹 만들기"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function CreateTeam() {
  return (
    <RoleGuard
      allowedRoles={["user", "team_leader", "admin"]}
      fallback={<div className="p-8 text-center text-muted-foreground">로그인이 필요합니다.</div>}
    >
      <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
        <CreateTeamContent />
      </Suspense>
    </RoleGuard>
  )
}
