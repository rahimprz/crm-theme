/** Formatting helpers for money, numbers and dates. */

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const usdCompact = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})
const num = new Intl.NumberFormat('en-US')
const numCompact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })

export const money = (n: number, compact = false) => (compact ? usdCompact : usd).format(n)
export const number = (n: number, compact = false) => (compact ? numCompact : num).format(Math.round(n))
export const percent = (n: number, digits = 1) => `${n.toFixed(digits)}%`

export function formatValue(n: number, format: 'currency' | 'number' | 'percent', compact = true) {
  if (format === 'currency') return money(n, compact)
  if (format === 'percent') return percent(n)
  return number(n, compact)
}

export function delta(current: number, previous: number) {
  if (!previous) return 0
  return ((current - previous) / previous) * 100
}

const DAY = 86_400_000

export function startOfDay(d: Date | string) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function isSameDay(a: Date | string, b: Date | string) {
  return startOfDay(a).getTime() === startOfDay(b).getTime()
}

export function dayDiff(iso: string) {
  return Math.round((startOfDay(iso).getTime() - startOfDay(new Date()).getTime()) / DAY)
}

export function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.round(diff / 60_000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  if (d === 1) return 'Yesterday'
  if (d < 7) return `${d}d ago`
  return shortDate(iso)
}

export const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

export const longDate = (iso: string | Date) =>
  new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

export const time = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

export function dueLabel(iso: string) {
  const d = dayDiff(iso)
  if (d < -1) return `${Math.abs(d)} days overdue`
  if (d === -1) return 'Yesterday'
  if (d === 0) return `Today, ${time(iso)}`
  if (d === 1) return `Tomorrow, ${time(iso)}`
  if (d < 7) return new Date(iso).toLocaleDateString('en-US', { weekday: 'long' })
  return shortDate(iso)
}

export function greeting() {
  const h = new Date().getHours()
  if (h < 5) return 'Working late'
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
