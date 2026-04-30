import type { SVGProps } from 'react'
import { twMerge } from 'tailwind-merge'

export default function DashboardIcon({ className, ...props }: Readonly<SVGProps<SVGSVGElement>>) {
  return (
    <svg
      className={twMerge('h-6 w-6', className)}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      fill="currentColor"
      {...props}
    >
      <path d="M520-600v-240h320v240H520ZM120-440v-400h320v400H120Zm400 320v-400h320v400H520Zm-400 0v-240h320v240H120Zm80-400h160v-240H200v240Zm400 320h160v-240H600v240Zm0-480h160v-80H600v80ZM200-200h160v-80H200v80Zm160-320Zm240-160Zm0 240ZM360-280Z" />
    </svg>
  )
}
