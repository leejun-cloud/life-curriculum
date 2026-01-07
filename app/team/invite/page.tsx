"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { RoleGuard } from "@/components/role-guard"
import { Copy, Mail, Link, Users, UserPlus, Check } from "lucide-react"

export default function TeamInvite() {
  const [inviteCode] = useState("TEAM-FE-2024-ABC123")
  const [inviteEmails, setInviteEmails] = useState("")
  const [inviteMessage, setInviteMessage] = useState("프론트엔드 개발팀에 합류해주세요! 함께 성장하며 학습해요.")
  const [copied, setCopied] = useState(false)
  const [emailsSent, setEmailsSent] = useState(false)

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(`${window.location.origin}/team/join/${inviteCode}`)
    setCopied(true)
    console.log("[v0] Invite code copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendInvites = () => {
    console.log("[v0] Sending email invitations to:", inviteEmails)
    setEmailsSent(true)
    setTimeout(() => setEmailsSent(false), 3000)
  }

  const handleGenerateNewCode = () => {
    console.log("[v0] Generating new invite code")
    // 실제로는 새 코드를 생성하는 로직
  }

  return (
    <RoleGuard
      allowedRoles={["team_leader", "admin"]}
      fallback={<div className="p-8 text-center text-muted-foreground">팀장 권한이 필요합니다.</div>}
    >
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 h-16">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">팀원 초대</h1>
                <p className="text-sm text-muted-foreground">새로운 팀원을 초대하여 함께 학습하세요</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 초대 링크 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="w-5 h-5 text-primary" />
                  초대 링크 공유
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="invite-code">초대 코드</Label>
                  <div className="flex gap-2 mt-1">
                    <Input id="invite-code" value={inviteCode} readOnly className="font-mono" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyInviteCode}
                      className="shrink-0 bg-transparent"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>초대 링크</Label>
                  <div className="mt-1 p-3 bg-muted rounded-md text-sm font-mono break-all">
                    {typeof window !== "undefined" && `${window.location.origin}/team/join/${inviteCode}`}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCopyInviteCode} className="flex-1">
                    {copied ? "복사됨!" : "링크 복사"}
                  </Button>
                  <Button variant="outline" onClick={handleGenerateNewCode}>
                    새 코드 생성
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>• 이 링크는 7일간 유효합니다</p>
                  <p>• 최대 50명까지 초대 가능합니다</p>
                  <p>• 팀장이 승인한 후 가입이 완료됩니다</p>
                </div>
              </CardContent>
            </Card>

            {/* 이메일 초대 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  이메일 초대
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="invite-emails">이메일 주소</Label>
                  <Textarea
                    id="invite-emails"
                    placeholder="이메일 주소를 입력하세요 (여러 개는 쉼표로 구분)"
                    value={inviteEmails}
                    onChange={(e) => setInviteEmails(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="invite-message">초대 메시지</Label>
                  <Textarea
                    id="invite-message"
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    className="mt-1"
                    rows={4}
                  />
                </div>

                <Button onClick={handleSendInvites} className="w-full" disabled={!inviteEmails.trim()}>
                  {emailsSent ? "초대 발송됨!" : "초대 이메일 발송"}
                </Button>

                {emailsSent && <div className="text-sm text-primary">✓ 초대 이메일이 성공적으로 발송되었습니다!</div>}
              </CardContent>
            </Card>
          </div>

          {/* 대기 중인 초대 */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                대기 중인 초대
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">choi@example.com</p>
                    <p className="text-sm text-muted-foreground">2024년 2월 1일 초대됨</p>
                  </div>
                  <Badge variant="outline">대기중</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">new@example.com</p>
                    <p className="text-sm text-muted-foreground">2024년 2월 3일 초대됨</p>
                  </div>
                  <Badge variant="outline">대기중</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </RoleGuard>
  )
}
