import type { SVGProps } from 'react'

export default function LogoIcon(props: Readonly<SVGProps<SVGSVGElement>>) {
  return (
    <svg
      width="1024"
      height="1024"
      viewBox="0 0 1024 1024"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-labelledby="title desc"
      role="img"
      {...props}
    >
      <title>EX Clothing Ecommerce Logo</title>
      <desc>Simple circular EX logo using primary blue #1c64f2.</desc>

      <circle cx="512" cy="512" r="455" fill="#1c64f2" />

      <circle cx="512" cy="512" r="390" fill="none" stroke="#ffffff" strokeWidth="36" />

      <g fill="#ffffff">
        <path d="M262 332H536L579 404H343V467H505V539H343V620H579L536 692H262V332Z" />

        <path d="M610 332H706L762 430L819 332H913L809 510L914 692H818L760 591L701 692H607L713 510L610 332Z" />
      </g>
    </svg>
  )
}
