'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import TagBadges from '@/components/filters/tag-badges'

const orders = [
  { label: '이름 순', value: 'name' },
  { label: '최근 업데이트', value: 'updated_at' }
]

const tags = [
  { label: '베네딕도회', value: 'benedictine' },
  { label: '카르멜회', value: 'carmelite' },
  { label: '프란치스코회', value: 'franciscan' }
]

export default function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const selectedOrder = searchParams.get('order') ?? 'default'
  const activeTags = searchParams.getAll('tag')

  const applyFilters = (newParams: URLSearchParams) => {
    router.push(`/map?${newParams.toString()}`)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const params = new URLSearchParams(Array.from(searchParams.entries()))
    if (search) {
      params.set('q', search)
    } else {
      params.delete('q')
    }
    applyFilters(params)
  }

  const handleOrderChange = (value: string) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()))
    if (value && value !== 'default') {
      params.set('order', value)
    } else {
      params.delete('order')
    }
    applyFilters(params)
  }

  const toggleTag = (value: string) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()))
    const current = new Set(params.getAll('tag'))
    if (current.has(value)) {
      current.delete(value)
    } else {
      current.add(value)
    }
    params.delete('tag')
    current.forEach((tag) => params.append('tag', tag))
    applyFilters(params)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border bg-card/90 p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
        <label className="flex w-full flex-1 flex-col text-sm font-medium">
          <span className="sr-only">이름 혹은 주소로 검색</span>
          <Input
            placeholder="이름이나 주소를 입력하세요"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full"
          />
        </label>
        <Select value={selectedOrder} onValueChange={handleOrderChange}>
          <SelectTrigger className="w-full lg:w-52">
            <SelectValue placeholder="정렬 기준" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">기본</SelectItem>
            {orders.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button type="submit" className="sr-only">
          검색
        </button>
      </div>
      <TagBadges tags={tags} active={activeTags} onToggle={toggleTag} />
    </form>
  )
}
