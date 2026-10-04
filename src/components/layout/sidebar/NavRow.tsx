import { useLayoutEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import type { NavItem } from '@/config/navigation'
import { gsap, reducedMotion } from '@/lib/gsap'
import { Tooltip } from '@/components/ui/Tooltip'
import { CountBadge } from './CountBadge'
import { cn } from '@/lib/cn'

function RowInner({ item, isActive, expanded, badge }: { item: NavItem; isActive: boolean; expanded: boolean; badge?: number }) {
  const tile = useRef<HTMLSpanElement>(null)
  const wasActive = useRef(isActive)
  const Icon = item.icon

  // Pop the icon tile when this row becomes the active page.
  useLayoutEffect(() => {
    if (isActive && !wasActive.current && tile.current && !reducedMotion()) {
      gsap.fromTo(tile.current, { scale: 0.75, rotate: -12 }, { scale: 1, rotate: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)' })
    }
    wasActive.current = isActive
  }, [isActive])

  return (
    <>
      <span
        ref={tile}
        className={cn(
          'relative flex size-7 shrink-0 items-center justify-center rounded-[9px] transition-[background-color,color,box-shadow] duration-300',
          isActive
            ? 'bg-primary/15 text-primary shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_35%,transparent),0_0_16px_-4px_var(--primary)]'
            : 'text-faint group-hover/row:bg-surface-3 group-hover/row:text-fg',
        )}
      >
        <Icon className="size-[17px] transition-transform duration-300 group-hover/row:scale-110" strokeWidth={isActive ? 2.2 : 1.9} />
        {!!badge && (
          <span
            className={cn(
              'absolute -top-0.5 -right-0.5 size-2 rounded-full ring-2 ring-[var(--surface)] transition-[opacity,transform] duration-300',
              item.badgeTone === 'alert' ? 'bg-accent' : 'bg-primary',
              expanded ? 'scale-0 opacity-0' : 'scale-100 opacity-100',
            )}
          />
        )}
      </span>
      <span
        className={cn(
          'ml-2.5 min-w-0 flex-1 truncate text-[13.5px] font-medium whitespace-nowrap transition-[opacity,transform] duration-300',
          expanded ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-0',
        )}
      >
        {item.label}
      </span>
      <span className={cn('flex shrink-0 items-center gap-1.5 transition-opacity duration-200', expanded ? 'opacity-100' : 'opacity-0')}>
        {item.isNew && <span className="new-tag">New</span>}
        {badge ? (
          <CountBadge value={badge} tone={item.badgeTone} active={isActive} />
        ) : (
          item.hotkey && (
            <span className="hidden items-center gap-0.5 opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 lg:flex">
              <kbd className="kbd !min-w-0 !px-1 !py-0.5 !text-[9.5px]">G</kbd>
              <kbd className="kbd !min-w-0 !px-1 !py-0.5 !text-[9.5px]">{item.hotkey}</kbd>
            </span>
          )
        )}
      </span>
    </>
  )
}

/** One navigation row. In the collapsed rail it shows a rich tooltip. */
export function NavRow({ item, expanded, badge, onNavigate }: { item: NavItem; expanded: boolean; badge?: number; onNavigate?: () => void }) {
  const link = (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      data-row
      data-nav={item.id}
      onClick={onNavigate}
      aria-label={expanded ? undefined : item.label}
      className={({ isActive }) =>
        cn(
          'group/row relative z-[1] flex h-9 w-full items-center rounded-[10px] pr-2 pl-[10px] outline-none transition-colors duration-200',
          'focus-visible:ring-2 focus-visible:ring-primary/60',
          isActive ? 'text-fg' : 'text-muted hover:text-fg',
        )
      }
    >
      {({ isActive }) => <RowInner item={item} isActive={isActive} expanded={expanded} badge={badge} />}
    </NavLink>
  )
  if (expanded) return link
  return (
    <Tooltip
      side="right"
      className="flex w-full"
      content={
        <span className="flex items-center gap-2.5">
          <span>
            <span className="block text-[12.5px] font-semibold text-fg">{item.label}</span>
            {item.description && <span className="block text-[11px] font-normal text-faint">{item.description}</span>}
          </span>
          {badge ? <CountBadge value={badge} tone={item.badgeTone} /> : null}
          {item.hotkey && <kbd className="kbd">G {item.hotkey}</kbd>}
        </span>
      }
    >
      {link}
    </Tooltip>
  )
}
