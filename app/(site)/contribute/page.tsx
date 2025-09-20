import type { Metadata } from "next"
import { sb } from "@/lib/supabase-server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import ProductCard from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { formatDateTime } from "@/lib/utils"

export const metadata: Metadata = {
  title: "기여 — 후원/구매/참여",
  description: "후원, 선물, 봉사 참여 등 다양한 방법으로 수도원을 응원하세요."
}

export default async function ContributePage() {
  const client = sb()
  const [institutionsRes, productsRes, eventsRes] = await Promise.all([
    client.from("institutions").select("id, name, slug, donation").limit(50),
    client.from("products").select("*").limit(24),
    client.from("events").select("*").order("start_at", { ascending: true }).limit(24)
  ])

  const institutions = (institutionsRes as any).data ?? []
  const products = (productsRes as any).data ?? []
  const events = (eventsRes as any).data ?? []

  return (
    <Tabs defaultValue="donate" className="space-y-6">
      <TabsList>
        <TabsTrigger value="donate">후원</TabsTrigger>
        <TabsTrigger value="buy">구매</TabsTrigger>
        <TabsTrigger value="volunteer">참여</TabsTrigger>
      </TabsList>

      <TabsContent value="donate" className="space-y-4">
        <p className="text-sm text-muted-foreground">후원 계좌와 공식 링크를 통해 수도자들의 일상을 응원할 수 있습니다.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {institutions.map((institution: any) => (
            <Card key={institution.id} className="h-full">
              <CardContent className="space-y-3 p-4 text-sm text-muted-foreground">
                <div className="text-base font-medium text-foreground">{institution.name}</div>
                {institution.donation?.account ? (
                  <div>
                    계좌: <span className="font-semibold text-foreground">{institution.donation.account}</span>
                  </div>
                ) : (
                  <div>계좌 정보가 등록되지 않았습니다.</div>
                )}
                {institution.donation?.page_url ? (
                  <a
                    href={institution.donation.page_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex text-xs text-primary underline-offset-4 hover:underline"
                  >
                    후원 페이지 이동
                  </a>
                ) : null}
                <Button asChild size="sm" variant="secondary" className="rounded-full">
                  <a href={`/institutions/${institution.slug}`}>기관 상세보기</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="buy" className="space-y-4">
        <p className="text-sm text-muted-foreground">수도자들이 정성으로 만든 상품을 구매하여 사도직을 지원해 주세요.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product: any) => (
            <ProductCard key={product.id} item={product} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="volunteer" className="space-y-4">
        <p className="text-sm text-muted-foreground">피정과 봉사, 체험 프로그램으로 수도자들과 함께하는 시간을 만들어 보세요.</p>
        <ul className="space-y-3 text-sm text-muted-foreground">
          {events.map((event: any) => (
            <li key={event.id} className="flex items-center justify-between rounded-2xl border bg-card px-4 py-3">
              <div>
                <p className="font-medium text-foreground">{event.title}</p>
                <p className="text-xs">{formatDateTime(event.start_at)}</p>
              </div>
              {event.signup_url ? (
                <a
                  href={event.signup_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm text-primary underline-offset-4 hover:underline"
                >
                  신청하기
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      </TabsContent>
    </Tabs>
  )
}
