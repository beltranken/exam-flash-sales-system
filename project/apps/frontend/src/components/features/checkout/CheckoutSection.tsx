import type { PropsWithChildren } from 'react'

interface CheckoutSectionProps {
  stepNumber: number
  title: string
}

export default function CheckoutSection({
  stepNumber,
  title,
  children,
}: Readonly<PropsWithChildren<CheckoutSectionProps>>) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="flex h-6 w-6 items-center justify-center rounded-full border">
          <span className="text-xs leading-none font-semibold">{stepNumber}</span>
        </div>

        <span className="text-sm font-semibold tracking-wider uppercase">{title}</span>
      </div>

      {children}
    </div>
  )
}
