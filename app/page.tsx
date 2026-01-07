"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, Bell, LogIn, ArrowRight, Plus, Grid3x3, List, Play } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useRealtime } from "@/components/realtime-provider"
import { useState } from "react"
import { getYouTubeThumbnail } from "@/lib/youtube-utils"

interface UserCurriculum {
  id: string
  title: string
  progress: number
  completedLessons: number
  totalLessons: number
  estimatedHours: number
  thumbnail?: string
  contents?: Array<{ videoId?: string }>
}

export default function Dashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { curriculums, unreadNotifications } = useRealtime()
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")

  const userCurriculums: UserCurriculum[] =
    user && curriculums
      ? curriculums.map((curriculum: any) => {
          let thumbnail = curriculum.thumbnail
          if (!thumbnail && curriculum.contents && curriculum.contents.length > 0) {
            const firstVideo = curriculum.contents[0]
            if (firstVideo.videoId) {
              thumbnail = getYouTubeThumbnail(firstVideo.videoId, "hq")
            }
          }

          return {
            id: curriculum.id,
            title: curriculum.title,
            progress: curriculum.progress || 0,
            completedLessons: curriculum.completedLessons || 0,
            totalLessons: curriculum.totalLessons || curriculum.contents?.length || 20,
            estimatedHours: curriculum.estimatedHours || 15,
            thumbnail,
            contents: curriculum.contents,
          }
        })
      : []

  const stats = {
    completed: userCurriculums.reduce((acc, curr) => acc + curr.completedLessons, 0),
    weeklyHours: Math.floor(userCurriculums.reduce((acc, curr) => acc + (curr.progress / 100) * 2, 0)),
    inProgress: userCurriculums.filter((c) => c.progress > 0 && c.progress < 100).length,
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-bold text-foreground">LifeCurriculum</h1>
            </Link>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  {unreadNotifications > 0 && (
                    <div className="relative">
                      <Button variant="ghost" size="icon" className="relative">
                        <Bell className="w-5 h-5" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center">
                          <span className="text-[10px] text-white font-medium">{unreadNotifications}</span>
                        </div>
                      </Button>
                    </div>
                  )}

                  <Link href="/profile">
                    <Avatar className="w-9 h-9 cursor-pointer hover:opacity-80 transition-opacity">
                      <AvatarImage src="/placeholder.svg?height=36&width=36" />
                      <AvatarFallback className="text-sm">{user.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                  </Link>
                </>
              ) : (
                <Link href="/login">
                  <Button size="sm">
                    <LogIn className="w-4 h-4 mr-2" />
                    로그인
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-24">
        {user ? (
          <>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-foreground mb-1">{stats.completed}</div>
                  <div className="text-sm text-muted-foreground">완료한 강의</div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-foreground mb-1">{stats.weeklyHours}h</div>
                  <div className="text-sm text-muted-foreground">이번 주 학습</div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-foreground mb-1">{stats.inProgress}</div>
                  <div className="text-sm text-muted-foreground">진행 중</div>
                </CardContent>
              </Card>
            </div>

            {userCurriculums.length > 0 && (
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">내 커리큘럼</h2>
                <div className="flex gap-1 bg-muted rounded-lg p-1">
                  <Button
                    size="sm"
                    variant={viewMode === "list" ? "default" : "ghost"}
                    onClick={() => setViewMode("list")}
                    className="h-8 px-3"
                  >
                    <List className="w-4 h-4 mr-1" />
                    리스트
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    onClick={() => setViewMode("grid")}
                    className="h-8 px-3"
                  >
                    <Grid3x3 className="w-4 h-4 mr-1" />
                    그리드
                  </Button>
                </div>
              </div>
            )}

            {viewMode === "list" ? (
              <div className="space-y-3 mb-8">
                {userCurriculums.length > 0 ? (
                  userCurriculums.slice(0, 4).map((curriculum) => {
                    const firstIncompleteIndex = curriculum.contents?.findIndex((c: any) => !c.completed) ?? 0
                    const targetUrl =
                      curriculum.progress > 0 && curriculum.progress < 100
                        ? `/curriculum/${curriculum.id}?continue=true`
                        : `/curriculum/${curriculum.id}`

                    return (
                      <Link key={curriculum.id} href={targetUrl}>
                        <Card className="bg-card/50 border-border/50 hover:bg-card/80 transition-colors cursor-pointer group">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <div
                                className="w-24 h-14 flex-shrink-0 rounded-lg bg-gradient-to-br from-primary/80 to-accent/60 relative overflow-hidden"
                                style={{
                                  backgroundImage: curriculum.thumbnail ? `url(${curriculum.thumbnail})` : undefined,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                }}
                              >
                                {curriculum.progress > 0 && curriculum.progress < 100 && (
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Play className="w-6 h-6 text-white fill-white" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground mb-1 truncate">{curriculum.title}</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {curriculum.completedLessons}/{curriculum.totalLessons} 완료 ·{" "}
                                  {curriculum.estimatedHours}시간 남음
                                </p>
                                <div className="h-1.5 w-full bg-primary/20 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary rounded-full transition-all"
                                    style={{ width: `${curriculum.progress}%` }}
                                  />
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                {curriculum.progress === 100 ? (
                                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                                    <svg
                                      className="w-5 h-5 text-primary"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </div>
                                ) : curriculum.progress > 0 ? (
                                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                                    <svg
                                      className="w-5 h-5 text-primary"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </div>
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                                    <svg
                                      className="w-4 h-4 text-muted-foreground"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })
                ) : (
                  <Card className="bg-card/50 border-border/50">
                    <CardContent className="p-12 text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">아직 커리큘럼이 없습니다</h3>
                      <p className="text-sm text-muted-foreground mb-6">첫 커리큘럼을 만들어 학습을 시작해보세요</p>
                      <Link href="/curriculum/create">
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          커리큘럼 만들기
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 mb-8">
                {userCurriculums.length > 0 ? (
                  userCurriculums.slice(0, 4).map((curriculum) => {
                    const targetUrl =
                      curriculum.progress > 0 && curriculum.progress < 100
                        ? `/curriculum/${curriculum.id}?continue=true`
                        : `/curriculum/${curriculum.id}`

                    return (
                      <Link key={curriculum.id} href={targetUrl}>
                        <Card className="bg-card/50 border-border/50 hover:bg-card/80 transition-colors cursor-pointer group h-full">
                          <CardContent className="p-0">
                            <div
                              className="w-full h-32 rounded-t-lg bg-gradient-to-br from-primary/80 to-accent/60 relative overflow-hidden"
                              style={{
                                backgroundImage: curriculum.thumbnail ? `url(${curriculum.thumbnail})` : undefined,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }}
                            >
                              {curriculum.progress > 0 && curriculum.progress < 100 && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Play className="w-8 h-8 text-white fill-white" />
                                </div>
                              )}
                              <div className="absolute top-2 right-2">
                                {curriculum.progress === 100 ? (
                                  <div className="w-6 h-6 rounded-full bg-primary/90 flex items-center justify-center">
                                    <svg
                                      className="w-4 h-4 text-white"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </div>
                                ) : curriculum.progress > 0 ? (
                                  <div className="w-6 h-6 rounded-full bg-primary/90 flex items-center justify-center">
                                    <Play className="w-3 h-3 text-white fill-white" />
                                  </div>
                                ) : null}
                              </div>
                            </div>
                            <div className="p-4">
                              <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{curriculum.title}</h3>
                              <p className="text-sm text-muted-foreground mb-3">
                                {curriculum.completedLessons}/{curriculum.totalLessons} 완료
                              </p>
                              <div className="h-1.5 w-full bg-primary/20 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full transition-all"
                                  style={{ width: `${curriculum.progress}%` }}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })
                ) : (
                  <Card className="bg-card/50 border-border/50 col-span-2">
                    <CardContent className="p-12 text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">아직 커리큘럼이 없습니다</h3>
                      <p className="text-sm text-muted-foreground mb-6">첫 커리큘럼을 만들어 학습을 시작해보세요</p>
                      <Link href="/curriculum/create">
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          커리큘럼 만들기
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {userCurriculums.length > 0 && (
              <div className="flex gap-3">
                <Link href="/curriculum" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent" size="lg">
                    전체 커리큘럼 보기
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/curriculum/create">
                  <Button size="lg">
                    <Plus className="w-4 h-4 mr-2" />새 커리큘럼
                  </Button>
                </Link>
              </div>
            )}
          </>
        ) : (
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-3">LifeCurriculum에 오신 것을 환영합니다</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                개인과 팀의 성장을 위한 통합 학습 관리 플랫폼입니다
              </p>
              <Link href="/login">
                <Button size="lg" className="px-8">
                  <LogIn className="w-5 h-5 mr-2" />
                  로그인하고 시작하기
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
