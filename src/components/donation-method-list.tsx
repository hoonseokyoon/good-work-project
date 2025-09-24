import { DonationMethod } from '@/lib/donation'
import { cn } from '@/lib/utils'

type DonationMethodListProps = {
  methods: DonationMethod[]
  className?: string
}

export default function DonationMethodList({ methods, className }: DonationMethodListProps) {
  if (!methods.length) return null

  return (
    <div className={cn('space-y-2 text-sm', className)}>
      {methods.map((method, index) => {
        const key = `${method.type}-${index}`

        switch (method.type) {
          case 'bank_account': {
            return (
              <div key={key} className="space-y-1">
                {method.bank ? (
                  <div>
                    은행: <span className="font-medium">{method.bank}</span>
                  </div>
                ) : null}
                {method.holder ? (
                  <div>
                    예금주: <span className="font-medium">{method.holder}</span>
                  </div>
                ) : null}
                {method.number ? (
                  <div>
                    계좌번호: <span className="font-semibold tracking-wide">{method.number}</span>
                  </div>
                ) : null}
                {method.description ? <p className="text-muted-foreground">{method.description}</p> : null}
              </div>
            )
          }
          case 'link': {
            return (
              <a
                key={key}
                className="inline-flex items-center gap-1 font-medium underline"
                href={method.url}
                target="_blank"
                rel="noreferrer noopener"
              >
                {method.label ?? '후원 링크'}
                <span aria-hidden>↗</span>
              </a>
            )
          }
          case 'custom': {
            return (
              <div key={key}>
                {method.label ? (
                  <>
                    {method.label}: <span className="font-medium">{method.value}</span>
                  </>
                ) : (
                  <span className="font-medium">{method.value}</span>
                )}
              </div>
            )
          }
          default:
            return null
        }
      })}
    </div>
  )
}
