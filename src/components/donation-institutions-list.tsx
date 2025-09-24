'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import DonationMethodList from '@/components/donation-method-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DonationInfo, normalizeDonationMethods } from '@/lib/donation'

const ITEMS_PER_PAGE = 6

type Institution = {
  id: number | string
  name: string
  slug: string
  donation?: DonationInfo | null
}

type Props = {
  institutions: Institution[]
}

export default function DonationInstitutionsList({ institutions }: Props) {
  const institutionsWithDonation = useMemo(
    () =>
      institutions
        .map((institution) => ({
          ...institution,
          methods: normalizeDonationMethods(institution.donation)
        }))
        .filter((institution) => institution.methods.length > 0),
    [institutions]
  )

  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(institutionsWithDonation.length / ITEMS_PER_PAGE))

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages))
  }, [totalPages])

  const startIndex = (page - 1) * ITEMS_PER_PAGE
  const paginatedInstitutions = institutionsWithDonation.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  if (!institutionsWithDonation.length) {
    return <p className="text-sm text-muted-foreground">현재 표시할 후원 기관이 없습니다.</p>
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedInstitutions.map((institution) => (
          <Card key={institution.id} className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{institution.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <DonationMethodList methods={institution.methods} />
              <Button asChild size="sm" variant="secondary">
                <Link href={`/institutions/${institution.slug}`}>기관 페이지</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 ? (
        <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-muted-foreground">
            총 {institutionsWithDonation.length}곳 중 {startIndex + 1}–
            {Math.min(startIndex + ITEMS_PER_PAGE, institutionsWithDonation.length)} 표시 중
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
            >
              이전
            </Button>
            <span className="tabular-nums">
              {page} / {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
            >
              다음
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
