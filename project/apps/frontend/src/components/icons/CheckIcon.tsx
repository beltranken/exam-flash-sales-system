import type { SVGProps } from 'react'
import { twMerge } from 'tailwind-merge'

export default function CheckIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={twMerge('h-6 w-6 text-green-600', className)}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M5 11.917 9.724 16.5 19 7.5"
      />
    </svg>
  )
}
