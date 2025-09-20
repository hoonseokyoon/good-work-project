import { Badge } from "@/components/ui/badge"

interface TagBadgesProps {
  tags: { label: string; value: string }[]
  onRemove?: (value: string) => void
}

export default function TagBadges({ tags, onRemove }: TagBadgesProps) {
  if (!tags.length) return null

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge
          key={tag.value}
          variant="secondary"
          className="cursor-pointer"
          onClick={() => onRemove?.(tag.value)}
        >
          #{tag.label}
        </Badge>
      ))}
    </div>
  )
}
