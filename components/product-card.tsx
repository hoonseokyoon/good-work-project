import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ProductCardProps {
  item: {
    id?: number
    name: string
    category?: string
    unit?: string
    price?: number
    image_url?: string
    buy_url?: string
  }
}

export default function ProductCard({ item }: ProductCardProps) {
  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="space-y-1.5 pb-2">
        <CardTitle className="text-base">{item.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {item.image_url ? (
          <div className="relative h-40 w-full overflow-hidden rounded-xl">
            <Image src={item.image_url} alt={item.name} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
          </div>
        ) : null}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{item.category ?? "상품"}</span>
          <span>{item.unit}</span>
        </div>
        {typeof item.price === "number" ? (
          <div className="text-lg font-semibold">₩{item.price.toLocaleString()}</div>
        ) : null}
      </CardContent>
      {item.buy_url ? (
        <CardFooter className="pt-0">
          <Button asChild size="sm" className="rounded-full">
            <a href={item.buy_url} target="_blank" rel="noreferrer noopener" aria-label={`${item.name} 구매 페이지 새 창 열기`}>
              구매하기
            </a>
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  )
}
