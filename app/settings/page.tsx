"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ModeSwitcher } from "@/components/mode-switcher"
import { ArrowLeft, Settings, User, Bell, Shield, Palette, Globe, Users, Crown, Plus } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { setUserRole, createTeam, type UserRole } from "@/lib/auth"
import { updateUser } from "@/lib/firebase-collections"

type Mode = "personal" | "team" | "integrated"

export default function SettingsPage() {
  const [currentMode, setCurrentMode] = useState<Mode>("personal")
  const [userRole, setUserRoleState] = useState<UserRole>("user")
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weekly: false,
    marketing: false,
  })
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showProgress: true,
    allowMessages: false,
  })
  const [theme, setTheme] = useState("system")
  const [language, setLanguage] = useState("ko")
  const [teamName, setTeamName] = useState("")
  const [isCreatingTeam, setIsCreatingTeam] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      setUserRoleState(user.role)
    }
  }, [user])

  const handleModeChange = (mode: Mode) => {
    setCurrentMode(mode)
    console.log("[v0] Mode changed to:", mode)
  }

  const handleRoleChange = async (newRole: UserRole) => {
    if (!user) return

    try {
      await setUserRole(user.id, newRole)
      setUserRoleState(newRole)
      console.log("[v0] User role changed to:", newRole)
      window.location.reload()
    } catch (error) {
      console.error("[v0] Error changing role:", error)
      alert("권한 변경 중 오류가 발생했습니다.")
    }
  }

  const handleCreateTeam = async () => {
    if (!user || !teamName.trim()) return

    setIsCreatingTeam(true)
    try {
      const team = await createTeam(teamName.trim(), user.id)
      console.log("[v0] Team created:", team.name)
      alert(`"${team.name}" 팀이 생성되었습니다!`)
      setTeamName("")
      setCurrentMode("team")
    } catch (error) {
      console.error("[v0] Error creating team:", error)
      alert("팀 생성 중 오류가 발생했습니다.")
    } finally {
      setIsCreatingTeam(false)
    }
  }

  const handleNotificationChange = async (key: string, value: boolean) => {
    if (!user) return

    const newNotifications = { ...notifications, [key]: value }
    setNotifications(newNotifications)

    try {
      await updateUser(user.id, { notificationSettings: newNotifications })
      console.log("[v0] Notification setting changed:", key, value)
    } catch (error) {
      console.error("[v0] Error saving notification settings:", error)
    }
  }

  const handlePrivacyChange = async (key: string, value: boolean) => {
    if (!user) return

    const newPrivacy = { ...privacy, [key]: value }
    setPrivacy(newPrivacy)

    try {
      await updateUser(user.id, { privacySettings: newPrivacy })
      console.log("[v0] Privacy setting changed:", key, value)
    } catch (error) {
      console.error("[v0] Error saving privacy settings:", error)
    }
  }

  const handleThemeChange = async (newTheme: string) => {
    if (!user) return

    setTheme(newTheme)

    try {
      await updateUser(user.id, { theme: newTheme })
      console.log("[v0] Theme changed to:", newTheme)
    } catch (error) {
      console.error("[v0] Error saving theme:", error)
    }
  }

  const handleLanguageChange = async (newLanguage: string) => {
    if (!user) return

    setLanguage(newLanguage)

    try {
      await updateUser(user.id, { language: newLanguage })
      console.log("[v0] Language changed to:", newLanguage)
    } catch (error) {
      console.error("[v0] Error saving language:", error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">로그인이 필요합니다.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">설정</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Crown className="w-5 h-5 text-primary" />
                사용자 권한 (개발/테스트용)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">현재 권한:</span>
                <Badge
                  variant={userRole === "admin" ? "default" : userRole === "team_leader" ? "secondary" : "outline"}
                >
                  {userRole === "admin" ? "전체 관리자" : userRole === "team_leader" ? "팀장" : "일반 사용자"}
                </Badge>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={userRole === "user" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRoleChange("user")}
                >
                  일반 사용자
                </Button>
                <Button
                  variant={userRole === "team_leader" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRoleChange("team_leader")}
                >
                  팀장
                </Button>
                <Button
                  variant={userRole === "admin" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRoleChange("admin")}
                >
                  전체 관리자
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                권한을 변경하면 페이지가 새로고침되고 해당 권한의 메뉴가 상단에 표시됩니다.
              </p>
            </CardContent>
          </Card>

          {/* Mode Selection */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Globe className="w-5 h-5 text-primary" />
                학습 모드
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ModeSwitcher currentMode={currentMode} onModeChange={handleModeChange} showDescription={true} />
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Bell className="w-5 h-5 text-primary" />
                알림 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications" className="text-base font-medium">
                    이메일 알림
                  </Label>
                  <p className="text-sm text-muted-foreground">새로운 커리큘럼과 학습 알림을 받습니다</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notifications.email}
                  onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications" className="text-base font-medium">
                    푸시 알림
                  </Label>
                  <p className="text-sm text-muted-foreground">학습 리마인더와 중요한 업데이트를 받습니다</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={notifications.push}
                  onCheckedChange={(checked) => handleNotificationChange("push", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weekly-reports" className="text-base font-medium">
                    주간 리포트
                  </Label>
                  <p className="text-sm text-muted-foreground">매주 학습 진행률 요약을 받습니다</p>
                </div>
                <Switch
                  id="weekly-reports"
                  checked={notifications.weekly}
                  onCheckedChange={(checked) => handleNotificationChange("weekly", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="marketing-notifications" className="text-base font-medium">
                    마케팅 알림
                  </Label>
                  <p className="text-sm text-muted-foreground">새로운 기능과 프로모션 정보를 받습니다</p>
                </div>
                <Switch
                  id="marketing-notifications"
                  checked={notifications.marketing}
                  onCheckedChange={(checked) => handleNotificationChange("marketing", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Shield className="w-5 h-5 text-primary" />
                개인정보 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="profile-public" className="text-base font-medium">
                    프로필 공개
                  </Label>
                  <p className="text-sm text-muted-foreground">다른 사용자가 내 프로필을 볼 수 있습니다</p>
                </div>
                <Switch
                  id="profile-public"
                  checked={privacy.profilePublic}
                  onCheckedChange={(checked) => handlePrivacyChange("profilePublic", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-progress" className="text-base font-medium">
                    학습 진행률 공개
                  </Label>
                  <p className="text-sm text-muted-foreground">내 학습 진행률을 다른 사용자에게 보여줍니다</p>
                </div>
                <Switch
                  id="show-progress"
                  checked={privacy.showProgress}
                  onCheckedChange={(checked) => handlePrivacyChange("showProgress", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allow-messages" className="text-base font-medium">
                    메시지 허용
                  </Label>
                  <p className="text-sm text-muted-foreground">다른 사용자가 나에게 메시지를 보낼 수 있습니다</p>
                </div>
                <Switch
                  id="allow-messages"
                  checked={privacy.allowMessages}
                  onCheckedChange={(checked) => handlePrivacyChange("allowMessages", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* App Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Palette className="w-5 h-5 text-primary" />앱 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">테마 설정</Label>
                <div className="flex gap-2">
                  {["light", "dark", "system"].map((themeOption) => (
                    <Button
                      key={themeOption}
                      variant={theme === themeOption ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleThemeChange(themeOption)}
                    >
                      {themeOption === "light" ? "라이트" : themeOption === "dark" ? "다크" : "시스템"}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">언어 설정</Label>
                <div className="flex gap-2">
                  {[
                    { code: "ko", name: "한국어" },
                    { code: "en", name: "English" },
                    { code: "ja", name: "日本語" },
                  ].map((lang) => (
                    <Button
                      key={lang.code}
                      variant={language === lang.code ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleLanguageChange(lang.code)}
                    >
                      {lang.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <User className="w-5 h-5 text-primary" />
                  계정 관리
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/profile">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <User className="w-4 h-4 mr-2" />
                    프로필 편집
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => console.log("[v0] Opening security settings")}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  보안 설정
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => console.log("[v0] Opening notification settings")}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  알림 설정
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Settings className="w-5 h-5 text-primary" />
                  고급 설정
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => console.log("[v0] Opening data export")}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  데이터 내보내기
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => console.log("[v0] Opening backup settings")}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  백업 설정
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => console.log("[v0] Opening advanced settings")}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  고급 옵션
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Mode-specific Settings */}
          {currentMode === "team" && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Users className="w-5 h-5 text-primary" />팀 설정
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="team-name" className="text-base font-medium">
                    새 팀 생성
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="team-name"
                      placeholder="팀 이름을 입력하세요"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      disabled={isCreatingTeam}
                    />
                    <Button onClick={handleCreateTeam} disabled={!teamName.trim() || isCreatingTeam}>
                      <Plus className="w-4 h-4 mr-2" />
                      {isCreatingTeam ? "생성 중..." : "생성"}
                    </Button>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => console.log("[v0] Managing invite codes")}
                >
                  팀 초대 코드 관리
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => console.log("[v0] Setting team permissions")}
                >
                  팀원 권한 설정
                </Button>
              </CardContent>
            </Card>
          )}

          {currentMode === "integrated" && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Globe className="w-5 h-5 text-primary" />
                  통합 모드 설정
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => console.log("[v0] Setting dashboard layout")}
                >
                  대시보드 레이아웃 설정
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => console.log("[v0] Setting data sync")}
                >
                  데이터 동기화 설정
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => console.log("[v0] Managing integrated notifications")}
                >
                  통합 알림 관리
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90"
              onClick={() => {
                console.log("[v0] All settings are automatically saved to Firebase")
                alert("모든 설정이 자동으로 저장됩니다!")
              }}
            >
              설정 완료
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
