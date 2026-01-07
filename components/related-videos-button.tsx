"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Youtube, ExternalLink, Search } from "lucide-react"
import { findRelatedVideos, openYouTubeVideo } from "@/lib/youtube-utils"

interface RelatedVideosButtonProps {
    videoTitle: string
    videoId?: string
    variant?: "default" | "outline" | "ghost"
    size?: "default" | "sm" | "lg"
    className?: string
}

export function RelatedVideosButton({
    videoTitle,
    videoId,
    variant = "outline",
    size = "sm",
    className = "",
}: RelatedVideosButtonProps) {
    const handleFindRelated = () => {
        findRelatedVideos(videoTitle)
    }

    const handleOpenInYouTube = () => {
        if (videoId) {
            openYouTubeVideo(videoId)
        }
    }

    return (
        <div className={`flex gap-2 ${className}`}>
            <Button
                variant={variant}
                size={size}
                onClick={handleFindRelated}
                className="border-primary/30 hover:bg-primary/10"
            >
                <Search className="w-4 h-4 mr-2" />
                관련 영상 찾기
                <Badge variant="secondary" className="ml-2 bg-[#FF0000]/20 text-[#FF0000] text-xs">
                    YouTube
                </Badge>
            </Button>

            {videoId && (
                <Button
                    variant="ghost"
                    size={size}
                    onClick={handleOpenInYouTube}
                    className="text-muted-foreground hover:text-foreground"
                >
                    <Youtube className="w-4 h-4 mr-2 text-[#FF0000]" />
                    YouTube에서 보기
                    <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
            )}
        </div>
    )
}
