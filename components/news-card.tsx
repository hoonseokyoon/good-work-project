import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

interface NewsCardProps {
  item: {
    id?: number
    title: string
    published_at: string
    source_name?: string
    source_url: string
    image_url?: string
    tags?: string[]
  }
}

export default function NewsCard({ item }: NewsCardProps) {
  return (
    <a
      href={item.source_url}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`${item.title} 원문 새 창에서 열기`}
      className="focus-ring block"
    >
      <Card className="h-full overflow-hidden transition hover:shadow-md">
        {item.image_url ? (
          <div className="relative h-40 w-full">
            <Image src={item.image_url} alt={item.title} fill className="object-cover" sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw" />
          </div>
        ) : null}
        <CardContent className="space-y-3 p-4">
          <div className="line-clamp-2 text-sm font-medium leading-snug">{item.title}</div>
          <div className="text-xs text-muted-foreground">{formatDate(item.published_at)}</div>
          {item.tags?.length ? (
            <div className="flex flex-wrap gap-1">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardContent>
        <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">{item.source_name ? `출처: ${item.source_name}` : "출처 링크"}</CardFooter>
      </Card>
    </a>
  )
}
