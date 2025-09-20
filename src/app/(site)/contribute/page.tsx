import Link from 'next/link'
import ProductCard from '@/components/product-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { sb } from '@/lib/supabase-server'

export const metadata = {
  title: '기여 — 후원/구매/참여',
  description: '후원, 제품 구매, 봉사 참여 등 다양한 방식으로 공동체와 연결됩니다.'
}

type Institution = {
  id: number
  name: string
  slug: string
  donation?: {
    account?: string | null
    page_url?: string | null
  } | null
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

const fallbackInstitutions: Institution[] = [
  {
    id: 1,
    name: '서울 베네딕도회',
    slug: 'seoul-benedictine',
    donation: {
      account: '국민은행 123456-78-901234',
      page_url: '#'
    }
  },
  {
    id: 2,
    name: '춘천 카르멜 수녀원',
    slug: 'chuncheon-carmelite',
    donation: {
      account: '농협 987-65-432109',
      page_url: '#'
    }
  }
]

const fallbackProducts: Product[] = [
  {
    id: 1,
    name: '허브 비누',
    category: '공방',
    unit: '1ea',
    price: 8000,
    image_url: 'https://images.unsplash.com/photo-1525286116112-b59af11adad1?auto=format&fit=crop&w=800&q=80',
    buy_url: '#'
  },
  {
    id: 2,
    name: '라벤더 향초',
    category: '공방',
    unit: '200ml',
    price: 15000,
    image_url: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&w=800&q=80',
    buy_url: '#'
  }
]

const fallbackEvents: Event[] = [
  {
    id: 1,
    title: '지역 어르신 반찬 나눔 봉사',
    start_at: new Date().toISOString(),
    signup_url: '#'
  },
  {
    id: 2,
    title: '성가정 축제 준비 자원봉사',
    start_at: new Date(Date.now() + 86400000).toISOString(),
    signup_url: '#'
  }
]

export default async function ContributePage() {
  let institutions = fallbackInstitutions
  let products = fallbackProducts
  let events = fallbackEvents

  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    const client = sb()
    const [instRes, productRes, eventRes] = await Promise.all([
      client.from('institutions').select<Institution>('id, name, slug, donation').limit(50),
      client.from('products').select<Product>('id, name, category, unit, price, image_url, buy_url').limit(24),
      client.from('events').select<Event>('id, title, start_at, signup_url').order('start_at').limit(24)
    ])

    if (instRes.data?.length) institutions = instRes.data
    if (productRes.data?.length) products = productRes.data
    if (eventRes.data?.length) events = eventRes.data
  }

  return (
    <Tabs defaultValue="donate" className="space-y-6">
      <TabsList>
        <TabsTrigger value="donate">후원</TabsTrigger>
        <TabsTrigger value="buy">구매</TabsTrigger>
        <TabsTrigger value="volunteer">참여</TabsTrigger>
      </TabsList>

      <TabsContent value="donate">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {institutions.map((institution) => (
            <Card key={institution.id} className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{institution.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {institution.donation?.account ? (
                  <div>
                    계좌: <span className="font-semibold">{institution.donation.account}</span>
                  </div>
                ) : (
                  <p className="text-muted-foreground">후원 계좌 정보가 준비 중입니다.</p>
                )}
                {institution.donation?.page_url ? (
                  <a className="underline" href={institution.donation.page_url} target="_blank" rel="noreferrer noopener">
                    후원 페이지
                  </a>
                ) : null}
                <Button asChild size="sm" variant="secondary">
                  <Link href={`/institutions/${institution.slug}`}>기관 페이지</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="buy">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} item={product} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="volunteer">
        <ul className="space-y-2 text-sm">
          {events.map((event) => (
            <li key={event.id} className="flex items-center justify-between rounded-2xl border p-3">
              <div>
                <div className="font-medium">{event.title}</div>
                <div className="text-muted-foreground">{new Date(event.start_at).toLocaleString('ko-KR')}</div>
              </div>
              {event.signup_url ? (
                <a className="underline" href={event.signup_url} target="_blank" rel="noreferrer noopener">
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
