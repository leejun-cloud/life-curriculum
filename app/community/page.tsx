"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Search,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  TrendingUp,
  Users,
  Star,
  BookOpen,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [posts, setPosts] = useState<any[]>([])
  const [followingUsers, setFollowingUsers] = useState<string[]>([])

  useEffect(() => {
    const savedFollowing = JSON.parse(localStorage.getItem("followingUsers") || "[]")
    setFollowingUsers(savedFollowing)
  }, [])

  useEffect(() => {
    localStorage.setItem("followingUsers", JSON.stringify(followingUsers))
  }, [followingUsers])

  const handleFollowUser = (userName: string) => {
    console.log("[v0] Follow action for user:", userName)

    setFollowingUsers((prev) => {
      const isCurrentlyFollowing = prev.includes(userName)
      if (isCurrentlyFollowing) {
        return prev.filter((name) => name !== userName)
      } else {
        return [...prev, userName]
      }
    })

    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.user.name === userName ? { ...post, user: { ...post.user, isFollowing: !post.user.isFollowing } } : post,
      ),
    )
  }

  const getFilteredPosts = (tabValue: string) => {
    switch (tabValue) {
      case "following":
        return posts.filter((post) => followingUsers.includes(post.user.name))
      case "bookmarks":
        return posts.filter((post) => post.isBookmarked)
      default:
        return posts
    }
  }

  const toggleLike = (postId: number) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
          : post,
      ),
    )
  }

  const toggleBookmark = (postId: number) => {
    setPosts(posts.map((post) => (post.id === postId ? { ...post, isBookmarked: !post.isBookmarked } : post)))
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">커뮤니티</h1>
            </div>

            <div className="flex-1 max-w-md ml-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="커리큘럼, 해시태그, 사용자 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card border-border"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <Tabs defaultValue="feed" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="feed">피드</TabsTrigger>
                <TabsTrigger value="trending">인기</TabsTrigger>
                <TabsTrigger value="following">팔로잉</TabsTrigger>
                <TabsTrigger value="bookmarks">북마크</TabsTrigger>
              </TabsList>

              <TabsContent value="feed">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <Card key={post.id} className="bg-card border-border">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={post.user.avatar || "/placeholder.svg"} />
                              <AvatarFallback>{post.user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-card-foreground">{post.user.name}</h4>
                              <p className="text-sm text-muted-foreground">{post.timestamp}</p>
                            </div>
                          </div>
                          <Button
                            variant={followingUsers.includes(post.user.name) ? "outline" : "default"}
                            size="sm"
                            onClick={() => handleFollowUser(post.user.name)}
                          >
                            {followingUsers.includes(post.user.name) ? "팔로잉" : "팔로우"}
                          </Button>
                        </div>
                        <div className="space-y-4">
                          <p className="text-card-foreground">{post.content}</p>
                          {post.type === "curriculum_share" && post.curriculum && (
                            <Card className="bg-muted/50 border-border relative">
                              <CardContent className="p-4">
                                <div className="flex gap-4">
                                  <div
                                    className="cursor-pointer hover:opacity-80 transition-opacity relative"
                                    onClick={() => console.log("Curriculum clicked")}
                                  >
                                    <Image
                                      src={post.curriculum.thumbnail || "/placeholder.svg"}
                                      alt={post.curriculum.title}
                                      width={96}
                                      height={72}
                                      className="w-24 h-18 object-cover rounded-lg"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                      <BookOpen className="w-6 h-6 text-white bg-black/50 rounded-full p-1" />
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <h5
                                      className="font-semibold text-card-foreground mb-1 cursor-pointer hover:text-primary transition-colors"
                                      onClick={() => console.log("Curriculum clicked")}
                                    >
                                      {post.curriculum.title}
                                    </h5>
                                    <p className="text-sm text-muted-foreground mb-2">{post.curriculum.description}</p>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                          <Heart className="w-3 h-3" />
                                          <span>{post.curriculum.likes}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Users className="w-3 h-3" />
                                          <span>{post.curriculum.students}</span>
                                        </div>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => console.log("Import curriculum clicked")}
                                        className="text-xs"
                                      >
                                        <BookOpen className="w-3 h-3 mr-1" />내 커리큘럼으로
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                          {post.type === "learning_achievement" && post.achievement && (
                            <Card className="bg-muted/50 border-border">
                              <CardContent className="p-4">
                                <div className="flex gap-4">
                                  <Image
                                    src={post.achievement.image || "/placeholder.svg"}
                                    alt={post.achievement.title}
                                    width={96}
                                    height={72}
                                    className="w-24 h-18 object-cover rounded-lg"
                                  />
                                  <div className="flex-1">
                                    <h5 className="font-semibold text-card-foreground mb-1">
                                      {post.achievement.title}
                                    </h5>
                                    <p className="text-sm text-muted-foreground">{post.achievement.description}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {post.hashtags.map((hashtag) => (
                              <Badge key={hashtag} variant="secondary" className="cursor-pointer hover:bg-primary/20">
                                {hashtag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <div className="flex items-center gap-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleLike(post.id)}
                                className={post.isLiked ? "text-red-500" : ""}
                              >
                                <Heart className={`w-4 h-4 mr-1 ${post.isLiked ? "fill-current" : ""}`} />
                                {post.likes}
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MessageCircle className="w-4 h-4 mr-1" />
                                {post.comments}
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Share2 className="w-4 h-4 mr-1" />
                                {post.shares}
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleBookmark(post.id)}
                              className={post.isBookmarked ? "text-primary" : ""}
                            >
                              <Bookmark className={`w-4 h-4 ${post.isBookmarked ? "fill-current" : ""}`} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="bg-card border-border">
                    <CardContent className="p-12 text-center">
                      <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-card-foreground mb-2">아직 게시물이 없습니다</h3>
                      <p className="text-muted-foreground">
                        커뮤니티에 첫 번째 게시물을 작성하고 다른 사용자들과 소통해보세요!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="trending">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <Card key={post.id} className="bg-card border-border">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={post.user.avatar || "/placeholder.svg"} />
                              <AvatarFallback>{post.user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-card-foreground">{post.user.name}</h4>
                              <p className="text-sm text-muted-foreground">{post.timestamp}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            팔로잉
                          </Badge>
                        </div>
                        <p className="text-card-foreground">{post.content}</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="bg-card border-border">
                    <CardContent className="p-12 text-center">
                      <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-card-foreground mb-2">인기 콘텐츠가 없습니다</h3>
                      <p className="text-muted-foreground">아직 인기 콘텐츠가 없습니다.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="following">
                {getFilteredPosts("following").length > 0 ? (
                  getFilteredPosts("following").map((post) => (
                    <Card key={post.id} className="bg-card border-border">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={post.user.avatar || "/placeholder.svg"} />
                              <AvatarFallback>{post.user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-card-foreground">{post.user.name}</h4>
                              <p className="text-sm text-muted-foreground">{post.timestamp}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            팔로잉
                          </Badge>
                        </div>
                        <p className="text-card-foreground">{post.content}</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="bg-card border-border">
                    <CardContent className="p-12 text-center">
                      <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-card-foreground mb-2">팔로우한 사용자가 없습니다</h3>
                      <p className="text-muted-foreground">관심 있는 사용자를 팔로우해보세요!</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="bookmarks">
                {getFilteredPosts("bookmarks").length > 0 ? (
                  getFilteredPosts("bookmarks").map((post) => (
                    <Card key={post.id} className="bg-card border-border">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={post.user.avatar || "/placeholder.svg"} />
                              <AvatarFallback>{post.user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-card-foreground">{post.user.name}</h4>
                              <p className="text-sm text-muted-foreground">{post.timestamp}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            북마크됨
                          </Badge>
                        </div>
                        <p className="text-card-foreground">{post.content}</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="bg-card border-border">
                    <CardContent className="p-12 text-center">
                      <Bookmark className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-card-foreground mb-2">북마크한 콘텐츠가 없습니다</h3>
                      <p className="text-muted-foreground">마음에 드는 게시물을 북마크해보세요!</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Star className="w-5 h-5 text-primary" />내 활동
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">팔로워</span>
                  <span className="font-semibold text-card-foreground">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">팔로잉</span>
                  <span className="font-semibold text-card-foreground">{followingUsers.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">게시물</span>
                  <span className="font-semibold text-card-foreground">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">받은 좋아요</span>
                  <span className="font-semibold text-card-foreground">0</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
