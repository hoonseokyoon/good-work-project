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

type RawDonation =
  | DonationInfo
  | string
  | null
  | undefined
  | Record<string, unknown>

function parseDonation(rawDonation: RawDonation): DonationInfo | null {
  if (!rawDonation) return null

  if (typeof rawDonation === 'string') {
    try {
      return parseDonation(JSON.parse(rawDonation))
    } catch {
      return null
    }
  }

  if (typeof rawDonation !== 'object') return null

  const donationObject = rawDonation as Record<string, unknown>

  const methods = Array.isArray(donationObject.methods) ? donationObject.methods : undefined

  const account =
    typeof donationObject.account === 'string'
      ? donationObject.account
      : typeof donationObject.number === 'string'
        ? donationObject.number
        : null

  const pageUrl = (() => {
    if (typeof donationObject.page_url === 'string') return donationObject.page_url
    if (typeof donationObject.pageUrl === 'string') return donationObject.pageUrl
    if (typeof donationObject.pageURL === 'string') return donationObject.pageURL
    if (typeof donationObject.url === 'string') return donationObject.url
    return null
  })()

  const note =
    typeof donationObject.note === 'string'
      ? donationObject.note
      : typeof donationObject.description === 'string'
        ? donationObject.description
        : null

  const hasLegacyBankInfo =
    typeof donationObject.bank === 'string' ||
    typeof donationObject.holder === 'string' ||
    typeof donationObject.account === 'string' ||
    typeof donationObject.number === 'string'

  const normalizedMethods = methods as DonationMethod[] | undefined

  return {
    methods:
      normalizedMethods ??
      (hasLegacyBankInfo
        ? [
            {
              type: 'bank_account',
              bank: typeof donationObject.bank === 'string' ? donationObject.bank : null,
              holder: typeof donationObject.holder === 'string' ? donationObject.holder : null,
              number: account,
              description: note
            } satisfies BankAccountDonationMethod
          ]
        : undefined),
    account,
    page_url: pageUrl,
    note
  }
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

export function normalizeDonationMethods(rawDonation?: RawDonation): DonationMethod[] {
  const donation = parseDonation(rawDonation)
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

export function hasDonationDetails(donation?: RawDonation): boolean {
  return normalizeDonationMethods(donation).length > 0
}
