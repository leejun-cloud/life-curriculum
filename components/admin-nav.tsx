"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { useRealtime } from "@/components/realtime-provider"
import { Settings, Users, BarChart3, FileCheck, UserCheck, Building, Crown } from "lucide-react"

export function AdminNav() {
  const { user } = useAuth()
  const { unreadNotifications } = useRealtime()

  if (!user || user.role === "user") return null

  const adminLinks = [
    { href: "/admin/dashboard", label: "관리자 대시보드", icon: BarChart3, roles: ["admin"] },
    { href: "/admin/users", label: "사용자 관리", icon: Users, roles: ["admin"] },
    { href: "/admin/content", label: "콘텐츠 승인", icon: FileCheck, roles: ["admin"] },
    { href: "/admin/analytics", label: "분석", icon: Settings, roles: ["admin"] },
    { href: "/team/dashboard", label: "팀 관리", icon: Building, roles: ["team_leader", "admin"] },
    { href: "/team/members", label: "팀원 관리", icon: UserCheck, roles: ["team_leader", "admin"] },
  ]

  const availableLinks = adminLinks.filter((link) => link.roles.includes(user.role))

  return (
    <div className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 h-12 overflow-x-auto">
          <div className="flex items-center gap-2 mr-4">
            <Crown className="w-4 h-4 text-primary" />
            <Badge variant={user.role === "admin" ? "default" : "secondary"}>
              {user.role === "admin" ? "전체 관리자" : "팀장"}
            </Badge>
            {unreadNotifications > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadNotifications}
              </Badge>
            )}
          </div>

          {availableLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link key={link.href} href={link.href}>
                <Button variant="ghost" size="sm" className="gap-2 whitespace-nowrap">
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Button>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
