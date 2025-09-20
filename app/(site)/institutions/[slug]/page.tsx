import type { Metadata } from "next"
import { sb } from "@/lib/supabase-server"
import NaverMap from "@/components/naver-map"
import ProductCard from "@/components/product-card"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateTime } from "@/lib/utils"

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data } = await sb().from("institutions").select("name, description").eq("slug", params.slug).maybeSingle()

  return {
    title: data?.name ? `${data.name} — 수도원·수녀원` : "기관 소개",
    description: data?.description ?? "수도원·수녀원의 소개와 후원 정보를 확인하세요."
  }
}

export default async function InstitutionPage({ params }: Props) {
  const client = sb()
  const { data: institution } = await client.from("institutions").select("*").eq("slug", params.slug).maybeSingle()

  if (!institution) {
    return (
      <div className="rounded-3xl border bg-card p-12 text-center text-muted-foreground">
        해당 기관 정보를 찾을 수 없습니다.
      </div>
    )
  }

  const [{ data: products = [] }, { data: events = [] }] = await Promise.all([
    client.from("products").select("*").eq("institution_id", institution.id).limit(12),
    client.from("events").select("*").eq("institution_id", institution.id).order("start_at", { ascending: true })
  ])

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold">{institution.name}</h1>
          {institution.type ? <Badge variant="secondary">{institution.type}</Badge> : null}
        </div>
        <p className="whitespace-pre-line text-sm text-muted-foreground">{institution.description}</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">위치</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {institution.lat && institution.lng ? (
            <NaverMap
              center={{ lat: institution.lat, lng: institution.lng }}
              markers={[
                {
                  lat: institution.lat,
                  lng: institution.lng,
                  title: institution.name,
                  slug: institution.slug
                }
              ]}
            />
          ) : (
            <p className="text-sm text-muted-foreground">주소 및 좌표 정보가 등록되지 않았습니다.</p>
          )}
          <div className="rounded-xl bg-muted px-4 py-2 text-sm text-muted-foreground">{institution.address}</div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">후원 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {institution.donation?.account ? (
              <p>
                계좌: <span className="font-medium text-foreground">{institution.donation.account}</span>
              </p>
            ) : null}
            {institution.donation?.page_url ? (
              <a
                href={institution.donation.page_url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-primary underline-offset-4 hover:underline"
              >
                후원 페이지 바로가기
              </a>
            ) : (
              <p>등록된 후원 링크가 없습니다.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">연락처</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {institution.phone ? <p>전화: {institution.phone}</p> : null}
            {institution.email ? <p>이메일: {institution.email}</p> : null}
            {institution.website_url ? (
              <a
                href={institution.website_url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-primary underline-offset-4 hover:underline"
              >
                공식 홈페이지
              </a>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {products.length ? (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">대표 상품</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product: any) => (
              <ProductCard key={product.id} item={product} />
            ))}
          </div>
        </section>
      ) : null}

      {events.length ? (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">행사 및 모임</h2>
          <ul className="space-y-3">
            {events.map((event: any) => (
              <li key={event.id} className="flex items-center justify-between rounded-2xl border bg-card px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-foreground">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(event.start_at)}</p>
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
        </section>
      ) : null}
    </div>
  )
}
