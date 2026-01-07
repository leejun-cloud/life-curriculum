"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getCurrentUser } from "@/lib/auth"
import { Users, CheckCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface TeamInfo {
  id: string
  name: string
  description: string
  category: string
  memberCount: number
  maxMembers: number
  isPrivate: boolean
  leader: {
    name: string
    avatar?: string
  }
  recentActivity: string[]
}

export default function JoinTeam({ params }: { params: { code: string } }) {
  const router = useRouter()
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // 실제 환경에서는 API 호출
    setTimeout(() => {
      // 임시 팀 정보
      setTeamInfo({
        id: "team-1",
        name: "프론트엔드 개발팀",
        description: "React, TypeScript, Next.js를 활용한 모던 웹 개발을 함께 학습하는 팀입니다.",
        category: "개발팀",
        memberCount: 8,
        maxMembers: 20,
        isPrivate: false,
        leader: {
          name: "김태현",
          avatar: "/placeholder.svg",
        },
        recentActivity: [
          "React 고급 패턴 커리큘럼 추가",
          "팀원 3명이 TypeScript 기초 완료",
          "주간 스터디 일정 업데이트",
        ],
      })
      setLoading(false)
    }, 1000)
  }, [params.code])

  const handleJoinTeam = async () => {
    setJoining(true)

    try {
      const currentUser = getCurrentUser()

      // 실제 환경에서는 API 호출
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // 팀 참여 처리
      const teams = JSON.parse(localStorage.getItem("userTeams") || "[]")
      teams.push({
        teamId: teamInfo?.id,
        teamName: teamInfo?.name,
        role: "member",
        joinedAt: new Date().toISOString(),
      })
      localStorage.setItem("userTeams", JSON.stringify(teams))

      console.log("[v0] User joined team:", teamInfo?.name)
      alert("팀에 성공적으로 참여했습니다!")
      router.push("/team/dashboard")
    } catch (error) {
      setError("팀 참여 중 오류가 발생했습니다.")
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">팀 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!teamInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">유효하지 않은 초대 코드</h2>
            <p className="text-muted-foreground mb-4">초대 코드가 만료되었거나 존재하지 않습니다.</p>
            <Button onClick={() => router.push("/")} variant="outline">
              홈으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">팀 초대</h1>
          <p className="text-muted-foreground">{teamInfo.leader.name}님이 당신을 팀에 초대했습니다</p>
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-card-foreground">{teamInfo.name}</CardTitle>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant="secondary">{teamInfo.category}</Badge>
              {teamInfo.isPrivate && <Badge variant="outline">비공개</Badge>}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-muted-foreground">{teamInfo.description}</p>

            {/* Team Stats */}
            <div className="grid grid-cols-2 gap-4 py-4 border-y border-border">
              <div className="text-center">
                <div className="text-2xl font-bold text-card-foreground">{teamInfo.memberCount}</div>
                <div className="text-sm text-muted-foreground">현재 팀원</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-card-foreground">{teamInfo.maxMembers}</div>
                <div className="text-sm text-muted-foreground">최대 인원</div>
              </div>
            </div>

            {/* Team Leader */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Avatar className="w-10 h-10">
                <AvatarImage src={teamInfo.leader.avatar || "/placeholder.svg"} />
                <AvatarFallback>{teamInfo.leader.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium text-card-foreground">{teamInfo.leader.name}</h4>
                <p className="text-sm text-muted-foreground">팀장</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h4 className="font-medium text-card-foreground mb-3">최근 활동</h4>
              <div className="space-y-2">
                {teamInfo.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-3 h-3 text-primary" />
                    <span className="text-muted-foreground">{activity}</span>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => router.push("/")}>
                나중에
              </Button>
              <Button className="flex-1" onClick={handleJoinTeam} disabled={joining}>
                {joining ? "참여 중..." : "팀 참여하기"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
