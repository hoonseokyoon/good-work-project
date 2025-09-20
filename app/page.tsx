import Link from "next/link"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import InstitutionListItem from "@/components/institution-list-item"
import NewsCard from "@/components/news-card"
import ProductCard from "@/components/product-card"
import { sb } from "@/lib/supabase-server"
import { formatDate } from "@/lib/utils"

export const metadata: Metadata = {
  title: "수도원·수녀원 허브 — 한 곳에서 찾고 참여하는 수도회 정보",
  description: "지도, 뉴스, 후원과 참여 정보를 모은 수도원·수녀원 통합 허브"
}

export default async function HomePage() {
  const client = sb()

  const [institutionsRes, newsRes, productsRes, eventsRes] = await Promise.all([
    client.from("institutions").select("*").order("order", { ascending: true }).limit(4),
    client.from("news").select("*").order("published_at", { ascending: false }).limit(4),
    client.from("products").select("*").limit(4),
    client.from("events").select("*").order("start_at", { ascending: true }).limit(4)
  ])

  const institutions = (institutionsRes as any).data ?? []
  const news = (newsRes as any).data ?? []
  const products = (productsRes as any).data ?? []
  const events = (eventsRes as any).data ?? []

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 px-8 py-16 text-white shadow-lg">
        <div className="max-w-3xl space-y-6">
          <p className="rounded-full bg-white/10 px-4 py-1 text-sm font-medium text-white/90">전국 수도원·수녀원 통합 플랫폼</p>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            기도와 삶이 만나는 공간을 <span className="text-sky-200">수도원·수녀원 허브</span>에서 찾아보세요.
          </h1>
          <p className="text-base text-slate-200">
            지도에서 위치를 확인하고, 생생한 활동 소식과 제품, 봉사와 후원 기회를 한 자리에서 살펴볼 수 있습니다.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full bg-white text-slate-900 hover:bg-slate-100">
              <Link href="/map">지도에서 찾기</Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20">
              <Link href="/contribute">기여 방법 살펴보기</Link>
            </Button>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-32 top-1/2 hidden h-64 w-64 -translate-y-1/2 rounded-full bg-sky-400/40 blur-3xl lg:block" />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">추천 수도원·수녀원</h2>
            <p className="text-sm text-muted-foreground">기도와 환대의 공간을 미리 살펴보고 마음 가는 곳을 찾아보세요.</p>
          </div>
          <Button asChild variant="ghost" className="rounded-full">
            <Link href="/map">전체 지도 보기</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {institutions.map((institution: any) => (
            <InstitutionListItem key={institution.slug} item={institution} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">다가오는 프로그램</CardTitle>
              <p className="text-sm text-muted-foreground">기도 모임, 봉사 일정 등 마음을 나눌 수 있는 일정을 확인하세요.</p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {events.length ? (
                events.map((event: any) => (
                  <div key={event.id} className="rounded-xl border bg-card px-4 py-3">
                    <p className="font-medium text-foreground">{event.title}</p>
                    <p className="text-xs">{formatDate(event.start_at, { month: "long", day: "numeric" })}</p>
                    {event.signup_url ? (
                      <a
                        className="mt-2 inline-flex text-xs font-medium text-primary underline-offset-4 hover:underline"
                        href={event.signup_url}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        참여 신청
                      </a>
                    ) : null}
                  </div>
                ))
              ) : (
                <p>등록된 행사가 없습니다.</p>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">최근 소식</h2>
            <Link href="/news" className="text-sm text-primary underline-offset-4 hover:underline">
              더 보기
            </Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {news.map((article: any) => (
              <NewsCard key={article.id} item={article} />
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">선한 소비와 나눔</h2>
            <p className="text-sm text-muted-foreground">작은 구매와 후원이 수도자들의 삶을 지키는 큰 힘이 됩니다.</p>
          </div>
          <Button asChild variant="ghost" className="rounded-full">
            <Link href="/contribute">모든 기여 보기</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product: any) => (
            <ProductCard key={product.id} item={product} />
          ))}
        </div>
      </section>
    </div>
  )
}
