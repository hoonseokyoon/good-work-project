import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export type Contribution = {
  id: number | string
  name: string
  description?: string | null
  actionLabel?: string
  actionUrl?: string | null
  badge?: string | null
}

type Props = {
  item: Contribution
}

export default function ContributionCard({ item }: Props) {
  return (
    <Card className="flex h-full flex-col justify-between">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base">{item.name}</CardTitle>
        {item.badge ? <span className="text-xs font-medium text-primary">{item.badge}</span> : null}
      </CardHeader>
      <CardContent className="flex-1 text-sm text-muted-foreground">
        {item.description ?? '참여 방법을 준비 중입니다.'}
      </CardContent>
      {item.actionUrl ? (
        <CardFooter>
          <Button asChild size="sm" variant="secondary">
            <Link href={item.actionUrl} target="_blank" rel="noreferrer noopener">
              {item.actionLabel ?? '자세히 보기'}
            </Link>
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  )
}
