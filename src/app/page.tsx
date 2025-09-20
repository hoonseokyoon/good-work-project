import Link from 'next/link'
import { ArrowRight, Compass, HeartHandshake, Newspaper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-primary/15 via-primary/10 to-primary/20 p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4 max-w-2xl">
            <p className="text-sm font-semibold text-primary">Monastic Commons</p>
            <h1 className="text-3xl font-semibold leading-tight text-balance md:text-4xl">
              수도원·수녀원의 이야기와 정보를 한곳에서 발견해 보세요
            </h1>
            <p className="text-base text-muted-foreground">
              전국에 흩어져 있는 공동체들의 미사, 후원, 공방 제품, 봉사 프로그램까지. 누구나 방문해 더 깊은 연결을 만들 수 있습니다.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/map">
                  찾기 페이지로 이동하기
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/contribute">기여 방법 살펴보기</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border bg-background/80 p-6 shadow-sm md:w-80">
            <h2 className="text-lg font-semibold">오늘의 추천 일정</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              가까운 수도원 방문이나 묵주 제작 워크숍 등 참여할 수 있는 프로그램을 매일 추천합니다.
            </p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-xl border bg-card p-3 shadow-sm">
                <div className="font-medium">침묵 피정</div>
                <p className="text-muted-foreground">이번 주 토요일 · 서울 베네딕도회</p>
              </div>
              <div className="rounded-xl border bg-card p-3 shadow-sm">
                <div className="font-medium">공동 묵주 제작</div>
                <p className="text-muted-foreground">매주 수요일 · 춘천 카르멜 수녀원</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">무엇을 도와드릴까요?</h2>
            <p className="text-sm text-muted-foreground">지도에서 기관을 찾고, 최신 소식을 읽고, 다양한 방식으로 기여해 보세요.</p>
          </div>
          <Button asChild variant="ghost" className="self-start md:self-auto">
            <Link href="/map">
              전체 보기로 이동
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Compass className="h-6 w-6" aria-hidden="true" />
              </div>
              <CardTitle className="text-lg">지도에서 찾기</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-3 text-sm text-muted-foreground">
              <p>지역과 수도회별로 검색하고, 지도 마커를 클릭해 상세 페이지로 이동하세요.</p>
              <Button asChild variant="secondary" size="sm">
                <Link href="/map">찾기 페이지</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Newspaper className="h-6 w-6" aria-hidden="true" />
              </div>
              <CardTitle className="text-lg">뉴스 읽기</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-3 text-sm text-muted-foreground">
              <p>최근 봉사 후기와 활동 소식을 카드 뉴스 형태로 확인하고 주변 사람들과 공유하세요.</p>
              <Button asChild variant="secondary" size="sm">
                <Link href="/news">뉴스 페이지</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <HeartHandshake className="h-6 w-6" aria-hidden="true" />
              </div>
              <CardTitle className="text-lg">기여하기</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-3 text-sm text-muted-foreground">
              <p>후원, 제품 구매, 봉사 신청까지 한 번에 모아두었습니다. 원하는 방식으로 참여해 보세요.</p>
              <Button asChild variant="secondary" size="sm">
                <Link href="/contribute">기여 페이지</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
