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
  increment,
} from "firebase/firestore"
import { db } from "./firebase"
import { getYouTubeThumbnail } from "./youtube-utils"

export const getUsersCollection = () => collection(db, "users")
export const getCurriculumsCollection = () => collection(db, "curriculums")
export const getTeamsCollection = () => collection(db, "teams")
export const getAssignmentsCollection = () => collection(db, "assignments")
export const getNotificationsCollection = () => collection(db, "notifications")
export const getProgressCollection = () => collection(db, "progress")
export const getNotesCollection = () => collection(db, "notes")

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

export const getPublicCurriculums = async (limitCount = 50) => {
  const q = query(
    getCurriculumsCollection(),
    where("isPublic", "==", true),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  )
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export const getCurriculum = async (curriculumId: string) => {
  const curriculumRef = doc(db, "curriculums", curriculumId)
  const curriculumSnap = await getDoc(curriculumRef)
  return curriculumSnap.exists() ? { id: curriculumSnap.id, ...curriculumSnap.data() } : null
}

export const incrementCurriculumViews = async (curriculumId: string) => {
  const curriculumRef = doc(db, "curriculums", curriculumId)
  await updateDoc(curriculumRef, {
    views: increment(1)
  })
}

// Fork operations
export const forkCurriculum = async (originalCurriculumId: string, newOwnerId: string) => {
  const originalRef = doc(db, "curriculums", originalCurriculumId)
  const originalSnap = await getDoc(originalRef)

  if (!originalSnap.exists()) {
    throw new Error("Curriculum not found")
  }

  const originalData = originalSnap.data()
  
  // Create new curriculum data
  const newCurriculumData = {
    ...originalData,
    title: `${originalData.title} (복사본)`, // Add (Copy) or similar if desired, or keep logic simple
    createdBy: newOwnerId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    likes: 0,
    likedBy: [], // Initialize likedBy
    views: 0,
    students: 1, // The forker is the first student
    isPublic: false, // Reset to private by default
    forkedFrom: originalCurriculumId
  }

  // Remove fields that should not be copied if any (e.g. implementation details)
  
  return await addDoc(getCurriculumsCollection(), newCurriculumData)
}

export const toggleLikeCurriculum = async (curriculumId: string, userId: string) => {
  const curriculumRef = doc(db, "curriculums", curriculumId)
  const snap = await getDoc(curriculumRef)
  
  if (!snap.exists()) return

  const data = snap.data()
  const likedBy = data.likedBy || []
  const isLiked = likedBy.includes(userId)

  if (isLiked) {
    await updateDoc(curriculumRef, {
       likes: increment(-1),
       likedBy: likedBy.filter((id: string) => id !== userId)
    })
    return false // isLiked now
  } else {
    await updateDoc(curriculumRef, {
       likes: increment(1),
       likedBy: [...likedBy, userId]
    })
    return true // isLiked now
  }
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

export const deleteTeam = async (teamId: string) => {
  const teamRef = doc(db, "teams", teamId)
  return await deleteDoc(teamRef)
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
// Progress operations
export const updateProgress = async (userId: string, curriculumId: string, contentId: number, progressData: any) => {
  const progressRef = doc(db, "progress", `${userId}_${curriculumId}_${contentId}`)

  try {
    const progressSnap = await getDoc(progressRef)

    if (progressSnap.exists()) {
      return await updateDoc(progressRef, {
        ...progressData,
        updatedAt: serverTimestamp(),
      })
    } else {
      return await setDoc(progressRef, {
        userId,
        curriculumId,
        contentId,
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

export const getProgress = async (userId: string, curriculumId: string, contentId: number) => {
  const progressRef = doc(db, "progress", `${userId}_${curriculumId}_${contentId}`)
  const progressSnap = await getDoc(progressRef)
  return progressSnap.exists() ? { id: progressSnap.id, ...progressSnap.data() } : null
}

// Helper to get ALL progress for a curriculum (to show list %s)
export const getCurriculumProgress = async (userId: string, curriculumId: string) => {
  const q = query(
    getProgressCollection(), 
    where("userId", "==", userId), 
    where("curriculumId", "==", curriculumId)
  )
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => doc.data())
}

// Note operations
export const saveNote = async (userId: string, curriculumId: string, contentId: number, note: string) => {
  const noteRef = doc(db, "notes", `${userId}_${curriculumId}_${contentId}`)
  await setDoc(noteRef, {
    userId,
    curriculumId,
    contentId,
    note,
    updatedAt: serverTimestamp(),
  })
}

export const getUserNote = async (userId: string, curriculumId: string, contentId: number) => {
  const noteRef = doc(db, "notes", `${userId}_${curriculumId}_${contentId}`)
  const noteSnap = await getDoc(noteRef)
  return noteSnap.exists() ? noteSnap.data().note : ""
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
