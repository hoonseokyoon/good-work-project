export type BankAccountDonationMethod = {
  type: 'bank_account'
  bank?: string | null
  holder?: string | null
  number?: string | null
  description?: string | null
}

export type LinkDonationMethod = {
  type: 'link'
  label?: string | null
  url: string
}

export type CustomDonationMethod = {
  type: 'custom'
  label?: string | null
  value: string
}

export type DonationMethod = BankAccountDonationMethod | LinkDonationMethod | CustomDonationMethod

export type DonationInfo = {
  methods?: DonationMethod[] | null
  account?: string | null
  page_url?: string | null
  note?: string | null
}

function isBankAccountMethod(method: DonationMethod): method is BankAccountDonationMethod {
  return method.type === 'bank_account'
}

function isLinkMethod(method: DonationMethod): method is LinkDonationMethod {
  return method.type === 'link'
}

function hasContent(method: DonationMethod): boolean {
  if (isBankAccountMethod(method)) {
    return Boolean(method.bank || method.holder || method.number || method.description)
  }

  if (isLinkMethod(method)) {
    return Boolean(method.url)
  }

  return Boolean(method.value)
}

type DonationLike = DonationInfo | string | Record<string, unknown> | null | undefined

function coerceDonation(donation: DonationLike): DonationInfo | null {
  if (!donation) return null

  if (typeof donation === 'string') {
    try {
      const parsed = JSON.parse(donation)
      if (parsed && typeof parsed === 'object') {
        return parsed as DonationInfo
      }
      return null
    } catch (error) {
      console.error('Failed to parse donation string', error)
      return null
    }
  }

  if (typeof donation === 'object') {
    return donation as DonationInfo
  }

  return null
}

function sanitizeString(value?: string | null): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length ? trimmed : undefined
}

export function normalizeDonationMethods(donationLike?: DonationLike): DonationMethod[] {
  const donation = coerceDonation(donationLike)
  if (!donation) return []

  const normalized: DonationMethod[] = []

  if (Array.isArray(donation.methods)) {
    for (const method of donation.methods) {
      if (!method || typeof method !== 'object') continue
      if (method.type === 'bank_account') {
        const bankMethod: BankAccountDonationMethod = {
          type: 'bank_account',
          bank: sanitizeString(method.bank ?? undefined) ?? null,
          holder: sanitizeString(method.holder ?? undefined) ?? null,
          number: sanitizeString(method.number ?? undefined) ?? null,
          description: sanitizeString(method.description ?? undefined) ?? null
        }
        if (hasContent(bankMethod)) normalized.push(bankMethod)
      } else if (method.type === 'link') {
        const url = sanitizeString(method.url ?? undefined)
        if (!url) continue
        normalized.push({
          type: 'link',
          url,
          label: sanitizeString(method.label ?? undefined) ?? null
        })
      } else if (method.type === 'custom') {
        const value = sanitizeString(method.value ?? undefined)
        if (!value) continue
        normalized.push({
          type: 'custom',
          value,
          label: sanitizeString(method.label ?? undefined) ?? null
        })
      }
    }
  }

  const account = sanitizeString(donation.account ?? undefined)
  if (account) {
    normalized.push({
      type: 'bank_account',
      number: account
    })
  }

  const pageUrl =
    sanitizeString((donation as DonationInfo & { pageUrl?: string }).page_url ?? undefined) ??
    sanitizeString((donation as DonationInfo & { pageUrl?: string }).pageUrl ?? undefined)

  if (pageUrl) {
    const alreadyHasLink = normalized.some(
      (method) => method.type === 'link' && method.url === pageUrl
    )

    if (!alreadyHasLink) {
      normalized.push({
        type: 'link',
        url: pageUrl,
        label: sanitizeString(donation.note ?? undefined) ? undefined : '후원 페이지'
      })
    }
  }

  return normalized.filter(hasContent)
}

export function hasDonationDetails(donation?: DonationInfo | null): boolean {
  return normalizeDonationMethods(donation).length > 0
}
