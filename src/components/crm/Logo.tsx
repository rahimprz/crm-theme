import { useRef } from 'react'
import { gsap, useGSAP, reducedMotion } from '@/lib/gsap'
import { cn } from '@/lib/cn'
import { brand } from '@/config/app'

/** Volt brand mark. The bolt strikes in on load and re-charges on hover. */
export function Logo({ collapsed, className }: { collapsed?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      if (reducedMotion()) return
      gsap
        .timeline({ delay: 0.15 })
        .fromTo('[data-bolt]', { strokeDashoffset: 60, fillOpacity: 0 }, { strokeDashoffset: 0, duration: 0.8, ease: 'volt' })
        .to('[data-bolt]', { fillOpacity: 1, duration: 0.3 }, '-=0.2')
        .fromTo('[data-flash]', { opacity: 0.9, scale: 0.4 }, { opacity: 0, scale: 1.8, duration: 0.6, ease: 'power2.out' }, '-=0.3')
        .fromTo('[data-word]', { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.5 }, '-=0.5')
    },
    { scope: ref },
  )
  const recharge = () => {
    if (reducedMotion()) return
    gsap.fromTo(ref.current!.querySelector('[data-bolt]'), { strokeDashoffset: 60 }, { strokeDashoffset: 0, duration: 0.6, ease: 'volt' })
  }
  return (
    <div ref={ref} className={cn('flex items-center gap-2.5', className)} onMouseEnter={recharge}>
      <span className="relative flex size-8 shrink-0 items-center justify-center">
        <span data-flash className="absolute inset-0 rounded-[10px] bg-accent opacity-0 blur-md" />
        <svg viewBox="0 0 32 32" className="relative size-8" aria-hidden>
          <defs>
            <linearGradient id="volt-tile" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" style={{ stopColor: 'var(--primary)' }} />
              <stop offset="100%" style={{ stopColor: 'color-mix(in oklab, var(--primary) 55%, black)' }} />
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="9" fill="url(#volt-tile)" />
          <rect x="0.5" y="0.5" width="31" height="31" rx="8.5" fill="none" stroke="rgb(255 255 255 / 0.18)" />
          <path
            data-bolt
            d="M18.2 5 9 18h6.4l-1.8 9L23 13.6h-6.5L18.2 5Z"
            strokeWidth="1.4"
            strokeLinejoin="round"
            strokeDasharray="60"
            style={{ fill: 'var(--accent)', stroke: 'var(--accent)', filter: 'drop-shadow(0 0 4px var(--accent))' }}
          />
        </svg>
      </span>
      <span
        className={cn('font-display text-[19px] font-semibold tracking-[-0.03em] whitespace-nowrap text-fg transition-[opacity,transform] duration-300', collapsed ? '-translate-x-1 opacity-0' : 'opacity-100')}
      >
        <span data-word className="inline-block">
          {brand.name}
          <span className="text-accent">.</span>
        </span>
      </span>
    </div>
  )
}
