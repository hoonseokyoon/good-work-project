import { Metadata } from 'next'
import Link from 'next/link'
import InstitutionHero from '@/components/institution-hero'
import NaverMap from '@/components/naver-map'
import ProductCard from '@/components/product-card'
import DonationMethodList from '@/components/donation-method-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { sb } from '@/lib/supabase-server'
import { DonationInfo, normalizeDonationMethods } from '@/lib/donation'

type Institution = {
  id: number
  name: string
  slug: string
  description?: string | null
  type?: string | null
  lat?: number | null
  lng?: number | null
  address?: string | null
  phone?: string | null
  email?: string | null
  website_url?: string | null
  donation?: DonationInfo | null
}

type Product = {
  id: number
  name: string
  category?: string | null
  unit?: string | null
  price?: number | null
  image_url?: string | null
  buy_url?: string | null
}

type Event = {
  id: number
  title: string
  start_at: string
  signup_url?: string | null
}

const fallbackInstitution: Institution = {
  id: 1,
  name: '서울 베네딕도회',
  slug: 'seoul-benedictine',
  description: '베네딕도 규칙에 따라 일상 속 기도와 노동을 실천하는 공동체입니다.',
  type: '베네딕도회',
  lat: 37.5856,
  lng: 126.9735,
  address: '서울특별시 종로구 청와대로 1',
  phone: '02-000-0000',
  email: 'info@seoul-benedictine.kr',
  website_url: 'https://example.com',
  donation: {
    methods: [
      {
        type: 'bank_account',
        bank: '국민은행',
        holder: '서울 베네딕도회',
        number: '123456-78-901234'
      },
      {
        type: 'link',
        label: '공식 후원 페이지',
        url: 'https://example.com/donate'
      }
    ]
  }
}

const fallbackProducts: Product[] = [
  {
    id: 1,
    name: '허브차 세트',
    category: '허브',
    unit: '3종',
    price: 18000,
    image_url: 'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=800&q=80',
    buy_url: 'https://example.com/product/herb-tea'
  },
  {
    id: 2,
    name: '수제 잼',
    category: '식품',
    unit: '200g',
    price: 12000,
    image_url: 'https://images.unsplash.com/photo-1502741126161-b048400d2516?auto=format&fit=crop&w=800&q=80'
  }
]

const fallbackEvents: Event[] = [
  {
    id: 1,
    title: '침묵 피정',
    start_at: new Date().toISOString(),
    signup_url: 'https://example.com/event/retreat'
  }
]

async function fetchInstitution(slug: string) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return { institution: fallbackInstitution, products: fallbackProducts, events: fallbackEvents }
  }

  const client = sb()
  const { data: institution } = await client
    .from('institutions')
    .select('id, name, slug, description, type, lat, lng, address, phone, email, website_url, donation')
    .eq('slug', slug)
    .maybeSingle()

  if (!institution) {
    return { institution: fallbackInstitution, products: fallbackProducts, events: fallbackEvents }
  }

  const [{ data: productsData = [] }, { data: eventsData = [] }] = await Promise.all([
    client
      .from('products')
      .select('id, name, category, unit, price, image_url, buy_url')
      .eq('institution_id', institution.id)
      .limit(12),
    client
      .from('events')
      .select('id, title, start_at, signup_url')
      .eq('institution_id', institution.id)
      .order('start_at')
  ])

  return {
    institution,
    products: productsData as Product[],
    events: eventsData as Event[]
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { institution } = await fetchInstitution(params.slug)
  return {
    title: `${institution.name} — 수도원·수녀원`,
    description: institution.description ?? '수도원·수녀원의 소개 페이지'
  }
}

export default async function InstitutionPage({ params }: { params: { slug: string } }) {
  const { institution, products, events } = await fetchInstitution(params.slug)

  const center = institution.lat && institution.lng ? { lat: institution.lat, lng: institution.lng } : null
  const donationMethods = normalizeDonationMethods(institution.donation)

  return (
    <div className="space-y-6">
      <InstitutionHero name={institution.name} type={institution.type} description={institution.description ?? undefined} />

      <Card>
        <CardHeader>
          <CardTitle>위치</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {center ? (
            <NaverMap center={center} markers={[{ ...center, title: institution.name, slug: institution.slug }]} />
          ) : (
            <p className="text-sm text-muted-foreground">주소/좌표 정보가 없습니다.</p>
          )}
          <div className="text-sm text-muted-foreground">{institution.address ?? '주소 정보 준비 중'}</div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>후원</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {donationMethods.length ? (
              <DonationMethodList methods={donationMethods} />
            ) : (
              <p className="text-muted-foreground">후원 정보가 준비 중입니다.</p>
            )}
            {institution.donation?.note ? (
              <p className="text-muted-foreground">{institution.donation.note}</p>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>연락처</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {institution.phone ? <div>전화: {institution.phone}</div> : null}
            {institution.email ? <div>이메일: {institution.email}</div> : null}
            {institution.website_url ? (
              <a className="underline" href={institution.website_url} target="_blank" rel="noreferrer noopener">
                공식 홈페이지
              </a>
            ) : null}
            <Button asChild size="sm" variant="secondary" className="mt-3">
              <Link href="/contribute">기여 페이지에서 더 보기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {products.length ? (
        <section>
          <h2 className="text-xl font-semibold">제품</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} item={product} />
            ))}
          </div>
        </section>
      ) : null}

      {events.length ? (
        <section>
          <h2 className="text-xl font-semibold">행사</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {events.map((event) => (
              <li key={event.id} className="flex items-center justify-between rounded-2xl border p-3">
                <div>
                  <div className="font-medium">{event.title}</div>
                  <div className="text-muted-foreground">
                    {new Date(event.start_at).toLocaleString('ko-KR')}
                  </div>
                </div>
                {event.signup_url ? (
                  <a className="underline" target="_blank" rel="noreferrer noopener" href={event.signup_url}>
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
