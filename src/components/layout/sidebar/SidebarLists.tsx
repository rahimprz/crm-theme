import { useLocation, useNavigate } from 'react-router-dom'
import { StarOff, MessageCircle } from 'lucide-react'
import { savedViews } from '@/config/navigation'
import { presence } from '@/config/app'
import { useCrm } from '@/store/crm'
import { toast } from '@/store/toast'
import { members } from '@/data/mock'
import { Avatar } from '@/components/ui/Avatar'
import { CompanyLogo } from '@/components/ui/CompanyLogo'
import { Tooltip } from '@/components/ui/Tooltip'
import { SectionHeader } from './SectionHeader'
import { Collapse } from './Collapse'
import { CountBadge } from './CountBadge'
import { cn } from '@/lib/cn'

type ListProps = { expanded: boolean; folded: boolean; onToggle: () => void; onNavigate?: () => void }

const rowCls = 'group/li relative z-[1] flex h-8 w-full items-center gap-2.5 rounded-[10px] pr-2 pl-[16px] text-left text-[13px] transition-colors duration-200'

/** Saved views: shortcuts to pre-filtered lists, defined in navigation.ts. */
export function SavedViews({ expanded, folded, onToggle, onNavigate }: ListProps) {
  const state = useCrm()
  const navigate = useNavigate()
  const location = useLocation()
  if (!expanded) return null
  return (
    <section className="mt-3">
      <SectionHeader label="Views" expanded={expanded} folded={folded} onToggle={onToggle} meta={<span className="tabular text-[10.5px] text-faint">{savedViews.length}</span>} />
      <Collapse open={!folded}>
        {savedViews.map((v) => {
          const active = location.pathname === v.path && JSON.stringify(location.state ?? null) === JSON.stringify(v.state ?? null)
          return (
            <button
              key={v.id}
              type="button"
              data-row
              onClick={() => {
                navigate(v.path, { state: v.state })
                onNavigate?.()
              }}
              className={cn(rowCls, active ? 'text-fg' : 'text-muted hover:text-fg')}
            >
              <span className="relative flex size-4 shrink-0 items-center justify-center">
                <span className="absolute size-3 rounded-full opacity-25 transition-transform duration-300 group-hover/li:scale-150" style={{ background: v.color }} />
                <span className="size-1.5 rounded-full" style={{ background: v.color, boxShadow: `0 0 8px ${v.color}` }} />
              </span>
              <span className="min-w-0 flex-1 truncate whitespace-nowrap">{v.label}</span>
              <CountBadge value={v.count(state)} />
            </button>
          )
        })}
      </Collapse>
    </section>
  )
}

/** Starred companies and people. */
export function Favorites({ expanded, folded, onToggle, onNavigate }: ListProps) {
  const companies = useCrm((s) => s.companies)
  const contacts = useCrm((s) => s.contacts)
  const toggleFavorite = useCrm((s) => s.toggleFavorite)
  const navigate = useNavigate()
  const location = useLocation()
  const items = [
    ...companies.filter((c) => c.favorite).map((c) => ({ id: c.id, type: 'company' as const, label: c.name, path: `/companies/${c.id}`, icon: <CompanyLogo shape={c.logo} color={c.color} size="xs" /> })),
    ...contacts.filter((c) => c.favorite).map((c) => ({ id: c.id, type: 'contact' as const, label: `${c.firstName} ${c.lastName}`, path: `/contacts/${c.id}`, icon: <Avatar name={`${c.firstName} ${c.lastName}`} hue={c.hue} size="xs" /> })),
  ].slice(0, 6)
  if (!expanded || !items.length) return null
  return (
    <section className="mt-3">
      <SectionHeader label="Favorites" expanded={expanded} folded={folded} onToggle={onToggle} meta={<span className="tabular text-[10.5px] text-faint">{items.length}</span>} />
      <Collapse open={!folded}>
        {items.map((f) => (
          <div key={f.id} className="group/li relative">
            <button
              type="button"
              data-row
              onClick={() => {
                navigate(f.path)
                onNavigate?.()
              }}
              className={cn(rowCls, 'pl-[14px]', location.pathname === f.path ? 'text-fg' : 'text-muted hover:text-fg')}
            >
              {f.icon}
              <span className="min-w-0 flex-1 truncate whitespace-nowrap pr-6">{f.label}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                toggleFavorite(f.type, f.id)
                toast.info('Removed from favorites', f.label)
              }}
              aria-label={`Unstar ${f.label}`}
              className="absolute top-1/2 right-1.5 z-[2] flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-faint opacity-0 transition-all group-hover/li:opacity-100 hover:bg-surface-3 hover:text-accent focus:opacity-100"
            >
              <StarOff className="size-3.5" />
            </button>
          </div>
        ))}
      </Collapse>
    </section>
  )
}

/** Teammates with live presence. */
export function TeamPresence({ expanded, folded, onToggle }: Omit<ListProps, 'onNavigate'>) {
  const online = members.filter((m) => presence[m.id] === 'online').length
  if (!expanded) return null
  return (
    <section className="mt-3">
      <SectionHeader
        label="Team"
        expanded={expanded}
        folded={folded}
        onToggle={onToggle}
        meta={
          <span className="flex items-center gap-1.5 text-[10.5px] whitespace-nowrap text-success">
            <span className="pulse-dot size-1.5 rounded-full bg-success text-success" />
            {online} online
          </span>
        }
      />
      <Collapse open={!folded}>
        <div className="flex flex-wrap gap-1.5 pt-1 pb-1 pl-[14px]">
          {members.map((m) => {
            const p = presence[m.id] ?? 'offline'
            return (
              <Tooltip
                key={m.id}
                side="top"
                content={
                  <span className="flex items-center gap-1.5">
                    <span className={cn('size-1.5 rounded-full', p === 'online' ? 'bg-success' : p === 'away' ? 'bg-accent' : 'bg-faint')} />
                    {m.name} · {p}
                  </span>
                }
              >
                <button
                  type="button"
                  onClick={() => toast.info(`Message ${m.name.split(' ')[0]}`, 'Chat opens in your team tool.')}
                  className={cn('group/av relative rounded-full transition-transform duration-300 hover:-translate-y-0.5', p === 'offline' && 'opacity-50 grayscale')}
                  aria-label={`${m.name}, ${p}`}
                >
                  <Avatar name={m.name} hue={m.hue} size="sm" status={p} />
                  <MessageCircle className="absolute -top-1 -right-1 size-3 rounded-full bg-surface p-[1px] text-primary opacity-0 transition-opacity group-hover/av:opacity-100" />
                </button>
              </Tooltip>
            )
          })}
        </div>
      </Collapse>
    </section>
  )
}
