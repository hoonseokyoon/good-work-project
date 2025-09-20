import type { Metadata } from 'next'
import { Noto_Sans_KR } from 'next/font/google'
import './globals.css'
import Header from '@/components/header'
import Footer from '@/components/footer'

const notoSans = Noto_Sans_KR({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans'
})

export const metadata: Metadata = {
  title: '수도원·수녀원 허브',
  description: '한 곳에서 찾고 참여하는 수도원·수녀원 정보'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${notoSans.variable} min-h-screen bg-background text-foreground`}>
        <Header />
        <main className="container mx-auto px-4 py-10 space-y-12">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
