import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export type Product = {
  id: number | string
  name: string
  category?: string | null
  unit?: string | null
  price?: number | null
  image_url?: string | null
  buy_url?: string | null
}

type Props = {
  item: Product
}

export default function ProductCard({ item }: Props) {
  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="py-3">
        <CardTitle className="text-base">{item.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {item.image_url ? (
          <div className="relative h-40 w-full overflow-hidden rounded-xl">
            <Image src={item.image_url} alt={item.name} fill className="object-cover" />
          </div>
        ) : null}
        <div className="text-sm text-muted-foreground">
          {[item.category, item.unit].filter(Boolean).join(' · ') || '카테고리 정보 없음'}
        </div>
        {item.price ? <div className="text-lg font-semibold">₩{Number(item.price).toLocaleString()}</div> : null}
      </CardContent>
      {item.buy_url ? (
        <CardFooter>
          <Button asChild size="sm">
            <a href={item.buy_url} target="_blank" rel="noreferrer noopener" aria-label={`${item.name} 구매 페이지 새 창 열기`}>
              구매하기
            </a>
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  )
}
