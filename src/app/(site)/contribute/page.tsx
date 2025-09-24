import ProductCard from '@/components/product-card'
import DonationInstitutionsList from '@/components/donation-institutions-list'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { sb } from '@/lib/supabase-server'
import { DonationInfo } from '@/lib/donation'

export const metadata = {
  title: '기여 — 후원/구매/참여',
  description: '후원, 제품 구매, 봉사 참여 등 다양한 방식으로 공동체와 연결됩니다.'
}

type Institution = {
  id: number
  name: string
  slug: string
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

const fallbackInstitutions: Institution[] = [
  {
    id: 1,
    name: '서울 베네딕도회',
    slug: 'seoul-benedictine',
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
          label: '온라인 후원 페이지',
          url: '#'
        }
      ]
    }
  },
  {
    id: 2,
    name: '춘천 카르멜 수녀원',
    slug: 'chuncheon-carmelite',
    donation: {
      methods: [
        {
          type: 'bank_account',
          bank: '농협',
          holder: '춘천 카르멜 수녀원',
          number: '987-65-432109',
          description: '정기 후원 계좌'
        }
      ]
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
      client.from('institutions').select('id, name, slug, donation').limit(50),
      client.from('products').select('id, name, category, unit, price, image_url, buy_url').limit(24),
      client.from('events').select('id, title, start_at, signup_url').order('start_at').limit(24)
    ])

    if (instRes.data?.length) institutions = instRes.data as Institution[]
    if (productRes.data?.length) products = productRes.data as Product[]
    if (eventRes.data?.length) events = eventRes.data as Event[]
  }

  return (
    <Tabs defaultValue="donate" className="space-y-6">
      <TabsList>
        <TabsTrigger value="donate">후원</TabsTrigger>
        <TabsTrigger value="buy">구매</TabsTrigger>
        <TabsTrigger value="volunteer">참여</TabsTrigger>
      </TabsList>

      <TabsContent value="donate">
        <DonationInstitutionsList institutions={institutions} />
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
