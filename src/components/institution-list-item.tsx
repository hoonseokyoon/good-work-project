import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Institution = {
  slug: string
  name: string
  type?: string | null
  address?: string | null
}

type Props = {
  item: Institution
}

export default function InstitutionListItem({ item }: Props) {
  return (
    <Link
      href={`/institutions/${item.slug}`}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-2xl"
    >
      <Card className={cn('transition hover:shadow-md')}> 
        <CardHeader className="py-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <span>{item.name}</span>
            {item.type ? <Badge variant="secondary">{item.type}</Badge> : null}
          </CardTitle>
        </CardHeader>
        <CardContent className="-mt-2 pb-3 text-sm text-muted-foreground">
          {item.address ?? '주소 정보가 준비 중입니다.'}
        </CardContent>
      </Card>
    </Link>
  )
}
