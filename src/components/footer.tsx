import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t bg-background/80">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold">수도원·수녀원 허브</p>
            <p className="text-sm text-muted-foreground">
              전국의 수도 공동체가 전하는 이야기와 참여 기회를 모아 전달합니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <Link href="/map" className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md px-1">
              찾기
            </Link>
            <Link href="/news" className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md px-1">
              뉴스
            </Link>
            <Link href="/contribute" className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md px-1">
              기여
            </Link>
          </div>
        </div>
        <div className="mt-8 text-xs text-muted-foreground">© {new Date().getFullYear()} Monastic Commons. 일부 정보는 Supabase와 연동되어 제공됩니다.</div>
      </div>
    </footer>
  )
}
