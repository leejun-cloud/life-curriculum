"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Send, Users, MessageSquare, Calendar, BookOpen, AlertCircle, CheckCircle } from "lucide-react"

interface Notification {
  id: string
  type: "curriculum" | "assignment" | "announcement" | "reminder"
  title: string
  message: string
  recipients: string[]
  sender: string
  createdAt: string
  isRead: boolean
  priority: "low" | "medium" | "high"
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showSendForm, setShowSendForm] = useState(false)
  const [newNotification, setNewNotification] = useState({
    type: "announcement" as const,
    title: "",
    message: "",
    recipients: [] as string[],
    priority: "medium" as const,
  })

  useEffect(() => {
    const saved = localStorage.getItem("teamNotifications")
    if (saved) {
      setNotifications(JSON.parse(saved))
    } else {
      setNotifications([])
      localStorage.setItem("teamNotifications", JSON.stringify([]))
    }
  }, [])

  const handleSendNotification = () => {
    if (!newNotification.title || !newNotification.message || newNotification.recipients.length === 0) {
      alert("제목, 메시지, 수신자를 모두 입력해주세요.")
      return
    }

    const notification: Notification = {
      id: Date.now().toString(),
      ...newNotification,
      sender: "팀장",
      createdAt: new Date().toISOString(),
      isRead: false,
    }

    const updated = [notification, ...notifications]
    setNotifications(updated)
    localStorage.setItem("teamNotifications", JSON.stringify(updated))

    console.log("[v0] Sent notification to team members:", newNotification.recipients)
    alert(`알림이 ${newNotification.recipients.length}명의 팀원에게 전송되었습니다.`)

    setNewNotification({
      type: "announcement",
      title: "",
      message: "",
      recipients: [],
      priority: "medium",
    })
    setShowSendForm(false)
  }

  const handleMarkAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    setNotifications(updated)
    localStorage.setItem("teamNotifications", JSON.stringify(updated))
  }

  const handleMarkAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }))
    setNotifications(updated)
    localStorage.setItem("teamNotifications", JSON.stringify(updated))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "curriculum":
        return <BookOpen className="w-4 h-4" />
      case "assignment":
        return <Calendar className="w-4 h-4" />
      case "announcement":
        return <MessageSquare className="w-4 h-4" />
      case "reminder":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "curriculum":
        return "커리큘럼"
      case "assignment":
        return "과제"
      case "announcement":
        return "공지사항"
      case "reminder":
        return "알림"
      default:
        return type
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "높음"
      case "medium":
        return "보통"
      case "low":
        return "낮음"
      default:
        return priority
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const recentNotifications = notifications.slice(0, 5)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">팀 알림 센터</h1>
          <p className="text-muted-foreground mt-2">팀원들과의 소통을 관리하세요</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <CheckCircle className="w-4 h-4 mr-2" />
              모두 읽음 처리
            </Button>
          )}
          <Button onClick={() => setShowSendForm(true)} className="bg-primary hover:bg-primary/90">
            <Send className="w-4 h-4 mr-2" />새 알림 보내기
          </Button>
        </div>
      </div>

      {showSendForm && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />새 알림 보내기
            </CardTitle>
            <CardDescription>팀원들에게 알림을 전송하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">제목 *</Label>
                <Input
                  id="title"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                  placeholder="알림 제목을 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">알림 유형</Label>
                <Select
                  value={newNotification.type}
                  onValueChange={(value: any) => setNewNotification({ ...newNotification, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">공지사항</SelectItem>
                    <SelectItem value="curriculum">커리큘럼</SelectItem>
                    <SelectItem value="assignment">과제</SelectItem>
                    <SelectItem value="reminder">알림</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">메시지 *</Label>
              <Textarea
                id="message"
                value={newNotification.message}
                onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                placeholder="팀원들에게 전달할 메시지를 입력하세요"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>수신자 선택 *</Label>
                <div className="flex flex-wrap gap-2">
                  {["김철수", "이영희", "박민수", "정다은", "최준호"].map((member) => (
                    <Button
                      key={member}
                      variant={newNotification.recipients.includes(member) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const updated = newNotification.recipients.includes(member)
                          ? newNotification.recipients.filter((m) => m !== member)
                          : [...newNotification.recipients, member]
                        setNewNotification({ ...newNotification, recipients: updated })
                      }}
                    >
                      <Users className="w-3 h-3 mr-1" />
                      {member}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">우선순위</Label>
                <Select
                  value={newNotification.priority}
                  onValueChange={(value: any) => setNewNotification({ ...newNotification, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">낮음</SelectItem>
                    <SelectItem value="medium">보통</SelectItem>
                    <SelectItem value="high">높음</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSendNotification} className="bg-primary hover:bg-primary/90">
                <Send className="w-4 h-4 mr-2" />
                알림 전송
              </Button>
              <Button variant="outline" onClick={() => setShowSendForm(false)}>
                취소
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                최근 알림
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}개 읽지 않음
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    notification.isRead ? "bg-muted/30" : "bg-background border-primary/20"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {getTypeIcon(notification.type)}
                          {getTypeLabel(notification.type)}
                        </Badge>
                        <Badge className={getPriorityColor(notification.priority)} variant="secondary">
                          {getPriorityLabel(notification.priority)}
                        </Badge>
                        {!notification.isRead && <Badge variant="destructive">새 알림</Badge>}
                      </div>
                      <h4 className="font-semibold">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>보낸이: {notification.sender}</span>
                        <span>{new Date(notification.createdAt).toLocaleString("ko-KR")}</span>
                        <span>수신자: {notification.recipients.length}명</span>
                      </div>
                    </div>
                    {!notification.isRead && (
                      <Button size="sm" variant="outline" onClick={() => handleMarkAsRead(notification.id)}>
                        읽음 처리
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">알림이 없습니다</h3>
                  <p className="text-muted-foreground">새 알림을 보내서 팀원들과 소통해보세요</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                팀원 현황
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["김철수", "이영희", "박민수", "정다은", "최준호"].map((member) => {
                  const memberNotifications = notifications.filter((n) => n.recipients.includes(member))
                  const unreadForMember = memberNotifications.filter((n) => !n.isRead).length

                  return (
                    <div key={member} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <span className="font-medium">{member}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {memberNotifications.length}개 알림
                        </Badge>
                        {unreadForMember > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {unreadForMember}개 읽지 않음
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                빠른 메시지
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => {
                  setNewNotification({
                    ...newNotification,
                    type: "reminder",
                    title: "과제 제출 알림",
                    message: "과제 제출 기한이 임박했습니다. 서둘러 제출해주세요.",
                  })
                  setShowSendForm(true)
                }}
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                과제 제출 알림
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => {
                  setNewNotification({
                    ...newNotification,
                    type: "announcement",
                    title: "팀 미팅 안내",
                    message: "팀 미팅 일정을 안내드립니다.",
                  })
                  setShowSendForm(true)
                }}
              >
                <Calendar className="w-4 h-4 mr-2" />팀 미팅 안내
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => {
                  setNewNotification({
                    ...newNotification,
                    type: "curriculum",
                    title: "새 커리큘럼 안내",
                    message: "새로운 학습 커리큘럼이 배정되었습니다.",
                  })
                  setShowSendForm(true)
                }}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                커리큘럼 안내
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
