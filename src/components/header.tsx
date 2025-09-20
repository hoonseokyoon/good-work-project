'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

const nav = [
  { href: '/map', label: '찾기' },
  { href: '/news', label: '뉴스' },
  { href: '/contribute', label: '기여' }
]

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          수도원·수녀원 허브
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          {nav.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(`${item.href}/`)
            return (
              <Button
                key={item.href}
                asChild
                size="sm"
                variant={active ? 'default' : 'ghost'}
                aria-current={active ? 'page' : undefined}
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            )
          })}
        </nav>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="메뉴 열기">
                <Menu className="h-5 w-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 space-y-4">
              <div className="pt-4 text-lg font-semibold">수도원·수녀원 허브</div>
              <Separator />
              <div className="flex flex-col gap-2">
                {nav.map((item) => {
                  const active = pathname === item.href || pathname?.startsWith(`${item.href}/`)
                  return (
                    <Button
                      key={item.href}
                      asChild
                      size="sm"
                      variant={active ? 'default' : 'ghost'}
                      aria-current={active ? 'page' : undefined}
                    >
                      <Link href={item.href}>{item.label}</Link>
                    </Button>
                  )
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
