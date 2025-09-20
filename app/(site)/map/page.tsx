import type { Metadata } from "next"
import { sb } from "@/lib/supabase-server"
import SearchFilters from "@/components/filters/search-filters"
import NaverMap from "@/components/naver-map"
import InstitutionListItem from "@/components/institution-list-item"
import { Card, CardContent } from "@/components/ui/card"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "찾기 — 수도원·수녀원 지도",
  description: "지도에서 전국 수도원과 수녀원을 살펴보고 상세 정보를 확인하세요."
}

export default async function MapPage({ searchParams }: { searchParams?: Record<string, string | string[]> }) {
  const client = sb()
  const { data: institutions = [] } = await client.from("institutions").select("*").order("name")

  const keyword = typeof searchParams?.q === "string" ? searchParams?.q : ""
  const order = typeof searchParams?.order === "string" ? searchParams?.order : ""

  const filtered = institutions.filter((institution: any) => {
    const matchesQuery = keyword
      ? `${institution.name} ${institution.address ?? ""}`.toLowerCase().includes(keyword.toLowerCase())
      : true
    const matchesOrder = order ? institution.type?.toLowerCase().includes(order.toLowerCase()) : true
    return matchesQuery && matchesOrder
  })

  const center = filtered[0]?.lat
    ? { lat: filtered[0].lat as number, lng: filtered[0].lng as number }
    : { lat: 37.5665, lng: 126.978 }

  const markers = filtered
    .filter((item: any) => Boolean(item.lat && item.lng))
    .map((item: any) => ({ lat: item.lat, lng: item.lng, title: item.name, slug: item.slug }))

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="space-y-4 lg:col-span-8">
        <Card className="border-none bg-transparent shadow-none">
          <CardContent className="p-0">
            <SearchFilters />
          </CardContent>
        </Card>
        <NaverMap center={center} markers={markers} />
      </div>
      <aside className="space-y-3 lg:col-span-4">
        {filtered.length ? (
          filtered.map((institution: any) => (
            <InstitutionListItem key={institution.slug} item={institution} />
          ))
        ) : (
          <p className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">검색 조건에 맞는 기관이 없습니다.</p>
        )}
      </aside>
    </div>
  )
}
