"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RoleGuard } from "@/components/role-guard"
import { useAuth } from "@/components/auth-provider"
import {
  Users,
  BookOpen,
  ArrowLeft,
  Settings,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react"

interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  progress: number
  lastActive: Date
}

export default function GroupHomePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const [team, setTeam] = useState<any>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadTeamData()
  }, [params.id])

  const loadTeamData = async () => {
    try {
      const { getTeam, getTeamMembers } = await import("@/lib/firebase-collections")
      const teamData = await getTeam(params.id)
      
      if (teamData) {
        setTeam(teamData)
        
        // Load members (mock for now, replace with real data)
        const memberList = teamData.memberIds || []
        const memberData: TeamMember[] = memberList.map((memberId: string, index: number) => ({
          id: memberId,
          name: `멤버 ${index + 1}`,
          email: `member${index + 1}@example.com`,
          progress: Math.floor(Math.random() * 100),
          lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        }))
        setMembers(memberData)
      }
    } catch (error) {
      console.error("[v0] Error loading team:", error)
    } finally {
      setLoading(false)
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

  const averageProgress = members.length > 0 
    ? Math.round(members.reduce((sum, m) => sum + m.progress, 0) / members.length)
    : 0

  const formatTimeAgo = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60))
    if (hours < 1) return "방금 전"
    if (hours < 24) return `${hours}시간 전`
    const days = Math.floor(hours / 24)
    return `${days}일 전`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-5 h-5 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
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
      allowedRoles={["user", "team_leader", "admin"]}
      fallback={<div className="p-8 text-center text-muted-foreground">로그인이 필요합니다.</div>}
    >
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-foreground">{team.name}</h1>
                    <p className="text-xs text-muted-foreground">{members.length}명 참여 중</p>
                  </div>
                </div>
              </div>
              <Link href={`/team/${params.id}/settings`}>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  설정
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground">{members.length}</div>
                    <p className="text-sm text-muted-foreground">총 멤버</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground">{averageProgress}%</div>
                    <p className="text-sm text-muted-foreground">평균 진도</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Connected Curriculum */}
            {team.curriculumId && (
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <BookOpen className="w-5 h-5 text-primary" />
                    연결된 커리큘럼
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">{team.curriculumTitle || "커리큘럼"}</p>
                    <Link href={`/curriculum/${team.curriculumId}`}>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        학습하기
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Invite Link */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-card-foreground">초대 링크</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="flex-1 px-3 py-2 bg-muted rounded-md font-mono text-sm truncate">
                    {window.location.origin}/team/join/{team.inviteCode}
                  </div>
                  <Button variant="outline" onClick={copyInviteLink}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Member Progress */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">멤버 학습 현황</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      아직 멤버가 없습니다. 초대 링크를 공유해보세요!
                    </p>
                  ) : (
                    members.map((member) => (
                      <div key={member.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-foreground">{member.name}</h4>
                            <span className="text-sm text-muted-foreground">{member.progress}%</span>
                          </div>
                          <Progress value={member.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            마지막 활동: {formatTimeAgo(member.lastActive)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </RoleGuard>
  )
}
