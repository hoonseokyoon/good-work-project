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

export function normalizeDonationMethods(donation?: DonationInfo | null): DonationMethod[] {
  if (!donation) return []

  const normalized: DonationMethod[] = []

  if (Array.isArray(donation.methods)) {
    for (const method of donation.methods) {
      if (!method || typeof method !== 'object') continue
      if (method.type === 'bank_account') {
        const bankMethod: BankAccountDonationMethod = {
          type: 'bank_account',
          bank: method.bank ?? null,
          holder: method.holder ?? null,
          number: method.number ?? null,
          description: method.description ?? null
        }
        if (hasContent(bankMethod)) normalized.push(bankMethod)
      } else if (method.type === 'link' && method.url) {
        normalized.push({
          type: 'link',
          url: method.url,
          label: method.label ?? null
        })
      } else if (method.type === 'custom' && method.value) {
        normalized.push({
          type: 'custom',
          value: method.value,
          label: method.label ?? null
        })
      }
    }
  }

  if (donation.account) {
    normalized.push({
      type: 'bank_account',
      number: donation.account
    })
  }

  if (donation.page_url) {
    const alreadyHasLink = normalized.some(
      (method) => method.type === 'link' && method.url === donation.page_url
    )

    if (!alreadyHasLink) {
      normalized.push({
        type: 'link',
        url: donation.page_url,
        label: donation.note ? undefined : '후원 페이지'
      })
    }
  }

  return normalized.filter(hasContent)
}

export function hasDonationDetails(donation?: DonationInfo | null): boolean {
  return normalizeDonationMethods(donation).length > 0
}
