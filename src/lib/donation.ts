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

type DonationRecord = DonationInfo & Record<string, unknown>

function toOptionalString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length ? trimmed : undefined
  }

  return undefined
}

function parseDonation(value: unknown): DonationRecord | null {
  if (!value) return null

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (parsed && typeof parsed === 'object') {
        return parsed as DonationRecord
      }
    } catch {
      return null
    }
  }

  if (typeof value !== 'object') return null

  return value as DonationRecord
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
  const donationObject = parseDonation(donation)
  if (!donationObject) return []

  const normalized: DonationMethod[] = []
  const note = toOptionalString(donationObject.note)

  if (Array.isArray(donationObject.methods)) {
    for (const method of donationObject.methods) {
      if (!method) continue

      if (typeof method === 'string') {
        const url = toOptionalString(method)
        if (url) {
          normalized.push({ type: 'link', url })
        }
        continue
      }

      if (typeof method !== 'object') continue

      if (method.type === 'bank_account') {
        const bankMethod: BankAccountDonationMethod = {
          type: 'bank_account',
          bank: toOptionalString(method.bank) ?? null,
          holder: toOptionalString(method.holder) ?? null,
          number: toOptionalString(method.number) ?? null,
          description: toOptionalString(method.description) ?? null
        }
        if (hasContent(bankMethod)) normalized.push(bankMethod)
      } else if (method.type === 'link') {
        const url = toOptionalString(method.url)
        if (url) {
          const label = toOptionalString(method.label)
          normalized.push(
            label
              ? { type: 'link', url, label }
              : { type: 'link', url }
          )
        }
      } else if (method.type === 'custom') {
        const value = toOptionalString(method.value)
        if (value) {
          const label = toOptionalString(method.label)
          normalized.push(
            label
              ? { type: 'custom', value, label }
              : { type: 'custom', value }
          )
        }
      }
    }
  }

  const accountNumber =
    toOptionalString(donationObject.account) ??
    toOptionalString(donationObject.account_number) ??
    toOptionalString(donationObject.accountNumber)

  const bankName = toOptionalString(donationObject.bank)
  const holderName = toOptionalString(donationObject.holder)
  const accountDescription =
    toOptionalString(donationObject.description) ??
    toOptionalString(donationObject.account_description)

  if (accountNumber) {
    const existingAccount = normalized.find(
      (method) => isBankAccountMethod(method) && method.number === accountNumber
    )

    if (existingAccount && isBankAccountMethod(existingAccount)) {
      if (!existingAccount.bank && bankName) existingAccount.bank = bankName
      if (!existingAccount.holder && holderName) existingAccount.holder = holderName
      if (!existingAccount.description && accountDescription) {
        existingAccount.description = accountDescription
      }
    } else {
      normalized.push({
        type: 'bank_account',
        number: accountNumber,
        bank: bankName ?? null,
        holder: holderName ?? null,
        description: accountDescription ?? null
      })
    }
  }

  const customLinkLabel =
    toOptionalString(donationObject.link_label) ??
    toOptionalString(donationObject.linkLabel)

  const pageUrl =
    toOptionalString(donationObject.page_url) ??
    toOptionalString(donationObject.pageUrl) ??
    toOptionalString(donationObject.url)

  if (pageUrl) {
    const existingLink = normalized.find(
      (method) => isLinkMethod(method) && method.url === pageUrl
    )

    if (existingLink && isLinkMethod(existingLink)) {
      if (!existingLink.label && customLinkLabel) {
        existingLink.label = customLinkLabel
      }
    } else {
      const label = customLinkLabel ?? (note ? undefined : '후원 페이지')
      normalized.push(
        label
          ? { type: 'link', url: pageUrl, label }
          : { type: 'link', url: pageUrl }
      )
    }
  }

  return normalized.filter(hasContent)
}

export function hasDonationDetails(donation?: DonationInfo | null): boolean {
  return normalizeDonationMethods(donation).length > 0
}
