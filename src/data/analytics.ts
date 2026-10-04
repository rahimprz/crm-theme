/**
 * Time-series numbers for the dashboard and reports. Everything is derived
 * from a seeded generator so charts look realistic and stay stable.
 */

export type RangeId = '7d' | '30d' | '90d' | '12m'

export const ranges: { id: RangeId; label: string; long: string }[] = [
  { id: '7d', label: '7D', long: 'Last 7 days' },
  { id: '30d', label: '30D', long: 'Last 30 days' },
  { id: '90d', label: '90D', long: 'Last 90 days' },
  { id: '12m', label: '12M', long: 'Last 12 months' },
]

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const dayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export interface RevenueSeries {
  labels: string[]
  revenue: number[]
  target: number[]
  /** Previous period, same length, used for deltas. */
  previous: number[]
}

export function getRevenueSeries(range: RangeId): RevenueSeries {
  const r = seeded({ '7d': 7, '30d': 30, '90d': 90, '12m': 12 }[range] * 97)
  const now = new Date()
  const labels: string[] = []
  const revenue: number[] = []
  const target: number[] = []
  const previous: number[] = []

  if (range === '12m') {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      labels.push(monthShort[d.getMonth()])
      const base = 180_000 + (11 - i) * 14_000
      revenue.push(Math.round(base + r() * 60_000 - 20_000))
      target.push(Math.round(200_000 + (11 - i) * 12_000))
      previous.push(Math.round(base * 0.78 + r() * 40_000))
    }
  } else {
    const n = range === '7d' ? 7 : range === '30d' ? 30 : 13
    const step = range === '90d' ? 7 : 1
    const scale = range === '90d' ? 52_000 : 7_600
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i * step)
      labels.push(
        range === '7d' ? dayShort[d.getDay()] : `${monthShort[d.getMonth()]} ${d.getDate()}`,
      )
      const weekday = range !== '90d' && (d.getDay() === 0 || d.getDay() === 6) ? 0.72 : 1
      const trend = 1 + (n - i) / (n * 2.2)
      revenue.push(Math.round(scale * trend * weekday * (0.82 + r() * 0.36)))
      target.push(Math.round(scale * 1.12))
      previous.push(Math.round(scale * 0.86 * weekday * (0.8 + r() * 0.3)))
    }
  }
  return { labels, revenue, target, previous }
}

export interface Kpi {
  id: 'revenue' | 'pipeline' | 'leads' | 'winrate'
  label: string
  value: number
  previous: number
  format: 'currency' | 'number' | 'percent'
  trend: number[]
}

export function getKpis(range: RangeId, openPipeline: number, leadCount: number): Kpi[] {
  const s = getRevenueSeries(range)
  const sum = (a: number[]) => a.reduce((x, y) => x + y, 0)
  const factor = { '7d': 0.12, '30d': 0.42, '90d': 1, '12m': 3.6 }[range]
  const r = seeded(leadCount * 13 + factor * 100)
  const trend = (base: number) => Array.from({ length: 12 }, (_, i) => base * (0.8 + i * 0.03 + r() * 0.18))
  return [
    { id: 'revenue', label: 'Closed revenue', value: sum(s.revenue), previous: sum(s.previous), format: 'currency', trend: s.revenue.length >= 7 ? s.revenue.slice(-12) : trend(100) },
    { id: 'pipeline', label: 'Open pipeline', value: openPipeline, previous: openPipeline * 0.88, format: 'currency', trend: trend(openPipeline) },
    { id: 'leads', label: 'New leads', value: Math.round(leadCount * factor * 4.2), previous: Math.round(leadCount * factor * 3.6), format: 'number', trend: trend(40) },
    { id: 'winrate', label: 'Win rate', value: { '7d': 34.8, '30d': 31.2, '90d': 29.6, '12m': 27.9 }[range], previous: { '7d': 30.1, '30d': 29.8, '90d': 30.4, '12m': 24.2 }[range], format: 'percent', trend: trend(30) },
  ]
}

/** Reply rate by weekday × hour, used for the "best time to reach out" heatmap. */
export function getReplyHeatmap() {
  const r = seeded(4242)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const hours = Array.from({ length: 12 }, (_, i) => i + 8)
  const cells = days.map((_day, di) =>
    hours.map((h) => {
      const weekend = di >= 5 ? 0.35 : 1
      const morning = Math.exp(-((h - 10) ** 2) / 6)
      const afternoon = Math.exp(-((h - 15) ** 2) / 5) * 0.8
      const midweek = di === 1 || di === 2 ? 1.15 : 1
      return Math.round(Math.min(68, (8 + (morning + afternoon) * 48 * midweek + r() * 8) * weekend))
    }),
  )
  return { days, hours, cells }
}

/** Monthly new vs expansion revenue for the stacked bar chart. */
export function getRevenueMix() {
  const r = seeded(777)
  const now = new Date()
  return Array.from({ length: 8 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (7 - i), 1)
    return {
      label: monthShort[d.getMonth()],
      newBiz: Math.round(110_000 + i * 9_000 + r() * 40_000),
      expansion: Math.round(40_000 + i * 6_500 + r() * 22_000),
      renewal: Math.round(60_000 + i * 3_000 + r() * 18_000),
    }
  })
}

/** Win rate and average sales cycle by month. */
export function getWinRateTrend() {
  const r = seeded(9001)
  const now = new Date()
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
    return {
      label: monthShort[d.getMonth()],
      winRate: Math.round((22 + i * 0.8 + r() * 5) * 10) / 10,
      cycle: Math.round(58 - i * 1.4 + r() * 6),
    }
  })
}
