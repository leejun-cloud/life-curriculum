import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth"
import { auth } from "./firebase"
import { createUser, updateUser, getUser, createTeam as createTeamInFirestore } from "./firebase-collections"

export type UserRole = "user" | "team_leader" | "admin"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  teamId?: string
  permissions: Permission[]
  createdAt?: Date
  updatedAt?: Date
}

export interface Permission {
  resource: string
  actions: string[]
}

export interface Team {
  id: string
  name: string
  leaderId: string
  memberIds: string[]
  createdAt: Date
  updatedAt?: Date
}

export async function signIn(email: string, password: string): Promise<User | null> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    // Firestore에서 사용자 프로필 가져오기
    const userProfile = await getUser(firebaseUser.uid)

    if (userProfile) {
      console.log("[v0] User signed in:", userProfile.email)
      return userProfile as User
    }

    return null
  } catch (error) {
    console.error("[v0] Sign in error:", error)
    throw error
  }
}

export async function signUp(email: string, password: string, name: string): Promise<User | null> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    // Firestore에 사용자 프로필 생성
    const userData: Omit<User, "id"> = {
      name,
      email,
      role: "user",
      permissions: [],
    }

    await createUser({ ...userData, id: firebaseUser.uid })

    const newUser: User = {
      id: firebaseUser.uid,
      ...userData,
    }

    console.log("[v0] User signed up:", newUser.email)
    return newUser
  } catch (error) {
    console.error("[v0] Sign up error:", error)
    throw error
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth)
    console.log("[v0] User signed out")
  } catch (error) {
    console.error("[v0] Sign out error:", error)
    throw error
  }
}

// 권한 확인 함수
export function hasPermission(user: User, resource: string, action: string): boolean {
  // 전체 관리자는 모든 권한 보유
  if (user.role === "admin") {
    console.log("[v0] Admin user has all permissions")
    return true
  }

  // 팀장은 자신의 팀에 대한 권한 보유
  if (user.role === "team_leader" && resource.startsWith("team:")) {
    const teamId = resource.split(":")[1]
    return user.teamId === teamId
  }

  // 개별 권한 확인
  return user.permissions.some((permission) => permission.resource === resource && permission.actions.includes(action))
}

export function isAdmin(user: User | null): boolean {
  if (!user) return false
  const result = user.role === "admin"
  console.log("[v0] isAdmin check:", { userRole: user.role, isAdmin: result })
  return result
}

export function isTeamLeader(user: User | null): boolean {
  if (!user) return false
  return user.role === "team_leader" || user.role === "admin"
}

export async function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userProfile = await getUser(firebaseUser.uid)
          resolve(userProfile as User)
        } catch (error) {
          console.error("[v0] Error getting user profile:", error)
          resolve(null)
        }
      } else {
        resolve(null)
      }
      unsubscribe()
    })
  })
}

export async function setUserRole(userId: string, role: UserRole): Promise<void> {
  try {
    await updateUser(userId, { role })
    console.log("[v0] User role changed to:", role)
  } catch (error) {
    console.error("[v0] Error updating user role:", error)
    throw error
  }
}

export async function createTeam(name: string, leaderId: string, additionalData?: any): Promise<Team> {
  try {
    const teamData = {
      name,
      leaderId,
      memberIds: [leaderId],
      ...additionalData, // Merge additional data (e.g. curriculumId, description)
    }

    const teamRef = await createTeamInFirestore(teamData)

    // 팀장 권한 부여
    await setUserRole(leaderId, "team_leader")
    await updateUser(leaderId, { teamId: teamRef.id })

    const team: Team = {
      id: teamRef.id,
      ...teamData,
      createdAt: new Date(),
    }

    console.log("[v0] Team created:", team.name)
    return team
  } catch (error) {
    console.error("[v0] Error creating team:", error)
    throw error
  }
}

export async function getUserTeams(userId: string): Promise<Team[]> {
  try {
    // 실제 구현에서는 Firestore 쿼리를 사용해야 함
    // 현재는 기본 구조만 제공
    return []
  } catch (error) {
    console.error("[v0] Error getting user teams:", error)
    return []
  }
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const userProfile = await getUser(firebaseUser.uid)
        callback(userProfile as User)
      } catch (error) {
        console.error("[v0] Error getting user profile:", error)
        callback(null)
      }
    } else {
      callback(null)
    }
  })
}

export async function signInWithGoogle(): Promise<User | null> {
  try {
    const provider = new GoogleAuthProvider()
    const userCredential = await signInWithPopup(auth, provider)
    const firebaseUser = userCredential.user

    // 기존 사용자인지 확인
    let userProfile = await getUser(firebaseUser.uid)

    if (!userProfile) {
      // 새 사용자인 경우 Firestore에 프로필 생성
      const userData: Omit<User, "id"> = {
        name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Google User",
        email: firebaseUser.email || "",
        role: "user",
        permissions: [],
      }

      await createUser({ ...userData, id: firebaseUser.uid })

      userProfile = {
        id: firebaseUser.uid,
        ...userData,
      }
    }

    console.log("[v0] User signed in with Google:", userProfile.email)
    return userProfile as User
  } catch (error) {
    console.error("[v0] Google sign in error:", error)
    throw error
  }
}
