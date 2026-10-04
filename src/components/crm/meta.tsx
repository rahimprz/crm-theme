/** Labels, colors and icons for record fields. Edit here to rename a status everywhere. */
import {
  Globe,
  Users,
  Network,
  Ticket,
  Send,
  Megaphone,
  Phone,
  Mail,
  CalendarClock,
  CircleCheck,
  RefreshCcw,
  Flag,
} from 'lucide-react'
import type { DealStage, LeadSource, LeadStatus, Priority, TaskKind, ContactStage } from '@/data/types'
import { stageMeta } from '@/data/mock'
import { Badge, type Tone } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'

export const leadStatusMeta: Record<LeadStatus, { label: string; tone: Tone }> = {
  new: { label: 'New', tone: 'primary' },
  contacted: { label: 'Contacted', tone: 'c5' },
  qualified: { label: 'Qualified', tone: 'c3' },
  proposal: { label: 'Proposal', tone: 'accent' },
  lost: { label: 'Lost', tone: 'neutral' },
}
export const leadStatusOrder: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal', 'lost']

export const sourceMeta: Record<LeadSource, { label: string; icon: typeof Globe }> = {
  website: { label: 'Website', icon: Globe },
  referral: { label: 'Referral', icon: Users },
  linkedin: { label: 'LinkedIn', icon: Network },
  event: { label: 'Event', icon: Ticket },
  outbound: { label: 'Outbound', icon: Send },
  ads: { label: 'Paid ads', icon: Megaphone },
}

export const stageTone: Record<DealStage, Tone> = {
  discovery: 'neutral',
  qualified: 'c3',
  proposal: 'primary',
  negotiation: 'accent',
  won: 'success',
  lost: 'danger',
}

export const priorityMeta: Record<Priority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'var(--faint)' },
  medium: { label: 'Medium', color: 'var(--primary)' },
  high: { label: 'High', color: 'var(--warning)' },
  urgent: { label: 'Urgent', color: 'var(--danger)' },
}

export const taskKindMeta: Record<TaskKind, { label: string; icon: typeof Phone }> = {
  call: { label: 'Call', icon: Phone },
  email: { label: 'Email', icon: Mail },
  meeting: { label: 'Meeting', icon: CalendarClock },
  todo: { label: 'To-do', icon: CircleCheck },
  'follow-up': { label: 'Follow-up', icon: RefreshCcw },
}

export const contactStageMeta: Record<ContactStage, { label: string; tone: Tone }> = {
  customer: { label: 'Customer', tone: 'success' },
  prospect: { label: 'Prospect', tone: 'primary' },
  partner: { label: 'Partner', tone: 'c5' },
  churned: { label: 'Churned', tone: 'neutral' },
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const m = leadStatusMeta[status]
  return (
    <Badge tone={m.tone} dot>
      {m.label}
    </Badge>
  )
}

export function StageBadge({ stage }: { stage: DealStage }) {
  return (
    <Badge tone={stageTone[stage]} dot>
      {stageMeta[stage].label}
    </Badge>
  )
}

export function PriorityFlag({ priority, showLabel }: { priority: Priority; showLabel?: boolean }) {
  const m = priorityMeta[priority]
  return (
    <span className="inline-flex items-center gap-1 text-[12px] text-muted" title={`${m.label} priority`}>
      <Flag className="size-3.5" style={{ color: m.color, fill: priority === 'urgent' ? m.color : 'none' }} />
      {showLabel && m.label}
    </span>
  )
}

export function SourceLabel({ source }: { source: LeadSource }) {
  const m = sourceMeta[source]
  const Icon = m.icon
  return (
    <span className="inline-flex items-center gap-1.5 text-[12.5px] text-muted">
      <Icon className="size-3.5 text-faint" />
      {m.label}
    </span>
  )
}

/** Lead score: a compact meter whose color shifts from cool to hot. */
export function ScoreMeter({ score, className }: { score: number; className?: string }) {
  const color = score >= 75 ? 'var(--accent)' : score >= 50 ? 'var(--primary)' : 'var(--faint)'
  return (
    <span className={cn('inline-flex items-center gap-2', className)} title={`Lead score ${score} of 100`}>
      <span className="relative h-1.5 w-14 overflow-hidden rounded-full bg-surface-3">
        <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${score}%`, background: color, boxShadow: score >= 75 ? `0 0 8px ${color}` : undefined }} />
      </span>
      <span className="tabular w-6 text-[12.5px] font-semibold text-fg">{score}</span>
    </span>
  )
}
