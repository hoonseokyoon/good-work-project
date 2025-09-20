import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Institution = {
  name: string
  slug: string
  type?: string
  address?: string
}

type Props = {
  item: Institution
  className?: string
}

export default function InstitutionListItem({ item, className }: Props) {
  return (
    <Link href={`/institutions/${item.slug}`} className={cn("block focus-ring", className)}>
      <Card className="transition hover:shadow-md">
        <CardHeader className="space-y-1.5 pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            {item.name}
            {item.type ? <Badge variant="secondary">{item.type}</Badge> : null}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4 text-sm text-muted-foreground">
          {item.address ?? "주소 정보가 등록되지 않았습니다."}
        </CardContent>
      </Card>
    </Link>
  )
}
