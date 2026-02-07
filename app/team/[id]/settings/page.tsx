"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RoleGuard } from "@/components/role-guard"
import { useAuth } from "@/components/auth-provider"
import {
  ArrowLeft,
  Settings,
  Copy,
  Check,
  Trash2,
  RefreshCw,
} from "lucide-react"

export default function GroupSettingsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const [team, setTeam] = useState<any>(null)
  const [teamName, setTeamName] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadTeamData()
  }, [params.id])

  const loadTeamData = async () => {
    try {
      const { getTeam } = await import("@/lib/firebase-collections")
      const teamData = await getTeam(params.id)
      if (teamData) {
        setTeam(teamData)
        setTeamName(teamData.name || "")
      }
    } catch (error) {
      console.error("[v0] Error loading team:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!teamName.trim()) {
      alert("그룹 이름을 입력해주세요.")
      return
    }

    setSaving(true)
    try {
      const { updateTeam } = await import("@/lib/firebase-collections")
      await updateTeam(params.id, { name: teamName })
      setTeam({ ...team, name: teamName })
      alert("저장되었습니다!")
    } catch (error) {
      console.error("[v0] Error saving team:", error)
      alert("저장 중 오류가 발생했습니다.")
    } finally {
      setSaving(false)
    }
  }

  const regenerateInviteCode = async () => {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    try {
      const { updateTeam } = await import("@/lib/firebase-collections")
      await updateTeam(params.id, { inviteCode: newCode })
      setTeam({ ...team, inviteCode: newCode })
      alert("새 초대 코드가 생성되었습니다!")
    } catch (error) {
      console.error("[v0] Error regenerating invite code:", error)
    }
  }

  const copyInviteLink = async () => {
    if (team?.inviteCode) {
      const link = `${window.location.origin}/team/join/${team.inviteCode}`
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDeleteTeam = async () => {
    if (!confirm("정말로 이 그룹을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return
    }

    try {
      const { deleteTeam } = await import("@/lib/firebase-collections")
      await deleteTeam(params.id)
      alert("그룹이 삭제되었습니다.")
      router.push("/")
    } catch (error) {
      console.error("[v0] Error deleting team:", error)
      alert("삭제 중 오류가 발생했습니다.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">그룹을 찾을 수 없습니다.</p>
          <Link href="/">
            <Button className="mt-4">홈으로</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard
      allowedRoles={["team_leader", "admin"]}
      fallback={<div className="p-8 text-center text-muted-foreground">권한이 없습니다.</div>}
    >
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 h-16">
              <Link href={`/team/${params.id}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold text-foreground">그룹 설정</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Basic Settings */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="team-name">그룹 이름</Label>
                  <Input
                    id="team-name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                  />
                </div>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "저장 중..." : "저장"}
                </Button>
              </CardContent>
            </Card>

            {/* Invite Link */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">초대 링크</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/team/join/${team.inviteCode}`}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button variant="outline" onClick={copyInviteLink}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <Button variant="outline" onClick={regenerateInviteCode} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  새 초대 코드 생성
                </Button>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="bg-card border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">위험 구역</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  그룹을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
                </p>
                <Button variant="destructive" onClick={handleDeleteTeam}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  그룹 삭제
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </RoleGuard>
  )
}
