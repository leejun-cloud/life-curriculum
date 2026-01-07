"use client"

import { type ReactNode, useEffect, useState } from "react"
import { hasPermission, type UserRole } from "@/lib/auth"
import { useAuth } from "@/components/auth-provider"

interface RoleGuardProps {
  children: ReactNode
  allowedRoles?: UserRole[]
  resource?: string
  action?: string
  fallback?: ReactNode
}

export function RoleGuard({ children, allowedRoles, resource, action, fallback = null }: RoleGuardProps) {
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setHasAccess(false)
      setLoading(false)
      return
    }

    let access = false

    // 역할 기반 접근 제어
    if (allowedRoles) {
      access = allowedRoles.includes(user.role)
    }

    // 권한 기반 접근 제어
    if (resource && action) {
      access = hasPermission(user, resource, action)
    }

    if (!allowedRoles && !resource && !action) {
      access = true
    }

    console.log("[v0] RoleGuard access check:", {
      userRole: user.role,
      allowedRoles,
      resource,
      action,
      access,
    })

    setHasAccess(access)
    setLoading(false)
  }, [user, allowedRoles, resource, action])

  if (loading) {
    return <div className="animate-pulse bg-muted h-8 rounded"></div>
  }

  if (!hasAccess) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
