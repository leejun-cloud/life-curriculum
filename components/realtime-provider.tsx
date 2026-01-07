"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import {
  subscribeToCurriculums,
  subscribeToNotifications,
  subscribeToUserData,
  getTeam,
} from "@/lib/firebase-collections"

interface RealtimeContextType {
  curriculums: any[]
  notifications: any[]
  userData: any | null
  teamData: any | null
  unreadNotifications: number
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined)

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [curriculums, setCurriculums] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [userData, setUserData] = useState<any | null>(null)
  const [teamData, setTeamData] = useState<any | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setCurriculums([])
      setNotifications([])
      setUserData(null)
      setTeamData(null)
      return
    }

    console.log("[v0] Setting up real-time listeners for user:", user.id)

    // Subscribe to user's curriculums
    const unsubscribeCurriculums = subscribeToCurriculums(user.id, (curriculumData) => {
      console.log("[v0] Real-time curriculum update:", curriculumData.length, "curriculums")
      setCurriculums(curriculumData)
    })

    // Subscribe to user's notifications
    const unsubscribeNotifications = subscribeToNotifications(user.id, (notificationData) => {
      console.log("[v0] Real-time notification update:", notificationData.length, "notifications")
      setNotifications(notificationData)
    })

    // Subscribe to user data changes
    const unsubscribeUserData = subscribeToUserData(user.id, (userDataUpdate) => {
      console.log("[v0] Real-time user data update:", userDataUpdate)
      setUserData(userDataUpdate)

      // Load team data if user has a team
      if (userDataUpdate?.teamId) {
        loadTeamData(userDataUpdate.teamId)
      }
    })

    const loadTeamData = async (teamId: string) => {
      try {
        const team = await getTeam(teamId)
        setTeamData(team)
        console.log("[v0] Team data loaded:", team?.name)
      } catch (error) {
        console.error("[v0] Error loading team data:", error)
      }
    }

    // Cleanup subscriptions
    return () => {
      unsubscribeCurriculums()
      unsubscribeNotifications()
      unsubscribeUserData()
    }
  }, [user])

  const unreadNotifications = notifications.filter((n) => !n.read).length

  const value = {
    curriculums,
    notifications,
    userData,
    teamData,
    unreadNotifications,
  }

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
}

export function useRealtime() {
  const context = useContext(RealtimeContext)
  if (context === undefined) {
    throw new Error("useRealtime must be used within a RealtimeProvider")
  }
  return context
}
