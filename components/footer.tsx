import Link from "next/link"
import { Separator } from "@/components/ui/separator"

const footerLinks = [
  { label: "지도", href: "/map" },
  { label: "뉴스", href: "/news" },
  { label: "기여", href: "/contribute" }
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto space-y-4 px-4 py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">수도원·수녀원 허브</h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              전국의 수도원과 수녀원을 한눈에 살피고, 기도와 노동의 삶에 함께할 수 있도록 돕는 열린 플랫폼입니다.
            </p>
          </div>
          <nav className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {footerLinks.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <Separator className="opacity-70" />
        <p className="text-xs text-muted-foreground">© {year} 수도원·수녀원 허브. 모두의 기여로 완성됩니다.</p>
      </div>
    </footer>
  )
}
