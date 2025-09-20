import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ContributionCardProps {
  name: string
  description?: string
  ctaLabel?: string
  href?: string
  meta?: string
}

export default function ContributionCard({ name, description, ctaLabel = "자세히 보기", href, meta }: ContributionCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{name}</CardTitle>
        {meta ? <p className="text-xs text-muted-foreground">{meta}</p> : null}
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        {description ? <p>{description}</p> : null}
        {href ? (
          <Button asChild size="sm" variant="secondary" className="rounded-full">
            <a href={href} target="_blank" rel="noreferrer noopener" aria-label={`${name} 관련 링크 새 창 열기`}>
              {ctaLabel}
            </a>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}
