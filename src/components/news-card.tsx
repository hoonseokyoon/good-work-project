import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export type NewsItem = {
  id: number | string
  title: string
  image_url?: string | null
  published_at: string
  source_name?: string | null
  source_url: string
  tags?: string[] | null
}

type Props = {
  item: NewsItem
}

export default function NewsCard({ item }: Props) {
  return (
    <a
      href={item.source_url}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`${item.title} 기사 새 창 열기`}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-2xl"
    >
      <Card className="h-full overflow-hidden transition hover:shadow-md">
        {item.image_url ? (
          <div className="relative h-40 w-full">
            <Image alt={item.title} src={item.image_url} fill className="object-cover" />
          </div>
        ) : null}
        <CardContent className="space-y-2 p-4">
          <div className="line-clamp-2 font-medium">{item.title}</div>
          <div className="text-xs text-muted-foreground">
            {new Date(item.published_at).toLocaleDateString('ko-KR')}
          </div>
          <div className="flex flex-wrap gap-1">
            {item.tags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-full">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">출처: {item.source_name ?? '제공처 미상'}</CardFooter>
      </Card>
    </a>
  )
}
