'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') ?? '')

  const applyFilters = (newParams: URLSearchParams) => {
    newParams.delete('page')
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

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border bg-card/90 p-4 shadow-sm"
    >
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
        <Button type="submit" className="w-full lg:w-32">
          검색
        </Button>
      </div>
    </form>
  )
}
