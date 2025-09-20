import NewsCard from '@/components/news-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { sb } from '@/lib/supabase-server'

export const metadata = {
  title: '뉴스 — 활동 소식',
  description: '수도원·수녀원의 최신 활동과 기쁨의 소식을 카드 뉴스로 만나보세요.'
}

export const revalidate = 1800

type NewsItem = {
  id: number
  title: string
  image_url?: string | null
  published_at: string
  source_name?: string | null
  source_url: string
  tags?: string[] | null
}

const fallbackNews: NewsItem[] = [
  {
    id: 1,
    title: '춘천 카르멜 수녀원, 지역 사회와 함께하는 빵 나눔',
    image_url: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=800&q=80',
    published_at: new Date().toISOString(),
    source_name: 'Monastic Commons',
    source_url: '#',
    tags: ['봉사', '연대']
  },
  {
    id: 2,
    title: '서울 베네딕도회, 여름 청년 피정 참가자 모집',
    image_url: 'https://images.unsplash.com/photo-1517630800677-932d836ab680?auto=format&fit=crop&w=800&q=80',
    published_at: new Date().toISOString(),
    source_name: 'Monastic Commons',
    source_url: '#',
    tags: ['피정']
  }
]

export default async function NewsPage() {
  let newsItems: NewsItem[] = fallbackNews

  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    const { data } = await sb()
      .from('news')
      .select<NewsItem>('id, title, image_url, published_at, source_name, source_url, tags')
      .order('published_at', { ascending: false })
      .limit(24)

    if (data?.length) {
      newsItems = data
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">최근 소식</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            수도원·수녀원의 활동, 봉사 후기, 제품 출시 등을 카드 뉴스로 전달합니다.
          </p>
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {newsItems.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
