"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Plus,
    Search,
    Youtube,
    Loader2,
    ExternalLink,
    CheckCircle,
    AlertCircle
} from "lucide-react"
import { getYouTubeMetadata, searchYouTubeInNewTab, isValidYouTubeUrl } from "@/lib/youtube-utils"

interface YouTubeAddHelperProps {
    onAdd: (videoData: {
        videoId: string
        title: string
        author: string
        thumbnail: string
        url: string
    }) => void
    onCancel: () => void
    suggestedQuery?: string
}

export function YouTubeAddHelper({ onAdd, onCancel, suggestedQuery }: YouTubeAddHelperProps) {
    const [youtubeUrl, setYoutubeUrl] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [previewData, setPreviewData] = useState<any>(null)

    const handleOpenYouTubeSearch = () => {
        searchYouTubeInNewTab(suggestedQuery || "")
    }

    const handlePreview = async () => {
        if (!youtubeUrl.trim()) {
            setError("YouTube URL을 입력해주세요")
            return
        }

        if (!isValidYouTubeUrl(youtubeUrl)) {
            setError("올바른 YouTube URL을 입력해주세요")
            return
        }

        setError("")
        setIsLoading(true)

        try {
            const metadata = await getYouTubeMetadata(youtubeUrl)

            if (!metadata) {
                setError("영상 정보를 가져올 수 없습니다")
                return
            }

            setPreviewData(metadata)
        } catch (err) {
            setError("영상 정보를 가져오는 중 오류가 발생했습니다")
        } finally {
            setIsLoading(false)
        }
    }

    const handleAdd = () => {
        if (!previewData) return

        onAdd({
            videoId: previewData.videoId,
            title: previewData.title,
            author: previewData.author,
            thumbnail: previewData.thumbnail,
            url: youtubeUrl,
        })

        // Reset
        setYoutubeUrl("")
        setPreviewData(null)
        setError("")
    }

    return (
        <Card className="bg-card/50 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Youtube className="w-5 h-5 text-[#FF0000]" />
                    YouTube 영상 추가
                </CardTitle>
                <CardDescription>
                    YouTube에서 영상을 검색하고, 링크를 복사하여 붙여넣으세요
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* YouTube 검색 도우미 */}
                <div className="flex gap-2">
                    <Input
                        type="text"
                        placeholder={suggestedQuery || "검색어를 입력하세요"}
                        defaultValue={suggestedQuery}
                        className="bg-input border-border/50"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                searchYouTubeInNewTab(e.currentTarget.value || suggestedQuery || "")
                            }
                        }}
                    />
                    <Button
                        variant="outline"
                        className="border-[#FF0000]/30 text-[#FF0000] hover:bg-[#FF0000]/10"
                        onClick={handleOpenYouTubeSearch}
                    >
                        <Youtube className="w-4 h-4 mr-2" />
                        YouTube 검색
                    </Button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">또는</span>
                    </div>
                </div>

                {/* URL 입력 */}
                <div className="space-y-2">
                    <Label htmlFor="youtube-url">YouTube 링크 붙여넣기</Label>
                    <div className="flex gap-2">
                        <Input
                            id="youtube-url"
                            type="url"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={youtubeUrl}
                            onChange={(e) => {
                                setYoutubeUrl(e.target.value)
                                setError("")
                            }}
                            className="bg-input border-border/50"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handlePreview()
                                }
                            }}
                        />
                        <Button
                            onClick={handlePreview}
                            disabled={isLoading || !youtubeUrl.trim()}
                            className="gradient-violet"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    확인 중...
                                </>
                            ) : (
                                <>
                                    <Search className="w-4 h-4 mr-2" />
                                    확인
                                </>
                            )}
                        </Button>
                    </div>
                    {error && (
                        <div className="flex items-center gap-2 text-sm text-destructive">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}
                </div>

                {/* 미리보기 */}
                {previewData && (
                    <div className="space-y-4 pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2 text-sm text-chart-2">
                            <CheckCircle className="w-4 h-4" />
                            영상 정보를 가져왔습니다
                        </div>

                        <div className="flex gap-4">
                            <img
                                src={previewData.thumbnail}
                                alt={previewData.title}
                                className="w-32 h-20 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                                <h4 className="font-semibold line-clamp-2">{previewData.title}</h4>
                                <p className="text-sm text-muted-foreground">{previewData.author}</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={handleAdd} className="gradient-violet flex-1">
                                <Plus className="w-4 h-4 mr-2" />
                                커리큘럼에 추가
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setPreviewData(null)
                                    setYoutubeUrl("")
                                }}
                                className="border-border/50"
                            >
                                다시 입력
                            </Button>
                        </div>
                    </div>
                )}

                {/* 취소 버튼 */}
                {!previewData && (
                    <div className="flex justify-end pt-2">
                        <Button variant="ghost" onClick={onCancel}>
                            취소
                        </Button>
                    </div>
                )}

                {/* 도움말 */}
                <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                    <p className="font-semibold flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        사용 방법
                    </p>
                    <ol className="list-decimal list-inside space-y-1 pl-2">
                        <li>"YouTube 검색" 버튼을 눌러 YouTube에서 영상 검색</li>
                        <li>원하는 영상의 URL 복사 (브라우저 주소창 또는 공유 버튼)</li>
                        <li>위의 입력창에 붙여넣기 후 "확인" 클릭</li>
                        <li>미리보기 확인 후 "커리큘럼에 추가"</li>
                    </ol>
                </div>
            </CardContent>
        </Card>
    )
}
