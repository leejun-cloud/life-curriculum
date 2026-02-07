"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Mail, Lock, User } from "lucide-react"
import { signIn, signUp, signInWithGoogle } from "@/lib/auth"
import { useAuth } from "@/components/auth-provider"
import { Suspense } from "react"

function LoginContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode")
  const { user, loading } = useAuth()
  
  const [activeTab, setActiveTab] = useState("signin")

  useEffect(() => {
    if (mode === "signup") {
      setActiveTab("signup")
    }
  }, [mode])


  useEffect(() => {
    if (!loading && user) {
      console.log("[v0] User already authenticated, redirecting to home")
      router.push("/")
    }
  }, [user, loading, router])

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError("")

    try {
      const user = await signInWithGoogle()
      if (user) {
        console.log("[v0] Google sign in successful, user:", user.email)
      }
    } catch (error: any) {
      console.log("[v0] Google sign in error:", error.message)
      let errorMessage = "Google 로그인에 실패했습니다."

      if (error.code === "auth/operation-not-allowed") {
        errorMessage = "Google 로그인이 비활성화되어 있습니다. 관리자에게 문의하세요."
      } else if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "로그인이 취소되었습니다."
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "팝업이 차단되었습니다. 팝업을 허용하고 다시 시도하세요."
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const user = await signIn(email, password)
      if (user) {
        console.log("[v0] Email sign in successful, user:", user.email)
      }
    } catch (error: any) {
      console.log("[v0] Email sign in error:", error.message)
      let errorMessage = "로그인에 실패했습니다."

      if (error.code === "auth/operation-not-allowed") {
        errorMessage = "이메일/비밀번호 로그인이 비활성화되어 있습니다. 관리자에게 문의하세요."
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "등록되지 않은 이메일입니다. 회원가입을 먼저 진행해주세요."
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "비밀번호가 올바르지 않습니다."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "올바르지 않은 이메일 형식입니다."
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도하세요."
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = "이메일 또는 비밀번호가 올바르지 않습니다. 계정이 없다면 회원가입을 먼저 진행해주세요."
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.")
      setIsLoading(false)
      return
    }

    try {
      const user = await signUp(email, password, name)
      if (user) {
        console.log("[v0] Sign up successful, user:", user.email)
      }
    } catch (error: any) {
      console.log("[v0] Sign up error:", error.message)
      let errorMessage = "회원가입에 실패했습니다."

      if (error.code === "auth/operation-not-allowed") {
        errorMessage = "회원가입이 비활성화되어 있습니다. 관리자에게 문의하세요."
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage = "이미 사용 중인 이메일입니다."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "올바르지 않은 이메일 형식입니다."
      } else if (error.code === "auth/weak-password") {
        errorMessage = "비밀번호가 너무 약합니다. 6자 이상 입력하세요."
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">LifeCurriculum</h1>
          </div>
          <CardTitle>계정에 로그인</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isLoading ? "로그인 중..." : "Google로 로그인"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">또는</span>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">로그인</TabsTrigger>
              <TabsTrigger value="signup">회원가입</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="duoenjia7@gmail.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">비밀번호</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "로그인 중..." : "로그인"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="이름을 입력하세요"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">이메일</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="이메일을 입력하세요"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">비밀번호</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="비밀번호를 입력하세요"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">비밀번호 확인</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      name="confirmPassword"
                      type="password"
                      placeholder="비밀번호를 다시 입력하세요"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "가입 중..." : "회원가입"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
