import type { Metadata } from "next"
import { Noto_Sans_KR } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"

const notoSans = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-pretendard"
})

export const metadata: Metadata = {
  title: "수도원·수녀원 허브",
  description: "한 곳에서 찾고 참여하는 수도원·수녀원 정보"
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={notoSans.variable}>
      <body className="min-h-screen bg-background text-foreground">
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="container mx-auto flex-1 px-4 py-8">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
