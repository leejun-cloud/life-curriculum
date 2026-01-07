export async function forkCurriculum(curriculumId: string, userId: string): Promise<string> {
    try {
        // Load original curriculum
        const saved = localStorage.getItem("publicCurriculums")
        if (!saved) {
            throw new Error("커리큘럼 정보를 찾을 수 없습니다.")
        }

        const curriculums = JSON.parse(saved)
        const original = curriculums.find((c: any) => c.id === curriculumId)

        if (!original) {
            throw new Error("커리큘럼을 찾을 수 없습니다.")
        }

        // Create forked curriculum
        const newId = Date.now().toString()
        const forkedCurriculum = {
            ...original,
            id: newId,
            metadata: {
                ...original.metadata,
                likes: 0,
                forks: 0,
                views: 0,
                rating: 0,
                ratingCount: 0,
                originalId: curriculumId,
            },
            createdAt: new Date().toISOString(),
        }

        //  Save to user's curriculums
        const userCurriculums = JSON.parse(localStorage.getItem("myCurriculums") || "[]")
        userCurriculums.push(forkedCurriculum)
        localStorage.setItem("myCurriculums", JSON.stringify(userCurriculums))

        // Increment fork count of original
        const update = curriculums.map((c: any) =>
            c.id === curriculumId
                ? { ...c, metadata: { ...c.metadata, forks: (c.metadata.forks || 0) + 1 } }
                : c
        )
        localStorage.setItem("publicCurriculums", JSON.stringify(updatedCurriculums))

        console.log("[v0] Forked curriculum:", newId, "from", curriculumId)
        return newId
    } catch (error) {
        console.error("[v0] Error forking curriculum:", error)
        throw error
    }
}

export async function likeCurriculum(curriculumId: string, userId: string): Promise<void> {
    try {
        const liked = JSON.parse(localStorage.getItem("likedCurriculums") || "{}")
        const isLiked = liked[curriculumId]

        if (isLiked) {
            // Unlike
            delete liked[curriculumId]
        } else {
            // Like
            liked[curriculumId] = true
        }

        localStorage.setItem("likedCurriculums", JSON.stringify(liked))

        // Update like count
        const saved = localStorage.getItem("publicCurriculums")
        if (saved) {
            const curriculums = JSON.parse(saved)
            const updated = curriculums.map((c: any) =>
                c.id === curriculumId
                    ? {
                        ...c,
                        metadata: {
                            ...c.metadata,
                            likes: isLiked ? (c.metadata.likes || 1) - 1 : (c.metadata.likes || 0) + 1,
                        },
                    }
                    : c
            )
            localStorage.setItem("publicCurriculums", JSON.stringify(updated))
        }

        console.log("[v0] Like toggled for curriculum:", curriculumId)
    } catch (error) {
        console.error("[v0] Error liking curriculum:", error)
        throw error
    }
}

export function isLiked(curriculumId: string): boolean {
    const liked = JSON.parse(localStorage.getItem("likedCurriculums") || "{}")
    return !!liked[curriculumId]
}
