"use client"

import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"

export function SiteHeader() {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Life Curriculum</span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <Link href="/my-dashboard">
                <Button className="rounded-full px-6 gradient-violet hover:opacity-90 transition-opacity">
                  {user.avatar && <span className="mr-2">{user.avatar}</span>}
                  내 대시보드
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" className="rounded-full">로그인</Button>
                </Link>
                <Link href="/register">
                  <Button className="rounded-full gradient-violet">시작하기</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
