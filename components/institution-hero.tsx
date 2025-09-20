import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface InstitutionHeroProps {
  name: string
  type?: string
  location?: string
  summary?: string
}

export default function InstitutionHero({ name, type, location, summary }: InstitutionHeroProps) {
  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{name}</h1>
            {type ? <Badge variant="secondary">{type}</Badge> : null}
          </div>
          {summary ? <p className="text-sm text-muted-foreground">{summary}</p> : null}
        </div>
        {location ? (
          <div className="rounded-xl bg-muted px-4 py-2 text-sm text-muted-foreground">
            {location}
          </div>
        ) : null}
      </div>
      <Separator className="my-5" />
      <p className="text-sm leading-relaxed text-muted-foreground">
        수도회와 수도원, 수녀원에 관한 깊이 있는 이야기를 모아 누구나 쉽게 접근할 수 있도록 돕습니다.
      </p>
    </section>
  )
}
