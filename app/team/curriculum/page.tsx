"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, Users, Plus, BookOpen, Target, Send, Edit, Eye } from "lucide-react"
import { RoleGuard } from "@/components/role-guard"
import { useRouter } from "next/navigation"

interface TeamCurriculum {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  deadline: string
  assignedMembers: string[]
  status: "draft" | "active" | "completed"
  progress: number
  createdAt: string
}

export default function TeamCurriculumPage() {
  const router = useRouter()
  const [teamCurriculums, setTeamCurriculums] = useState<TeamCurriculum[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingMembers, setEditingMembers] = useState<string | null>(null)
  const [tempMembers, setTempMembers] = useState<string[]>([])
  const [newCurriculum, setNewCurriculum] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "beginner",
    deadline: "",
    assignedMembers: [] as string[],
  })

  useEffect(() => {
    const saved = localStorage.getItem("teamCurriculums")
    if (saved) {
      setTeamCurriculums(JSON.parse(saved))
    } else {
      setTeamCurriculums([])
      localStorage.setItem("teamCurriculums", JSON.stringify([]))
    }
  }, [])

  const handleCreateCurriculum = () => {
    if (!newCurriculum.title || !newCurriculum.deadline) {
      alert("제목과 완료 기한을 입력해주세요.")
      return
    }

    const curriculum: TeamCurriculum = {
      id: Date.now().toString(),
      ...newCurriculum,
      status: "draft",
      progress: 0,
      createdAt: new Date().toISOString().split("T")[0],
    }

    const updated = [...teamCurriculums, curriculum]
    setTeamCurriculums(updated)
    localStorage.setItem("teamCurriculums", JSON.stringify(updated))

    console.log("[v0] Sending curriculum notification to team members:", newCurriculum.assignedMembers)
    alert(`새 팀 커리큘럼 "${newCurriculum.title}"이 생성되었습니다. 팀원들에게 알림이 전송되었습니다.`)

    setNewCurriculum({
      title: "",
      description: "",
      category: "",
      difficulty: "beginner",
      deadline: "",
      assignedMembers: [],
    })
    setShowCreateForm(false)
  }

  const handleActivateCurriculum = (id: string) => {
    const updated = teamCurriculums.map((curr) => (curr.id === id ? { ...curr, status: "active" as const } : curr))
    setTeamCurriculums(updated)
    localStorage.setItem("teamCurriculums", JSON.stringify(updated))

    const curriculum = updated.find((c) => c.id === id)
    console.log("[v0] Activating curriculum and sending notifications:", curriculum?.title)
    alert(`커리큘럼 "${curriculum?.title}"이 활성화되었습니다. 팀원들에게 시작 알림이 전송되었습니다.`)
  }

  const handleViewDetails = (id: string) => {
    console.log("[v0] Opening curriculum details:", id)
    router.push(`/team/curriculum/${id}`)
  }

  const handleEditMembers = (curriculum: TeamCurriculum) => {
    setEditingMembers(curriculum.id)
    setTempMembers([...curriculum.assignedMembers])
  }

  const handleSaveMembers = () => {
    if (!editingMembers) return

    const updated = teamCurriculums.map((curr) =>
      curr.id === editingMembers ? { ...curr, assignedMembers: [...tempMembers] } : curr,
    )
    setTeamCurriculums(updated)
    localStorage.setItem("teamCurriculums", JSON.stringify(updated))

    const curriculum = updated.find((c) => c.id === editingMembers)
    console.log("[v0] Updated team members for curriculum:", curriculum?.title, tempMembers)
    alert(`"${curriculum?.title}" 커리큘럼의 팀원이 업데이트되었습니다. 변경사항이 팀원들에게 알림으로 전송되었습니다.`)

    setEditingMembers(null)
    setTempMembers([])
  }

  const handleCancelEditMembers = () => {
    setEditingMembers(null)
    setTempMembers([])
  }

  const toggleMemberSelection = (member: string) => {
    const updated = tempMembers.includes(member) ? tempMembers.filter((m) => m !== member) : [...tempMembers, member]
    setTempMembers(updated)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <RoleGuard allowedRoles={["team_leader", "admin"]}>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">팀 커리큘럼 관리</h1>
            <p className="text-muted-foreground mt-2">팀원들과 함께 학습할 커리큘럼을 생성하고 관리하세요</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />새 커리큘럼 생성
          </Button>
        </div>

        {showCreateForm && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />새 팀 커리큘럼 생성
              </CardTitle>
              <CardDescription>팀원들과 함께 학습할 커리큘럼을 만들어보세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">커리큘럼 제목 *</Label>
                  <Input
                    id="title"
                    value={newCurriculum.title}
                    onChange={(e) => setNewCurriculum({ ...newCurriculum, title: e.target.value })}
                    placeholder="예: React 팀 프로젝트"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">카테고리</Label>
                  <Select
                    value={newCurriculum.category}
                    onValueChange={(value) => setNewCurriculum({ ...newCurriculum, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="기술">기술</SelectItem>
                      <SelectItem value="언어">언어</SelectItem>
                      <SelectItem value="비즈니스">비즈니스</SelectItem>
                      <SelectItem value="건강">건강</SelectItem>
                      <SelectItem value="취미">취미</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={newCurriculum.description}
                  onChange={(e) => setNewCurriculum({ ...newCurriculum, description: e.target.value })}
                  placeholder="커리큘럼에 대한 자세한 설명을 입력하세요"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">난이도</Label>
                  <Select
                    value={newCurriculum.difficulty}
                    onValueChange={(value) => setNewCurriculum({ ...newCurriculum, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">초급</SelectItem>
                      <SelectItem value="intermediate">중급</SelectItem>
                      <SelectItem value="advanced">고급</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">완료 기한 *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={newCurriculum.deadline}
                    onChange={(e) => setNewCurriculum({ ...newCurriculum, deadline: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>배정할 팀원</Label>
                <div className="flex flex-wrap gap-2">
                  {["김철수", "이영희", "박민수", "정다은", "최준호"].map((member) => (
                    <Button
                      key={member}
                      variant={newCurriculum.assignedMembers.includes(member) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const updated = newCurriculum.assignedMembers.includes(member)
                          ? newCurriculum.assignedMembers.filter((m) => m !== member)
                          : [...newCurriculum.assignedMembers, member]
                        setNewCurriculum({ ...newCurriculum, assignedMembers: updated })
                      }}
                    >
                      <Users className="w-3 h-3 mr-1" />
                      {member}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateCurriculum} className="bg-primary hover:bg-primary/90">
                  <Send className="w-4 h-4 mr-2" />
                  커리큘럼 생성 및 알림 전송
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  취소
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          {teamCurriculums.map((curriculum) => (
            <Card key={curriculum.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{curriculum.title}</CardTitle>
                      <Badge className={getStatusColor(curriculum.status)}>
                        {curriculum.status === "active"
                          ? "진행중"
                          : curriculum.status === "completed"
                            ? "완료"
                            : "준비중"}
                      </Badge>
                      <Badge className={getDifficultyColor(curriculum.difficulty)}>
                        {curriculum.difficulty === "beginner"
                          ? "초급"
                          : curriculum.difficulty === "intermediate"
                            ? "중급"
                            : "고급"}
                      </Badge>
                    </div>
                    <CardDescription>{curriculum.description}</CardDescription>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {curriculum.deadline}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        {curriculum.assignedMembers.length}명 배정
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Target className="w-4 h-4" />
                        진행률 {curriculum.progress}%
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {curriculum.status === "draft" && (
                        <Button
                          size="sm"
                          onClick={() => handleActivateCurriculum(curriculum.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Send className="w-4 h-4 mr-1" />
                          활성화 및 알림
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleViewDetails(curriculum.id)}>
                        <Eye className="w-4 h-4 mr-1" />
                        상세보기
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => handleEditMembers(curriculum)}>
                            <Edit className="w-4 h-4 mr-1" />
                            팀원 수정
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>팀원 수정</DialogTitle>
                            <DialogDescription>
                              "{curriculum.title}" 커리큘럼에 배정할 팀원을 선택하세요
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>팀원 선택</Label>
                              <div className="flex flex-wrap gap-2">
                                {["김철수", "이영희", "박민수", "정다은", "최준호"].map((member) => (
                                  <Button
                                    key={member}
                                    variant={
                                      editingMembers === curriculum.id && tempMembers.includes(member)
                                        ? "default"
                                        : "outline"
                                    }
                                    size="sm"
                                    onClick={() => toggleMemberSelection(member)}
                                  >
                                    <Users className="w-3 h-3 mr-1" />
                                    {member}
                                  </Button>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2 pt-4">
                              <Button onClick={handleSaveMembers} className="bg-primary hover:bg-primary/90">
                                저장
                              </Button>
                              <Button variant="outline" onClick={handleCancelEditMembers}>
                                취소
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {curriculum.assignedMembers.map((member) => (
                      <Badge key={member} variant="secondary" className="text-xs">
                        {member}
                      </Badge>
                    ))}
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${curriculum.progress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {teamCurriculums.length === 0 && !showCreateForm && (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">아직 팀 커리큘럼이 없습니다</h3>
              <p className="text-muted-foreground mb-4">팀원들과 함께 학습할 첫 번째 커리큘럼을 만들어보세요</p>
              <Button onClick={() => setShowCreateForm(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />첫 커리큘럼 생성하기
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleGuard>
  )
}
