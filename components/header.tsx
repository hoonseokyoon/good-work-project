"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/map", label: "찾기" },
  { href: "/news", label: "뉴스" },
  { href: "/contribute", label: "기여" }
]

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-lg">수도원·수녀원 허브</span>
        </Link>
        <nav className="flex items-center gap-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="focus:outline-none">
              <Button
                size="sm"
                variant={pathname?.startsWith(item.href) ? "default" : "ghost"}
                className={cn("rounded-full px-4", pathname === item.href && "shadow")}
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
