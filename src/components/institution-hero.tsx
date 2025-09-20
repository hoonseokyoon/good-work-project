import { Badge } from '@/components/ui/badge'

export type InstitutionHeroProps = {
  name: string
  type?: string | null
  description?: string | null
}

export default function InstitutionHero({ name, type, description }: InstitutionHeroProps) {
  return (
    <section className="space-y-3 rounded-3xl border bg-card/95 p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">{name}</h1>
        {type ? <Badge variant="secondary">{type}</Badge> : null}
      </div>
      {description ? <p className="text-muted-foreground whitespace-pre-line text-sm leading-relaxed">{description}</p> : null}
    </section>
  )
}
