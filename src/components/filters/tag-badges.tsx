'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Tag = { label: string; value: string };

type Props = {
  tags: Tag[];
  active: string[];
  onToggle: (value: string) => void;
};

export default function TagBadges({ tags, active, onToggle }: Props) {
  if (!tags.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const isActive = active.includes(tag.value);
        return (
          <button
            key={tag.value}
            type="button"
            onClick={() => onToggle(tag.value)}
            className="focus-visible:outline-none"
            aria-pressed={isActive}
            aria-label={`${tag.label} ${isActive ? '선택됨' : '선택하기'}`}
          >
            <Badge
              variant={isActive ? 'default' : 'secondary'}
              className={cn('cursor-pointer rounded-full px-3 py-1 text-xs shadow-sm transition', {
                'hover:shadow-md': true
              })}
            >
              {tag.label}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
