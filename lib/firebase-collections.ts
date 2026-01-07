import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "./firebase"
import { getYouTubeThumbnail } from "./youtube-utils"

export const getUsersCollection = () => collection(db, "users")
export const getCurriculumsCollection = () => collection(db, "curriculums")
export const getTeamsCollection = () => collection(db, "teams")
export const getAssignmentsCollection = () => collection(db, "assignments")
export const getNotificationsCollection = () => collection(db, "notifications")
export const getProgressCollection = () => collection(db, "progress")

// User operations
export const createUser = async (userData: any) => {
  const userRef = doc(db, "users", userData.id)
  await setDoc(userRef, {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return userRef
}

export const updateUser = async (userId: string, userData: any) => {
  const userRef = doc(db, "users", userId)
  return await updateDoc(userRef, {
    ...userData,
    updatedAt: serverTimestamp(),
  })
}

export const getUser = async (userId: string) => {
  const userRef = doc(db, "users", userId)
  const userSnap = await getDoc(userRef)
  return userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } : null
}

// Curriculum operations
export const createCurriculum = async (curriculumData: any) => {
  const finalData = { ...curriculumData }

  if (!finalData.thumbnail && finalData.contents && finalData.contents.length > 0) {
    const firstVideo = finalData.contents[0]
    if (firstVideo.videoId) {
      finalData.thumbnail = getYouTubeThumbnail(firstVideo.videoId, "hq")
      console.log("[v0] Auto-generated thumbnail from first video:", finalData.thumbnail)
    }
  }

  return await addDoc(getCurriculumsCollection(), {
    ...finalData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export const updateCurriculum = async (curriculumId: string, curriculumData: any) => {
  const curriculumRef = doc(db, "curriculums", curriculumId)

  const finalData = { ...curriculumData }

  if (!finalData.thumbnail && finalData.contents && finalData.contents.length > 0) {
    const firstVideo = finalData.contents[0]
    if (firstVideo.videoId) {
      finalData.thumbnail = getYouTubeThumbnail(firstVideo.videoId, "hq")
      console.log("[v0] Auto-generated thumbnail from first video:", finalData.thumbnail)
    }
  }

  return await updateDoc(curriculumRef, {
    ...finalData,
    updatedAt: serverTimestamp(),
  })
}

export const deleteCurriculum = async (curriculumId: string) => {
  const curriculumRef = doc(db, "curriculums", curriculumId)
  return await deleteDoc(curriculumRef)
}

export const getCurriculums = async (userId?: string) => {
  let q = query(getCurriculumsCollection())

  if (userId) {
    q = query(getCurriculumsCollection(), where("createdBy", "==", userId))
  }

  const querySnapshot = await getDocs(q)
  const curriculums = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

  return curriculums.sort((a: any, b: any) => {
    const aTime = a.createdAt?.seconds || 0
    const bTime = b.createdAt?.seconds || 0
    return bTime - aTime
  })
}

export const getCurriculum = async (curriculumId: string) => {
  const curriculumRef = doc(db, "curriculums", curriculumId)
  const curriculumSnap = await getDoc(curriculumRef)
  return curriculumSnap.exists() ? { id: curriculumSnap.id, ...curriculumSnap.data() } : null
}

// Team operations
export const createTeam = async (teamData: any) => {
  return await addDoc(getTeamsCollection(), {
    ...teamData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export const updateTeam = async (teamId: string, teamData: any) => {
  const teamRef = doc(db, "teams", teamId)
  return await updateDoc(teamRef, {
    ...teamData,
    updatedAt: serverTimestamp(),
  })
}

export const getTeam = async (teamId: string) => {
  const teamRef = doc(db, "teams", teamId)
  const teamSnap = await getDoc(teamRef)
  return teamSnap.exists() ? { id: teamSnap.id, ...teamSnap.data() } : null
}

// Assignment operations
export const createAssignment = async (assignmentData: any) => {
  return await addDoc(getAssignmentsCollection(), {
    ...assignmentData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export const getAssignments = async (teamId: string) => {
  const q = query(getAssignmentsCollection(), where("teamId", "==", teamId), orderBy("createdAt", "desc"))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

// Notification operations
export const createNotification = async (notificationData: any) => {
  return await addDoc(getNotificationsCollection(), {
    ...notificationData,
    createdAt: serverTimestamp(),
    read: false,
  })
}

export const getNotifications = async (userId: string) => {
  const q = query(getNotificationsCollection(), where("userId", "==", userId), limit(50))
  const querySnapshot = await getDocs(q)
  const notifications = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

  return notifications.sort((a: any, b: any) => {
    const aTime = a.createdAt?.seconds || 0
    const bTime = b.createdAt?.seconds || 0
    return bTime - aTime
  })
}

// Progress operations
export const updateProgress = async (userId: string, curriculumId: string, progressData: any) => {
  const progressRef = doc(db, "progress", `${userId}_${curriculumId}`)

  try {
    const progressSnap = await getDoc(progressRef)

    if (progressSnap.exists()) {
      // 기존 진행률 업데이트
      return await updateDoc(progressRef, {
        ...progressData,
        updatedAt: serverTimestamp(),
      })
    } else {
      // 새로운 진행률 생성
      return await setDoc(progressRef, {
        userId,
        curriculumId,
        ...progressData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }
  } catch (error) {
    console.error("[v0] Error updating progress:", error)
    throw error
  }
}

export const getProgress = async (userId: string, curriculumId: string) => {
  const progressRef = doc(db, "progress", `${userId}_${curriculumId}`)
  const progressSnap = await getDoc(progressRef)
  return progressSnap.exists() ? { id: progressSnap.id, ...progressSnap.data() } : null
}

// Real-time listeners
export const subscribeToUserData = (userId: string, callback: (userData: any) => void) => {
  const userRef = doc(db, "users", userId)
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() })
    }
  })
}

export const subscribeToCurriculums = (userId: string, callback: (curriculums: any[]) => void) => {
  const q = query(getCurriculumsCollection(), where("createdBy", "==", userId))
  return onSnapshot(q, (querySnapshot) => {
    const curriculums = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    const sortedCurriculums = curriculums.sort((a: any, b: any) => {
      const aTime = a.createdAt?.seconds || 0
      const bTime = b.createdAt?.seconds || 0
      return bTime - aTime
    })
    callback(sortedCurriculums)
  })
}

export const subscribeToNotifications = (userId: string, callback: (notifications: any[]) => void) => {
  const q = query(getNotificationsCollection(), where("userId", "==", userId), limit(20))
  return onSnapshot(q, (querySnapshot) => {
    const notifications = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    const sortedNotifications = notifications.sort((a: any, b: any) => {
      const aTime = a.createdAt?.seconds || 0
      const bTime = b.createdAt?.seconds || 0
      return bTime - aTime
    })
    callback(sortedNotifications)
  })
}

export const setUserAsAdmin = async (email: string) => {
  const q = query(getUsersCollection(), where("email", "==", email))
  const querySnapshot = await getDocs(q)

  if (!querySnapshot.empty) {
    const userDoc = querySnapshot.docs[0]
    const userId = userDoc.id

    await updateUser(userId, {
      role: "admin",
      permissions: ["all"],
    })

    console.log(`[v0] User ${email} has been set as admin`)
    return { success: true, userId }
  } else {
    console.log(`[v0] User with email ${email} not found`)
    return { success: false, error: "User not found" }
  }
}

export const initializeAdminUser = async () => {
  try {
    const result = await setUserAsAdmin("duoenjia7@gmail.com")
    if (result.success) {
      console.log("[v0] Admin user duoenjia7@gmail.com has been successfully configured")
    }
    return result
  } catch (error) {
    console.error("[v0] Error setting admin user:", error)
    return { success: false, error }
  }
}
