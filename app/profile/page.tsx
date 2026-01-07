"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  User,
  Settings,
  Bell,
  Shield,
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Target,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

const interests = [
  "React",
  "JavaScript",
  "TypeScript",
  "Node.js",
  "Python",
  "영어회화",
  "창업",
  "마케팅",
  "디자인",
  "데이터분석",
  "AI/ML",
  "블록체인",
]

const achievements = [
  { id: 1, title: "첫 번째 커리큘럼 완료", date: "2024-01-15", icon: "🎯" },
  { id: 2, title: "7일 연속 학습", date: "2024-01-20", icon: "🔥" },
  { id: 3, title: "100시간 학습 달성", date: "2024-02-01", icon: "⏰" },
  { id: 4, title: "React 마스터", date: "2024-02-10", icon: "⚛️" },
]

export default function ProfilePage() {
  const [selectedInterests, setSelectedInterests] = useState(["React", "JavaScript", "영어회화", "창업"])
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weekly: false,
    marketing: false,
  })

  const { signOut } = useAuth()
  const router = useRouter()

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]))
  }

  const saveCurriculum = () => {
    const profileData = {
      name: document.getElementById("name")?.value,
      email: document.getElementById("email")?.value,
      phone: document.getElementById("phone")?.value,
      location: document.getElementById("location")?.value,
      bio: document.getElementById("bio")?.value,
      interests: selectedInterests,
      notifications,
    }

    console.log("[v0] Saving profile:", profileData)
    alert("프로필이 성공적으로 저장되었습니다!")
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/login")
    } catch (error) {
      console.error("로그아웃 실패:", error)
      alert("로그아웃 중 오류가 발생했습니다.")
    }
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
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">프로필 설정</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Profile Overview */}
          <Card className="bg-card border-border">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src="/placeholder.svg?height=96&width=96" />
                    <AvatarFallback className="text-2xl">김민</AvatarFallback>
                  </Avatar>
                  <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0">
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-card-foreground">김민준</h2>
                    <p className="text-muted-foreground">풀스택 개발자를 꿈꾸는 학습자</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>2024년 1월 가입</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Target className="w-4 h-4" />
                      <span>156시간 학습</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Award className="w-4 h-4" />
                      <span>12개 코스 완료</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <User className="w-5 h-5 text-primary" />
                개인 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <Input id="name" defaultValue="김민준" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input id="email" defaultValue="minjun.kim@example.com" className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">전화번호</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input id="phone" defaultValue="010-1234-5678" className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">지역</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input id="location" defaultValue="서울, 대한민국" className="pl-10" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">자기소개</Label>
                <Textarea
                  id="bio"
                  placeholder="자신에 대해 간단히 소개해주세요"
                  defaultValue="풀스택 개발자가 되기 위해 열심히 공부하고 있습니다. React와 Node.js를 주로 다루며, 최근에는 AI와 머신러닝에도 관심이 많습니다."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Interests */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Target className="w-5 h-5 text-primary" />
                관심 분야
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <Badge
                    key={interest}
                    variant={selectedInterests.includes(interest) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/80 transition-colors"
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                관심 분야를 선택하면 맞춤형 커리큘럼을 추천받을 수 있습니다.
              </p>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Award className="w-5 h-5 text-primary" />
                성취 배지
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div>
                      <h4 className="font-medium text-card-foreground">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.date}</p>
                    </div>
                  </div>
                ))}
              </div>
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-card-foreground">이메일 알림</h4>
                    <p className="text-sm text-muted-foreground">새로운 커리큘럼과 학습 알림을 받습니다</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, email: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-card-foreground">푸시 알림</h4>
                    <p className="text-sm text-muted-foreground">학습 리마인더와 중요한 업데이트를 받습니다</p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, push: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-card-foreground">주간 리포트</h4>
                    <p className="text-sm text-muted-foreground">매주 학습 진행률 요약을 받습니다</p>
                  </div>
                  <Switch
                    checked={notifications.weekly}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, weekly: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-card-foreground">마케팅 알림</h4>
                    <p className="text-sm text-muted-foreground">새로운 기능과 프로모션 정보를 받습니다</p>
                  </div>
                  <Switch
                    checked={notifications.marketing}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, marketing: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Shield className="w-5 h-5 text-primary" />
                개인정보 및 보안
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Settings className="w-4 h-4 mr-2" />
                비밀번호 변경
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Shield className="w-4 h-4 mr-2" />
                2단계 인증 설정
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <User className="w-4 h-4 mr-2" />
                계정 데이터 다운로드
              </Button>
              <Separator />
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </Button>
              <Button variant="destructive" className="w-full">
                계정 삭제
              </Button>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-center gap-4">
            <Button variant="outline" size="lg">
              취소
            </Button>
            <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={saveCurriculum}>
              변경사항 저장
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
