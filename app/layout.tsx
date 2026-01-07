import type React from "react"
import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import "./globals.css"
import { AdminNav } from "@/components/admin-nav"
import { AuthProvider } from "@/components/auth-provider"
import { RealtimeProvider } from "@/components/realtime-provider"

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
})

export const metadata: Metadata = {
  title: "LifeCurriculum - 인생커리큘럼",
  description: "개인과 팀의 성장을 위한 통합 학습 관리 플랫폼",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={dmSans.variable}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <RealtimeProvider>
            <AdminNav />
            {children}
          </RealtimeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
