/**
 * Sample workspace data. Swap this file for API calls when you connect a
 * real backend: the store (src/store/crm.ts) only needs these arrays.
 *
 * Dates are generated relative to today so the demo always feels current,
 * and a seeded random generator keeps the numbers stable between reloads.
 */
import type {
  Activity,
  AppNotification,
  CalendarEvent,
  Company,
  Contact,
  Deal,
  DealStage,
  EmailThread,
  Lead,
  LeadSource,
  LeadStatus,
  Member,
  Priority,
  Task,
  Workflow,
} from './types'

/* ───────────── helpers ───────────── */

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20261004)
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)]
const between = (min: number, max: number) => Math.round(min + rand() * (max - min))
const roundTo = (n: number, step: number) => Math.round(n / step) * step

/** ISO timestamp `days` from now (negative = past) at a given hour. */
export function daysFromNow(days: number, hour = 10, minute = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600_000).toISOString()
}

/* ───────────── team ───────────── */

export const members: Member[] = [
  { id: 'm1', name: 'Alex Rivera', role: 'Head of Sales', email: 'alex@lumenlabs.io', quota: 480_000, hue: 220 },
  { id: 'm2', name: 'Priya Shah', role: 'Account Executive', email: 'priya@lumenlabs.io', quota: 320_000, hue: 330 },
  { id: 'm3', name: 'Marcus Bell', role: 'Account Executive', email: 'marcus@lumenlabs.io', quota: 320_000, hue: 150 },
  { id: 'm4', name: 'Yuki Tanaka', role: 'Sales Development', email: 'yuki@lumenlabs.io', quota: 160_000, hue: 40 },
  { id: 'm5', name: 'Elena Rossi', role: 'Customer Success', email: 'elena@lumenlabs.io', quota: 200_000, hue: 280 },
  { id: 'm6', name: 'Kofi Mensah', role: 'Solutions Engineer', email: 'kofi@lumenlabs.io', quota: 120_000, hue: 190 },
]

export const CURRENT_USER_ID = 'm1'
const memberIds = members.map((m) => m.id)

/* ───────────── companies ───────────── */

const companySeed: Omit<Company, 'id' | 'ownerId' | 'createdAt' | 'health'>[] = [
  { name: 'Helix Robotics', domain: 'helixrobotics.com', industry: 'Robotics', employees: 420, arr: 2_400_000, city: 'San Francisco', country: 'US', logo: 'hex', color: '#4c8dff', tier: 'Mid-market', description: 'Autonomous warehouse robots for mid-size fulfilment centers.', tags: ['Hardware', 'Expansion'] },
  { name: 'Lumen Health', domain: 'lumenhealth.org', industry: 'Healthcare', employees: 1200, arr: 5_800_000, city: 'Boston', country: 'US', logo: 'plus', color: '#2fd68f', tier: 'Enterprise', description: 'Patient engagement platform used by 300+ clinics.', tags: ['HIPAA', 'Strategic'] },
  { name: 'Arcadia Freight', domain: 'arcadiafreight.eu', industry: 'Logistics', employees: 860, arr: 3_100_000, city: 'Rotterdam', country: 'NL', logo: 'chevron', color: '#ff9f43', tier: 'Enterprise', description: 'Cross-border freight forwarding across 22 EU ports.', tags: ['EMEA'] },
  { name: 'Bluefin Analytics', domain: 'bluefin.ai', industry: 'Data & AI', employees: 140, arr: 980_000, city: 'Austin', country: 'US', logo: 'wave', color: '#22c7e8', tier: 'SMB', description: 'Forecasting models for consumer brands.', tags: ['AI', 'Fast-growth'] },
  { name: 'Solstice Energy', domain: 'solstice.energy', industry: 'Energy', employees: 2300, arr: 8_200_000, city: 'Denver', country: 'US', logo: 'sun', color: '#ffd23f', tier: 'Enterprise', description: 'Utility-scale solar developer and operator.', tags: ['Strategic', 'Renewal'] },
  { name: 'Pinecrest Capital', domain: 'pinecrest.vc', industry: 'Finance', employees: 95, arr: 640_000, city: 'New York', country: 'US', logo: 'peak', color: '#34d3a6', tier: 'SMB', description: 'Growth equity fund focused on vertical SaaS.', tags: ['Finance'] },
  { name: 'Orbital Foods', domain: 'orbitalfoods.co', industry: 'Food & Beverage', employees: 640, arr: 1_900_000, city: 'Chicago', country: 'US', logo: 'orbit', color: '#ff7a59', tier: 'Mid-market', description: 'Plant-based snacks sold in 9,000 stores.', tags: ['Retail'] },
  { name: 'Nimbus Cloud', domain: 'nimbuscloud.dev', industry: 'Software', employees: 310, arr: 2_700_000, city: 'Seattle', country: 'US', logo: 'ring', color: '#8b7cff', tier: 'Mid-market', description: 'Developer platform for edge deployments.', tags: ['SaaS', 'Expansion'] },
  { name: 'Kestrel Media', domain: 'kestrel.media', industry: 'Media', employees: 210, arr: 1_150_000, city: 'London', country: 'UK', logo: 'diamond', color: '#ff6fae', tier: 'Mid-market', description: 'Independent publisher of audio documentaries.', tags: ['EMEA', 'Media'] },
  { name: 'Copperleaf Retail', domain: 'copperleaf.shop', industry: 'Retail', employees: 1800, arr: 4_400_000, city: 'Toronto', country: 'CA', logo: 'leaf', color: '#e8a04c', tier: 'Enterprise', description: 'Home goods retailer with 140 stores.', tags: ['Retail', 'Renewal'] },
  { name: 'Tidewater Logistics', domain: 'tidewater.sg', industry: 'Logistics', employees: 520, arr: 2_050_000, city: 'Singapore', country: 'SG', logo: 'stack', color: '#4cc3ff', tier: 'Mid-market', description: 'Cold-chain shipping across Southeast Asia.', tags: ['APAC'] },
  { name: 'Ferro Systems', domain: 'ferro.de', industry: 'Manufacturing', employees: 980, arr: 3_600_000, city: 'Munich', country: 'DE', logo: 'grid', color: '#b8c0d0', tier: 'Enterprise', description: 'Precision components for e-mobility.', tags: ['EMEA', 'Hardware'] },
  { name: 'Halcyon Travel', domain: 'halcyon.travel', industry: 'Travel', employees: 330, arr: 1_300_000, city: 'Lisbon', country: 'PT', logo: 'spark', color: '#ffc24b', tier: 'Mid-market', description: 'Boutique group travel for remote teams.', tags: ['EMEA'] },
  { name: 'Quarry & Co', domain: 'quarryco.com.au', industry: 'Construction', employees: 450, arr: 1_700_000, city: 'Melbourne', country: 'AU', logo: 'blocks', color: '#c08cff', tier: 'Mid-market', description: 'Commercial construction and site management.', tags: ['APAC'] },
  { name: 'Verdant Bio', domain: 'verdantbio.com', industry: 'Biotech', employees: 180, arr: 860_000, city: 'Cambridge', country: 'UK', logo: 'drop', color: '#3ee6b0', tier: 'SMB', description: 'Enzyme engineering for sustainable materials.', tags: ['Research'] },
  { name: 'Mosaic Studio', domain: 'mosaic.studio', industry: 'Design', employees: 60, arr: 420_000, city: 'Berlin', country: 'DE', logo: 'mosaic', color: '#ff8a5c', tier: 'SMB', description: 'Brand and product design agency.', tags: ['Agency'] },
]

export const companies: Company[] = companySeed.map((c, i) => ({
  ...c,
  id: `co${i + 1}`,
  ownerId: memberIds[i % 4],
  createdAt: daysFromNow(-between(40, 600)),
  health: between(38, 98),
  favorite: i === 0 || i === 4,
}))

/* ───────────── people ───────────── */

const firstNames = ['Ava', 'Liam', 'Sofia', 'Noah', 'Mia', 'Ethan', 'Zara', 'Mateo', 'Aisha', 'Lucas', 'Yuna', 'Omar', 'Elena', 'Kai', 'Priya', 'Leo', 'Nora', 'Hiro', 'Amara', 'Felix', 'Isla', 'Rafael', 'Leila', 'Jonas', 'Chloe', 'Diego', 'Freya', 'Arjun', 'Maya', 'Theo', 'Ines', 'Kwame', 'Hana', 'Samuel', 'Selin', 'Tomas', 'Ruby', 'Idris', 'Clara', 'Wei'] as const
const lastNames = ['Chen', 'Okafor', 'Martins', 'Nakamura', 'Rossi', 'Haddad', 'Lindqvist', 'Patel', 'Moreau', 'Kowalski', 'Alvarez', 'Brennan', 'Silva', 'Fischer', 'Adeyemi', 'Tanaka', 'Novak', 'Laurent', 'Mensah', 'Kim', 'Duarte', 'Ivanova', 'Sato', 'Grant', 'Bauer', 'Rahman', 'Costa', 'Weber', 'Osei', 'Park'] as const
const titles = ['VP of Operations', 'Chief Revenue Officer', 'Head of Procurement', 'Director of Engineering', 'CTO', 'Head of Growth', 'COO', 'IT Manager', 'Product Lead', 'Finance Director', 'Founder & CEO', 'Head of Partnerships', 'Sales Operations Lead', 'Data Platform Lead']
const contactTags = ['Decision maker', 'Champion', 'Technical', 'Budget holder', 'Influencer', 'Newsletter', 'Event 2026']

const usedNames = new Set<string>()
function uniqueName(): [string, string] {
  for (;;) {
    const f = pick(firstNames)
    const l = pick(lastNames)
    if (!usedNames.has(f + l)) {
      usedNames.add(f + l)
      return [f, l]
    }
  }
}

export const contacts: Contact[] = Array.from({ length: 42 }, (_, i) => {
  const [firstName, lastName] = uniqueName()
  const company = companies[i % companies.length]
  const tagCount = between(1, 2)
  const tags = Array.from(new Set(Array.from({ length: tagCount }, () => pick(contactTags))))
  return {
    id: `p${i + 1}`,
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.domain}`,
    phone: `+1 (${between(200, 989)}) ${between(200, 989)}-${String(between(1000, 9999))}`,
    title: pick(titles),
    companyId: company.id,
    city: company.city,
    tags,
    ownerId: pick(memberIds),
    stage: pick(['customer', 'customer', 'prospect', 'prospect', 'prospect', 'partner', 'churned'] as const),
    lastContacted: daysFromNow(-between(0, 40), between(8, 18)),
    createdAt: daysFromNow(-between(20, 500)),
    hue: between(0, 359),
    favorite: i === 2 || i === 7,
  }
})

/* ───────────── leads ───────────── */

const leadCompanies = ['Northgate Labs', 'Wildflower Coffee', 'Atlas Mobility', 'Brightwave Studio', 'Cobalt Dental', 'Driftwood Hotels', 'Echo Robotics', 'Foundry Fitness', 'Granite Insurance', 'Harbor Legal', 'Ionic Batteries', 'Juniper Schools', 'Keystone Realty', 'Lighthouse Clinics', 'Meridian Air', 'Nova Payments', 'Oakline Furniture', 'Parallel Games', 'Quasar Optics', 'Redwood Partners', 'Saffron Kitchens', 'Terra Farms', 'Upland Outdoor', 'Vela Security', 'Willow Pet Care', 'Xenon Labs', 'Yardstick HR', 'Zephyr Drones', 'Amberline Tea', 'Beacon Credit', 'Cinder Studios', 'Delta Dynamics', 'Everest Learning', 'Fable Books', 'Glacier Water', 'Horizon Telecom']
const statusPool: LeadStatus[] = ['new', 'new', 'new', 'contacted', 'contacted', 'qualified', 'qualified', 'proposal', 'lost']
const sourcePool: LeadSource[] = ['website', 'website', 'referral', 'linkedin', 'linkedin', 'event', 'outbound', 'ads']
const leadTags = ['Inbound', 'Demo requested', 'Pricing page', 'Webinar', 'Trial', 'Partner intro']

export const leads: Lead[] = leadCompanies.map((company, i) => {
  const [f, l] = uniqueName()
  const status = statusPool[i % statusPool.length]
  const baseScore = { new: 45, contacted: 58, qualified: 74, proposal: 84, lost: 22 }[status]
  return {
    id: `l${i + 1}`,
    name: `${f} ${l}`,
    email: `${f.toLowerCase()}@${company.toLowerCase().replace(/[^a-z]/g, '')}.com`,
    phone: `+1 (${between(200, 989)}) ${between(200, 989)}-${String(between(1000, 9999))}`,
    company,
    title: pick(titles),
    status,
    source: pick(sourcePool),
    score: Math.min(99, Math.max(8, baseScore + between(-14, 14))),
    value: roundTo(between(6_000, 120_000), 500),
    ownerId: i % 7 === 3 ? null : memberIds[i % 5],
    createdAt: daysFromNow(-between(0, 45), between(8, 19)),
    lastActivity: hoursAgo(between(1, 240)),
    hue: between(0, 359),
    tags: rand() > 0.4 ? [pick(leadTags)] : [],
  }
})

/* ───────────── deals ───────────── */

export const stageMeta: Record<DealStage, { label: string; probability: number; color: string }> = {
  discovery: { label: 'Discovery', probability: 10, color: 'var(--faint)' },
  qualified: { label: 'Qualified', probability: 30, color: 'var(--c3)' },
  proposal: { label: 'Proposal', probability: 55, color: 'var(--primary)' },
  negotiation: { label: 'Negotiation', probability: 75, color: 'var(--accent)' },
  won: { label: 'Closed won', probability: 100, color: 'var(--success)' },
  lost: { label: 'Closed lost', probability: 0, color: 'var(--danger)' },
}

export const stageOrder: DealStage[] = ['discovery', 'qualified', 'proposal', 'negotiation', 'won', 'lost']

const products = ['Volt Core', 'Volt Core + Analytics', 'Enterprise Suite', 'Revenue Intelligence', 'Onboarding & Training', 'Platform Expansion']
const dealNames = ['Platform rollout', 'Annual renewal', 'Analytics add-on', 'Team expansion', 'Pilot program', 'Multi-year agreement', 'EMEA rollout', 'Seat upgrade', 'Data migration', 'Security review']
const nextSteps = ['Send revised proposal', 'Security questionnaire', 'Pricing call with CFO', 'Technical deep dive', 'Legal redlines', 'Champion intro to VP', 'Schedule onsite demo', 'Kickoff planning']
const stagePool: DealStage[] = ['discovery', 'discovery', 'discovery', 'qualified', 'qualified', 'qualified', 'proposal', 'proposal', 'proposal', 'negotiation', 'negotiation', 'won', 'won', 'won', 'lost']
const priorityPool: Priority[] = ['low', 'medium', 'medium', 'high', 'high', 'urgent']

export const deals: Deal[] = Array.from({ length: 30 }, (_, i) => {
  const company = companies[(i * 5) % companies.length]
  const contact = contacts.find((c) => c.companyId === company.id) ?? contacts[0]
  const stage = stagePool[i % stagePool.length]
  const closed = stage === 'won' || stage === 'lost'
  return {
    id: `d${i + 1}`,
    name: `${company.name.split(' ')[0]} · ${dealNames[i % dealNames.length]}`,
    companyId: company.id,
    contactId: contact.id,
    value: roundTo(between(12_000, 240_000), 1000),
    stage,
    probability: stageMeta[stage].probability,
    closeDate: closed ? daysFromNow(-between(2, 60)) : daysFromNow(i % 4 === 1 ? between(1, 6) : between(8, 75)),
    ownerId: memberIds[i % 5],
    createdAt: daysFromNow(-between(10, 120)),
    priority: pick(priorityPool),
    product: pick(products),
    nextStep: pick(nextSteps),
    tags: rand() > 0.5 ? [pick(['Inbound', 'Upsell', 'Competitive', 'Champion', 'Q4 push'])] : [],
  }
})

/* ───────────── tasks ───────────── */

const ref = (type: 'deal' | 'company' | 'contact', idx: number) => {
  if (type === 'deal') return { type, id: deals[idx].id, label: deals[idx].name }
  if (type === 'company') return { type, id: companies[idx].id, label: companies[idx].name }
  const c = contacts[idx]
  return { type, id: c.id, label: `${c.firstName} ${c.lastName}` }
}

export const tasks: Task[] = [
  { id: 't1', title: 'Send revised pricing to Solstice procurement', due: daysFromNow(0, 11), done: false, priority: 'urgent', kind: 'email', assigneeId: 'm1', related: ref('company', 4) },
  { id: 't2', title: 'Discovery call with Helix Robotics ops team', due: daysFromNow(0, 14, 30), done: false, priority: 'high', kind: 'call', assigneeId: 'm1', related: ref('deal', 0) },
  { id: 't3', title: 'Prep QBR deck for Lumen Health', due: daysFromNow(0, 16), done: false, priority: 'medium', kind: 'todo', assigneeId: 'm5', related: ref('company', 1) },
  { id: 't4', title: 'Follow up on security questionnaire', due: daysFromNow(-1, 9), done: false, priority: 'high', kind: 'follow-up', assigneeId: 'm2', related: ref('deal', 3) },
  { id: 't5', title: 'Book onsite demo in Rotterdam', due: daysFromNow(-2, 15), done: false, priority: 'medium', kind: 'meeting', assigneeId: 'm3', related: ref('company', 2) },
  { id: 't6', title: 'Review Nimbus Cloud legal redlines', due: daysFromNow(1, 10), done: false, priority: 'high', kind: 'todo', assigneeId: 'm1', related: ref('company', 7) },
  { id: 't7', title: 'Intro email to Copperleaf CFO', due: daysFromNow(1, 13), done: false, priority: 'medium', kind: 'email', assigneeId: 'm4', related: ref('contact', 9) },
  { id: 't8', title: 'Renewal check-in with Ferro Systems', due: daysFromNow(2, 11), done: false, priority: 'low', kind: 'call', assigneeId: 'm5', related: ref('company', 11) },
  { id: 't9', title: 'Update forecast for Q4 board pack', due: daysFromNow(3, 17), done: false, priority: 'high', kind: 'todo', assigneeId: 'm1' },
  { id: 't10', title: 'Technical deep dive: Bluefin data pipeline', due: daysFromNow(4, 15), done: false, priority: 'medium', kind: 'meeting', assigneeId: 'm6', related: ref('company', 3) },
  { id: 't11', title: 'Send case study pack to Halcyon Travel', due: daysFromNow(5, 10), done: false, priority: 'low', kind: 'email', assigneeId: 'm4', related: ref('company', 12) },
  { id: 't12', title: 'Call back Orbital Foods procurement', due: daysFromNow(6, 12), done: false, priority: 'medium', kind: 'call', assigneeId: 'm3', related: ref('company', 6) },
  { id: 't13', title: 'Log notes from Kestrel kickoff', due: daysFromNow(-1, 17), done: true, priority: 'low', kind: 'todo', assigneeId: 'm2', related: ref('company', 8) },
  { id: 't14', title: 'Confirm Tidewater pilot success criteria', due: daysFromNow(-3, 11), done: true, priority: 'medium', kind: 'email', assigneeId: 'm1', related: ref('company', 10) },
  { id: 't15', title: 'Share onboarding plan with Pinecrest', due: daysFromNow(-4, 10), done: true, priority: 'low', kind: 'email', assigneeId: 'm5', related: ref('company', 5) },
  { id: 't16', title: 'Prepare ROI model for Quarry & Co', due: daysFromNow(2, 15), done: false, priority: 'urgent', kind: 'todo', assigneeId: 'm6', related: ref('company', 13) },
]

/* ───────────── calendar ───────────── */

const eventTemplates: { title: string; type: CalendarEvent['type']; len: number; location: string }[] = [
  { title: 'Discovery call', type: 'call', len: 30, location: 'Zoom' },
  { title: 'Product demo', type: 'demo', len: 60, location: 'Google Meet' },
  { title: 'Pipeline review', type: 'internal', len: 45, location: 'Room Aurora' },
  { title: 'Contract walkthrough', type: 'meeting', len: 60, location: 'Zoom' },
  { title: 'QBR', type: 'meeting', len: 90, location: 'Client HQ' },
  { title: 'Proposal due', type: 'deadline', len: 0, location: '—' },
  { title: 'Onsite workshop', type: 'meeting', len: 120, location: 'Client office' },
  { title: 'Forecast sync', type: 'internal', len: 30, location: 'Room Volt' },
]

export const events: CalendarEvent[] = Array.from({ length: 34 }, (_, i) => {
  const t = eventTemplates[i % eventTemplates.length]
  const company = companies[(i * 3) % companies.length]
  const day = between(-16, 24)
  const hour = between(8, 16)
  const minute = pick([0, 0, 30])
  const start = daysFromNow(day, hour, minute)
  const end = new Date(new Date(start).getTime() + t.len * 60_000).toISOString()
  const internal = t.type === 'internal'
  return {
    id: `e${i + 1}`,
    title: internal ? t.title : `${t.title} · ${company.name}`,
    start,
    end,
    type: t.type,
    location: t.location,
    attendees: [pick(memberIds), pick(memberIds)].filter((v, idx, a) => a.indexOf(v) === idx),
    related: internal ? undefined : { type: 'company', id: company.id, label: company.name },
  }
})
// Make sure today always has a few events.
events.push(
  { id: 'e-t1', title: 'Discovery call · Helix Robotics', start: daysFromNow(0, 14, 30), end: daysFromNow(0, 15), type: 'call', location: 'Zoom', attendees: ['m1', 'm6'], related: { type: 'company', id: 'co1', label: 'Helix Robotics' } },
  { id: 'e-t2', title: 'Pipeline review', start: daysFromNow(0, 9, 30), end: daysFromNow(0, 10, 15), type: 'internal', location: 'Room Aurora', attendees: ['m1', 'm2', 'm3'] },
  { id: 'e-t3', title: 'Demo · Solstice Energy', start: daysFromNow(0, 16, 0), end: daysFromNow(0, 17, 0), type: 'demo', location: 'Google Meet', attendees: ['m1', 'm2'], related: { type: 'company', id: 'co5', label: 'Solstice Energy' } },
)

/* ───────────── activity feed ───────────── */

export const activities: Activity[] = [
  { id: 'a1', type: 'deal', actorId: 'm2', text: 'moved a deal to Negotiation', target: ref('deal', 9), at: hoursAgo(0.3), detail: '$148,000 · 75% probability' },
  { id: 'a2', type: 'email', actorId: 'm1', text: 'emailed', target: ref('contact', 4), at: hoursAgo(1.2), detail: 'Re: Updated rollout timeline and pricing tiers' },
  { id: 'a3', type: 'call', actorId: 'm3', text: 'logged a 24 min call with', target: ref('company', 2), at: hoursAgo(2.5), detail: 'Positive. They want an onsite demo next week.' },
  { id: 'a4', type: 'lead', actorId: 'm4', text: 'qualified a new lead from', target: { type: 'lead', id: 'l6', label: 'Driftwood Hotels' }, at: hoursAgo(3.4), detail: 'Score 82 · Demo requested' },
  { id: 'a5', type: 'meeting', actorId: 'm5', text: 'completed a QBR with', target: ref('company', 1), at: hoursAgo(5), detail: 'Health score up 12 points' },
  { id: 'a6', type: 'note', actorId: 'm6', text: 'added a note on', target: ref('company', 7), at: hoursAgo(7), detail: 'Edge regions need SSO before rollout.' },
  { id: 'a7', type: 'deal', actorId: 'm1', text: 'won a deal with', target: ref('company', 4), at: hoursAgo(20), detail: '$212,000 · Enterprise Suite' },
  { id: 'a8', type: 'task', actorId: 'm2', text: 'completed a task on', target: ref('company', 8), at: hoursAgo(26), detail: 'Log notes from Kestrel kickoff' },
  { id: 'a9', type: 'email', actorId: 'm4', text: 'started a sequence for', target: { type: 'lead', id: 'l14', label: 'Lighthouse Clinics' }, at: hoursAgo(30), detail: '5-step outbound · Healthcare' },
  { id: 'a10', type: 'call', actorId: 'm1', text: 'logged a call with', target: ref('company', 10), at: hoursAgo(44), detail: 'Pilot is live in 2 ports.' },
]

/* ───────────── notifications ───────────── */

export const notifications: AppNotification[] = [
  { id: 'n1', kind: 'mention', title: 'Priya mentioned you', body: '“@Alex can you join the Solstice pricing call at 4pm?”', at: hoursAgo(0.2), read: false, actorId: 'm2' },
  { id: 'n2', kind: 'deal', title: 'Deal moved to Negotiation', body: 'Copperleaf · Annual renewal is now at 75%.', at: hoursAgo(0.8), read: false, actorId: 'm3' },
  { id: 'n3', kind: 'lead', title: 'Hot lead assigned to you', body: 'Driftwood Hotels requested a demo. Score 82.', at: hoursAgo(2), read: false, actorId: 'm4' },
  { id: 'n4', kind: 'task', title: 'Task due in 1 hour', body: 'Send revised pricing to Solstice procurement.', at: hoursAgo(3), read: true },
  { id: 'n5', kind: 'system', title: 'Workflow ran 128 times today', body: '“Route inbound leads” finished with 99.2% success.', at: hoursAgo(6), read: true },
  { id: 'n6', kind: 'deal', title: 'Deal won', body: 'Solstice · Multi-year agreement closed at $212,000.', at: hoursAgo(20), read: true, actorId: 'm1' },
]

/* ───────────── inbox ───────────── */

export const emails: EmailThread[] = [
  {
    id: 'em1', fromName: contacts[4].firstName + ' ' + contacts[4].lastName, fromEmail: contacts[4].email, contactId: contacts[4].id,
    subject: 'Updated rollout timeline and pricing tiers', preview: 'Thanks for the call yesterday. The team aligned on a phased rollout starting with the Denver sites…',
    body: [
      'Hi Alex,',
      'Thanks for the call yesterday. The team aligned on a phased rollout starting with the Denver sites in November, then the remaining four regions in Q1.',
      'Before we sign, procurement wants to understand two things: whether the Enterprise tier includes SSO for contractors, and if you can hold the per-seat price for the full 36 months.',
      'If we can get answers by Thursday, I think we can have this signed before the end of the month.',
      'Best,',
      contacts[4].firstName,
    ],
    at: hoursAgo(0.5), unread: true, starred: true, labels: ['Deal', 'Priority'], folder: 'inbox', messages: 4, hue: contacts[4].hue,
    attachments: [{ name: 'Rollout-plan-v3.pdf', size: '1.2 MB' }, { name: 'Procurement-checklist.xlsx', size: '84 KB' }],
  },
  {
    id: 'em2', fromName: contacts[1].firstName + ' ' + contacts[1].lastName, fromEmail: contacts[1].email, contactId: contacts[1].id,
    subject: 'QBR follow-ups', preview: 'Great session today. Sharing the action items we captured, plus the usage export you asked for…',
    body: ['Hi Alex,', 'Great session today. Sharing the action items we captured, plus the usage export you asked for.', '1. Expand to the pediatrics team (40 seats)\n2. Enable the analytics add-on for leadership\n3. Quarterly roadmap preview', 'Talk soon,', contacts[1].firstName],
    at: hoursAgo(3), unread: true, starred: false, labels: ['Customer'], folder: 'inbox', messages: 2, hue: contacts[1].hue,
  },
  {
    id: 'em3', fromName: contacts[2].firstName + ' ' + contacts[2].lastName, fromEmail: contacts[2].email, contactId: contacts[2].id,
    subject: 'Onsite demo next week?', preview: 'Our ops leads will be in Rotterdam on Tuesday and Wednesday. Could your team present…',
    body: ['Hello,', 'Our ops leads will be in Rotterdam on Tuesday and Wednesday. Could your team present the live routing demo while they are here?', 'We would need about 90 minutes and a short Q&A on integrations.', 'Regards,', contacts[2].firstName],
    at: hoursAgo(6), unread: true, starred: false, labels: ['Deal'], folder: 'inbox', messages: 1, hue: contacts[2].hue,
  },
  {
    id: 'em4', fromName: 'Priya Shah', fromEmail: 'priya@lumenlabs.io',
    subject: 'Solstice pricing call prep', preview: 'Dropped my notes in the deal record. The main risk is the contractor SSO question…',
    body: ['Hey Alex,', 'Dropped my notes in the deal record. The main risk is the contractor SSO question. Kofi confirmed we can support it with SCIM.', 'See you at 4.', 'P'],
    at: hoursAgo(9), unread: false, starred: true, labels: ['Internal'], folder: 'inbox', messages: 3, hue: 330,
  },
  {
    id: 'em5', fromName: contacts[7].firstName + ' ' + contacts[7].lastName, fromEmail: contacts[7].email, contactId: contacts[7].id,
    subject: 'Legal redlines attached', preview: 'Our counsel returned the MSA with a few edits on liability caps and data residency…',
    body: ['Hi Alex,', 'Our counsel returned the MSA with a few edits on liability caps and data residency. Most are standard. Section 9.2 is the one to look at.', 'Thanks,', contacts[7].firstName],
    at: hoursAgo(26), unread: false, starred: false, labels: ['Legal'], folder: 'inbox', messages: 5, hue: contacts[7].hue,
    attachments: [{ name: 'MSA-redlines.docx', size: '220 KB' }],
  },
  {
    id: 'em6', fromName: contacts[9].firstName + ' ' + contacts[9].lastName, fromEmail: contacts[9].email, contactId: contacts[9].id,
    subject: 'Re: Renewal options', preview: 'We are comparing the 2-year and 3-year options. Can you send the TCO breakdown…',
    body: ['Hi,', 'We are comparing the 2-year and 3-year options. Can you send the TCO breakdown with the analytics add-on included?', 'Best,', contacts[9].firstName],
    at: hoursAgo(30), unread: false, starred: false, labels: ['Renewal'], folder: 'inbox', messages: 2, hue: contacts[9].hue,
  },
  {
    id: 'em7', fromName: 'Volt Workflows', fromEmail: 'workflows@volt.app',
    subject: 'Weekly automation digest', preview: '1,284 runs this week. “Route inbound leads” saved your team an estimated 11 hours…',
    body: ['Here is your weekly automation digest.', '1,284 runs this week with a 99.2% success rate. “Route inbound leads” saved your team an estimated 11 hours.', 'Two runs failed because a Slack channel was archived. Update the step to fix them.'],
    at: hoursAgo(50), unread: false, starred: false, labels: ['System'], folder: 'inbox', messages: 1, hue: 50,
  },
  {
    id: 'em8', fromName: contacts[12].firstName + ' ' + contacts[12].lastName, fromEmail: contacts[12].email, contactId: contacts[12].id,
    subject: 'Group travel pilot results', preview: 'Sharing the pilot numbers: booking time dropped from 3 days to 40 minutes…',
    body: ['Hi Alex,', 'Sharing the pilot numbers: booking time dropped from 3 days to 40 minutes, and our ops team loves the shared timeline.', 'Happy to be a reference.', contacts[12].firstName],
    at: hoursAgo(72), unread: false, starred: true, labels: ['Customer'], folder: 'inbox', messages: 1, hue: contacts[12].hue,
  },
  {
    id: 'em9', fromName: 'Alex Rivera', fromEmail: 'alex@lumenlabs.io',
    subject: 'Proposal: Helix Robotics platform rollout', preview: 'Attached is the proposal we discussed, including the warehouse pilot and the expansion path…',
    body: ['Hi team,', 'Attached is the proposal we discussed, including the warehouse pilot and the expansion path for 2027.', 'Alex'],
    at: hoursAgo(28), unread: false, starred: false, labels: ['Deal'], folder: 'sent', messages: 1, hue: 220,
  },
]

/* ───────────── workflows ───────────── */

export const workflows: Workflow[] = [
  {
    id: 'w1', name: 'Route inbound leads', description: 'Score new website leads and assign them to the right rep in seconds.', active: true, runs: 4821, successRate: 99.2, lastRun: hoursAgo(0.1),
    steps: [
      { id: 's1', kind: 'trigger', app: 'crm', title: 'Lead created', detail: 'Source is Website or Ads' },
      { id: 's2', kind: 'action', app: 'ai', title: 'Score with Volt AI', detail: 'Fit + intent model, 0–100' },
      { id: 's3', kind: 'condition', app: 'crm', title: 'Score is 70 or more?', detail: 'Branch on lead score' },
      { id: 's4', kind: 'action', app: 'slack', title: 'Alert #hot-leads', detail: 'Mention the territory owner', branch: 'yes' },
      { id: 's5', kind: 'action', app: 'email', title: 'Start nurture sequence', detail: '4 emails over 14 days', branch: 'no' },
    ],
  },
  {
    id: 'w2', name: 'Celebrate won deals', description: 'Post wins to Slack, create onboarding tasks and notify finance.', active: true, runs: 312, successRate: 100, lastRun: hoursAgo(20),
    steps: [
      { id: 's1', kind: 'trigger', app: 'crm', title: 'Deal stage changed', detail: 'Stage becomes Closed won' },
      { id: 's2', kind: 'action', app: 'slack', title: 'Post to #wins', detail: 'Deal name, value and owner' },
      { id: 's3', kind: 'action', app: 'crm', title: 'Create onboarding tasks', detail: '6 tasks assigned to CS' },
      { id: 's4', kind: 'action', app: 'webhook', title: 'Notify billing system', detail: 'POST /invoices/draft' },
    ],
  },
  {
    id: 'w3', name: 'Stale deal nudges', description: 'Remind owners when a deal has had no activity for 10 days.', active: true, runs: 1290, successRate: 97.8, lastRun: hoursAgo(2),
    steps: [
      { id: 's1', kind: 'trigger', app: 'timer', title: 'Every weekday at 9:00', detail: 'Owner time zone' },
      { id: 's2', kind: 'condition', app: 'crm', title: 'No activity in 10 days?', detail: 'Open deals only' },
      { id: 's3', kind: 'action', app: 'crm', title: 'Create follow-up task', detail: 'Due tomorrow, high priority', branch: 'yes' },
      { id: 's4', kind: 'action', app: 'email', title: 'Email the owner', detail: 'Daily digest', branch: 'yes' },
    ],
  },
  {
    id: 'w4', name: 'Meeting follow-up', description: 'Draft a recap email after every external meeting.', active: false, runs: 640, successRate: 95.1, lastRun: hoursAgo(96),
    steps: [
      { id: 's1', kind: 'trigger', app: 'calendar', title: 'Meeting ended', detail: 'External attendees only' },
      { id: 's2', kind: 'delay', app: 'timer', title: 'Wait 15 minutes', detail: 'Give notes time to sync' },
      { id: 's3', kind: 'action', app: 'ai', title: 'Draft recap with Volt AI', detail: 'Uses meeting notes and deal context' },
      { id: 's4', kind: 'action', app: 'email', title: 'Save as draft', detail: 'In the owner’s inbox' },
    ],
  },
  {
    id: 'w5', name: 'Renewal early warning', description: 'Flag accounts 90 days before renewal when health drops.', active: true, runs: 188, successRate: 100, lastRun: hoursAgo(14),
    steps: [
      { id: 's1', kind: 'trigger', app: 'timer', title: 'Every Monday', detail: '08:00 UTC' },
      { id: 's2', kind: 'condition', app: 'crm', title: 'Health below 60?', detail: 'Renewal within 90 days' },
      { id: 's3', kind: 'action', app: 'slack', title: 'Alert #customer-success', detail: 'With account summary', branch: 'yes' },
    ],
  },
]
