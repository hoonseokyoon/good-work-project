"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const orderOptions = [
  { value: "", label: "전체" },
  { value: "benedictine", label: "베네딕도회" },
  { value: "carmelite", label: "카르멜회" },
  { value: "franciscan", label: "프란치스코회" }
]

export default function SearchFilters({ className }: { className?: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [search, setSearch] = useState(searchParams?.get("q") ?? "")

  useEffect(() => {
    setSearch(searchParams?.get("q") ?? "")
  }, [searchParams])

  const orderValue = useMemo(() => searchParams?.get("order") ?? "", [searchParams])

  const updateRoute = useCallback(
    (nextParams: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams?.toString() ?? "")

      Object.entries(nextParams).forEach(([key, value]) => {
        if (value && value.length) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      })

      const query = params.toString()
      router.push(query ? `/map?${query}` : "/map")
    },
    [router, searchParams]
  )

  return (
    <div className={cn("flex flex-wrap items-center gap-3 rounded-2xl border bg-card/80 p-4 shadow-sm", className)}>
      <div className="flex w-full flex-1 flex-wrap gap-3 sm:w-auto sm:flex-none">
        <label className="flex w-full items-center gap-2 text-sm text-muted-foreground sm:w-72">
          <span className="sr-only">이름 또는 주소 검색</span>
          <Input
            placeholder="이름 또는 주소 검색"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                updateRoute({ q: event.currentTarget.value })
              }
            }}
          />
        </label>
        <Button
          type="button"
          variant="secondary"
          className="rounded-full"
          onClick={() => updateRoute({ q: search })}
        >
          검색
        </Button>
      </div>
      <Select
        value={orderValue}
        onValueChange={(value) => {
          updateRoute({ order: value })
        }}
      >
        <SelectTrigger className="w-full rounded-full sm:w-56">
          <SelectValue placeholder="수도회 구분" />
        </SelectTrigger>
        <SelectContent>
          {orderOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
