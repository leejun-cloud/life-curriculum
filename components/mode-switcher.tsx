"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { User, Users, Globe, Check } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { updateUser, getUser } from "@/lib/firebase-collections"

type Mode = "personal" | "team" | "integrated"

interface ModeSwitcherProps {
  currentMode?: Mode
  onModeChange?: (mode: Mode) => void
  showDescription?: boolean
}

const modes = {
  personal: {
    id: "personal" as Mode,
    name: "개인",
    icon: User,
    description: "개인 학습에 집중하고 나만의 커리큘럼을 관리합니다",
    features: ["개인 진도 관리", "맞춤형 추천", "개인 통계"],
  },
  team: {
    id: "team" as Mode,
    name: "팀",
    icon: Users,
    description: "팀원들과 함께 학습하고 진행률을 공유합니다",
    features: ["팀 대시보드", "진행률 공유", "팀 채팅"],
  },
  integrated: {
    id: "integrated" as Mode,
    name: "통합",
    icon: Globe,
    description: "개인과 팀 학습을 모두 관리하는 통합 모드입니다",
    features: ["전체 대시보드", "모든 기능", "통합 분석"],
  },
}

export function ModeSwitcher({ currentMode = "personal", onModeChange, showDescription = false }: ModeSwitcherProps) {
  const [selectedMode, setSelectedMode] = useState<Mode>(currentMode)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const loadUserMode = async () => {
      if (user) {
        try {
          const userData = await getUser(user.id)
          if (userData?.preferredMode) {
            setSelectedMode(userData.preferredMode as Mode)
          }
        } catch (error) {
          console.error("[v0] Error loading user mode:", error)
        }
      }
    }

    loadUserMode()
  }, [user])

  const handleModeChange = async (mode: Mode) => {
    if (!user) return

    setLoading(true)
    try {
      setSelectedMode(mode)

      // Save to Firestore
      await updateUser(user.id, { preferredMode: mode })

      console.log("[v0] Mode changed to:", mode)
      onModeChange?.(mode)
    } catch (error) {
      console.error("[v0] Error saving mode:", error)
    } finally {
      setLoading(false)
    }
  }

  if (showDescription) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">학습 모드 선택</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.values(modes).map((mode) => {
            const Icon = mode.icon
            const isSelected = selectedMode === mode.id

            return (
              <Card
                key={mode.id}
                className={`cursor-pointer transition-all ${
                  isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                } ${loading ? "opacity-50 pointer-events-none" : ""}`}
                onClick={() => handleModeChange(mode.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-card-foreground">{mode.name}</h4>
                      {isSelected && <Check className="w-4 h-4 text-primary" />}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{mode.description}</p>

                  <div className="space-y-2">
                    {mode.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-1 h-1 bg-primary rounded-full"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
      {Object.values(modes).map((mode) => {
        const Icon = mode.icon
        const isSelected = selectedMode === mode.id

        return (
          <Button
            key={mode.id}
            variant={isSelected ? "default" : "ghost"}
            size="sm"
            className="h-8 gap-2"
            onClick={() => handleModeChange(mode.id)}
            disabled={loading}
          >
            <Icon className="w-4 h-4" />
            {mode.name}
          </Button>
        )
      })}
    </div>
  )
}
