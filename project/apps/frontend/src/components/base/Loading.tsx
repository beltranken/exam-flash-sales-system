import { Spinner } from 'flowbite-react'
import { twMerge } from 'tailwind-merge'

interface LoadingProps {
  className?: string
}

export default function Loading({ className }: Readonly<LoadingProps>) {
  return (
    <div className={twMerge('flex items-center justify-center py-20', className)}>
      <Spinner />
    </div>
  )
}
