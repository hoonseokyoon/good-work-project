import SearchFilters from '@/components/filters/search-filters'
import InstitutionListItem from '@/components/institution-list-item'
import NaverMap from '@/components/naver-map'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { sb } from '@/lib/supabase-server'

export const revalidate = 3600

export const metadata = {
  title: '찾기 — 수도원·수녀원',
  description: '전국의 수도원·수녀원을 지도와 리스트로 탐색합니다.'
}

type Institution = {
  id?: number
  name: string
  slug: string
  lat: number | null
  lng: number | null
  order?: number | null
  type?: string | null
  address?: string | null
}

const fallbackInstitutions: Institution[] = [
  {
    id: 1,
    name: '서울 베네딕도회',
    slug: 'seoul-benedictine',
    lat: 37.5856,
    lng: 126.9735,
    type: '베네딕도회',
    address: '서울특별시 종로구'
  },
  {
    id: 2,
    name: '춘천 카르멜 수녀원',
    slug: 'chuncheon-carmelite',
    lat: 37.8741,
    lng: 127.7342,
    type: '카르멜회',
    address: '강원특별자치도 춘천시'
  }
]

export default async function MapPage() {
  let institutions: Institution[] = fallbackInstitutions

  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    const supabase = sb()
    const { data } = await supabase
      .from('institutions')
      .select('id, name, slug, lat, lng, order, type, address')
      .order('name')
    if (data?.length) {
      institutions = data
    }
  }

  const center = institutions[0]?.lat && institutions[0]?.lng ? { lat: institutions[0].lat, lng: institutions[0].lng } : { lat: 37.5665, lng: 126.978 }

  const markers = institutions
    .filter((item) => typeof item.lat === 'number' && typeof item.lng === 'number')
    .map((item) => ({ lat: item.lat as number, lng: item.lng as number, title: item.name, slug: item.slug }))

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-8 space-y-4">
        <SearchFilters />
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">지도에서 찾기</CardTitle>
          </CardHeader>
          <CardContent>
            <NaverMap center={center} markers={markers} />
          </CardContent>
        </Card>
      </div>
      <aside className="lg:col-span-4 space-y-3">
        {institutions.map((institution) => (
          <InstitutionListItem key={institution.slug} item={institution} />
        ))}
      </aside>
    </div>
  )
}
