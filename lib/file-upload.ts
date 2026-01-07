import { storage } from "./firebase"
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage"

export interface UploadProgress {
    progress: number
    status: "uploading" | "success" | "error"
    url?: string
    error?: string
}

const ALLOWED_FILE_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
    "application/x-zip-compressed",
    "image/jpeg",
    "image/png",
    "image/gif",
    "text/plain",
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `파일 크기가 너무 큽니다. 최대 ${MAX_FILE_SIZE / 1024 / 1024}MB까지 업로드 가능합니다.`,
        }
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: "지원하지 않는 파일 형식입니다. PDF, DOCX, ZIP, 이미지 파일만 업로드 가능합니다.",
        }
    }

    return { valid: true }
}

export async function uploadAssignmentFile(
    file: File,
    assignmentId: string,
    userId: string,
    onProgress?: (progress: number) => void
): Promise<string> {
    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
        throw new Error(validation.error)
    }

    // For demo mode (when Firebase is not configured), use localStorage
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "demo-api-key") {
        return new Promise((resolve) => {
            // Simulate upload progress
            let progress = 0
            const interval = setInterval(() => {
                progress += 10
                if (onProgress) onProgress(progress)

                if (progress >= 100) {
                    clearInterval(interval)
                    // Store file info in localStorage (not the actual file, just metadata)
                    const fileUrl = `demo://assignments/${assignmentId}/${userId}/${file.name}`
                    resolve(fileUrl)
                }
            }, 100)
        })
    }

    // Real Firebase Storage upload
    const storageRef = ref(storage, `assignments/${assignmentId}/${userId}/${Date.now()}_${file.name}`)
    const uploadTask = uploadBytesResumable(storageRef, file)

    return new Promise((resolve, reject) => {
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                if (onProgress) onProgress(progress)
            },
            (error) => {
                console.error("Upload error:", error)
                reject(new Error("파일 업로드 중 오류가 발생했습니다."))
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
                    resolve(downloadURL)
                } catch (error) {
                    reject(new Error("파일 URL을 가져오는 중 오류가 발생했습니다."))
                }
            }
        )
    })
}

export async function deleteAssignmentFile(fileUrl: string): Promise<void> {
    // For demo mode, just return
    if (fileUrl.startsWith("demo://")) {
        return Promise.resolve()
    }

    try {
        const fileRef = ref(storage, fileUrl)
        await deleteObject(fileRef)
    } catch (error) {
        console.error("Delete error:", error)
        throw new Error("파일 삭제 중 오류가 발생했습니다.")
    }
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
}

export function getFileExtension(filename: string): string {
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2)
}

export function getFileIcon(filename: string): string {
    const ext = getFileExtension(filename).toLowerCase()

    switch (ext) {
        case "pdf":
            return "📄"
        case "doc":
        case "docx":
            return "📝"
        case "zip":
            return "🗜️"
        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
            return "🖼️"
        case "txt":
            return "📃"
        default:
            return "📎"
    }
}
