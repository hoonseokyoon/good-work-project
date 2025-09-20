import type { Metadata } from "next"
import { sb } from "@/lib/supabase-server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import NewsCard from "@/components/news-card"

export const metadata: Metadata = {
  title: "뉴스 — 활동 소식",
  description: "수도원과 수녀원의 활동과 프로그램을 카드뉴스 형식으로 만나보세요."
}

export const revalidate = 1800

export default async function NewsPage() {
  const { data: articles = [] } = await sb().from("news").select("*").order("published_at", { ascending: false }).limit(24)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">최근 소식</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          수도원·수녀원의 활동, 봉사 후기, 제품 출시 등 다양한 이야기를 카드 뉴스로 전달합니다.
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {articles.map((article: any) => (
          <NewsCard key={article.id} item={article} />
        ))}
      </div>
    </div>
  )
}
