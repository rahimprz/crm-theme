import type { LogoShape } from '@/data/types'
import { cn } from '@/lib/cn'

/** Geometric logo marks so every sample company has a recognizable identity. */
const marks: Record<LogoShape, React.ReactNode> = {
  hex: <path fillRule="evenodd" d="M12 2.5 20.5 7.4v9.2L12 21.5 3.5 16.6V7.4L12 2.5Zm0 5L7.8 9.9v4.2L12 16.5l4.2-2.4V9.9L12 7.5Z" />,
  plus: <path d="M9.5 3h5v6.5H21v5h-6.5V21h-5v-6.5H3v-5h6.5V3Z" />,
  chevron: <path d="M3 5.5 10.5 12 3 18.5v-4L6 12 3 9.5v-4Zm8 0L18.5 12 11 18.5v-4L14 12l-3-2.5v-4Z" />,
  wave: <path d="M2 8.5c2.5-2.6 5-2.6 7.5 0s5 2.6 7.5 0c1.7-1.8 3.3-2.3 5-1.5v3.3c-1.7-.8-3.3-.3-5 1.5-2.5 2.6-5 2.6-7.5 0s-5-2.6-7.5 0V8.5Zm0 6c2.5-2.6 5-2.6 7.5 0s5 2.6 7.5 0c1.7-1.8 3.3-2.3 5-1.5v3.3c-1.7-.8-3.3-.3-5 1.5-2.5 2.6-5 2.6-7.5 0s-5-2.6-7.5 0v-3.3Z" />,
  sun: <path d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm-1-5h2v3h-2V2Zm0 17h2v3h-2v-3ZM2 11h3v2H2v-2Zm17 0h3v2h-3v-2ZM4.2 5.6l1.4-1.4 2.1 2.1-1.4 1.4-2.1-2.1Zm12.1 12.1 1.4-1.4 2.1 2.1-1.4 1.4-2.1-2.1ZM4.2 18.4l2.1-2.1 1.4 1.4-2.1 2.1-1.4-1.4ZM16.3 6.3l2.1-2.1 1.4 1.4-2.1 2.1-1.4-1.4Z" />,
  peak: <path d="M2 20 9 6.5l4.2 7.4 2.8-4.4L22 20H2Z" />,
  orbit: <path fillRule="evenodd" d="M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm9.4-4.6c1.6 1.6-.5 6.3-4.8 10.5-4.3 4.3-9 6.4-10.5 4.8-.9-.9-.6-2.8.6-5.1l1.7 1c-.7 1.5-.9 2.4-.8 2.6.6.4 3.9-.8 7.6-4.5 3.7-3.7 4.9-7 4.5-7.6-.2-.2-1.2 0-2.6.8l-1-1.7c2.4-1.3 4.3-1.6 5.3-.8Z" />,
  ring: <path fillRule="evenodd" d="M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Zm0 4a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm6.5-4.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z" />,
  diamond: <path fillRule="evenodd" d="M12 2 22 12 12 22 2 12 12 2Zm0 5.5L7.5 12l4.5 4.5 4.5-4.5L12 7.5Z" />,
  leaf: <path d="M20.5 3.5C9.5 3.5 4 8.6 4 17.3c0 1.1.1 2.1.4 3.2l1.9-.6c-.2-.8-.3-1.6-.3-2.4 4.1-4.7 7.8-7.1 11.2-8-3.9 2-6.9 4.6-9 8 7.6.3 12.3-4.4 12.3-14Z" />,
  stack: <path d="M12 2 22 7l-10 5L2 7l10-5Zm-7.6 8.6L12 14.4l7.6-3.8L22 11.8l-10 5-10-5 2.4-1.2Zm0 4.8L12 19.2l7.6-3.8L22 16.6l-10 5-10-5 2.4-1.2Z" />,
  grid: <path d="M3 3h8v8H3V3Zm10 0h8v8h-8V3ZM3 13h8v8H3v-8Zm10 4a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" />,
  spark: <path d="M12 2c.9 5.4 3.6 8.1 10 10-6.4 1.9-9.1 4.6-10 10-.9-5.4-3.6-8.1-10-10 6.4-1.9 9.1-4.6 10-10Z" />,
  blocks: <path d="M3 13h8v8H3v-8Zm0-10h8v8H3V3Zm10 10h8v8h-8v-8Z" />,
  drop: <path d="M12 2.5s7 7.6 7 12.5a7 7 0 1 1-14 0c0-4.9 7-12.5 7-12.5Z" />,
  mosaic: <path d="M3 3h9L3 12V3Zm9 0h9v9L12 3ZM3 12l9 9H3v-9Zm9 0 9 9h-9v-9Z" />,
}

const sizes = { xs: 'size-5 rounded-[6px] [&_svg]:size-3', sm: 'size-7 rounded-lg [&_svg]:size-4', md: 'size-9 rounded-[10px] [&_svg]:size-5', lg: 'size-12 rounded-xl [&_svg]:size-6', xl: 'size-16 rounded-2xl [&_svg]:size-8' } as const

export function CompanyLogo({
  shape,
  color,
  size = 'md',
  className,
}: {
  shape: LogoShape
  color: string
  size?: keyof typeof sizes
  className?: string
}) {
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center', sizes[size], className)}
      style={{
        background: `linear-gradient(145deg, color-mix(in oklab, ${color} 26%, var(--surface-2)), color-mix(in oklab, ${color} 8%, var(--surface-2)))`,
        boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${color} 30%, transparent)`,
      }}
    >
      <svg viewBox="0 0 24 24" style={{ fill: color }} aria-hidden>
        {marks[shape]}
      </svg>
    </span>
  )
}
