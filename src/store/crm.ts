/**
 * The CRM store: every record lives here, and every page reads from it.
 * Changes are saved to localStorage so edits survive a reload.
 * Settings → Workspace → "Reset demo data" restores the sample data.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as seed from '@/data/mock'
import { stageMeta } from '@/data/mock'
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
  LeadStatus,
  LogoShape,
  Task,
  Workflow,
} from '@/data/types'
import { safeStorage } from './storage'

const uid = (prefix: string) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
const now = () => new Date().toISOString()

interface CrmData {
  companies: Company[]
  contacts: Contact[]
  leads: Lead[]
  deals: Deal[]
  tasks: Task[]
  events: CalendarEvent[]
  activities: Activity[]
  notifications: AppNotification[]
  emails: EmailThread[]
  workflows: Workflow[]
}

interface CrmActions {
  addLead: (lead: Partial<Lead> & Pick<Lead, 'name' | 'company'>) => Lead
  updateLead: (id: string, patch: Partial<Lead>) => void
  setLeadStatus: (ids: string[], status: LeadStatus) => void
  deleteLeads: (ids: string[]) => void
  convertLead: (id: string) => Deal | undefined
  addDeal: (deal: Partial<Deal> & Pick<Deal, 'name' | 'companyId' | 'value'>) => Deal
  updateDeal: (id: string, patch: Partial<Deal>) => void
  moveDeal: (id: string, stage: DealStage) => void
  addTask: (task: Partial<Task> & Pick<Task, 'title'>) => Task
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  addContact: (c: Partial<Contact> & Pick<Contact, 'firstName' | 'lastName'>) => Contact
  addCompany: (c: Partial<Company> & Pick<Company, 'name'>) => Company
  toggleFavorite: (type: 'company' | 'contact', id: string) => void
  addEvent: (e: Omit<CalendarEvent, 'id'>) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  setEmailRead: (id: string, read: boolean) => void
  toggleEmailStar: (id: string) => void
  archiveEmail: (id: string) => void
  toggleWorkflow: (id: string) => void
  logActivity: (a: Omit<Activity, 'id' | 'at' | 'actorId'> & { actorId?: string }) => void
  resetDemo: () => void
}

const initialData = (): CrmData => ({
  companies: seed.companies,
  contacts: seed.contacts,
  leads: seed.leads,
  deals: seed.deals,
  tasks: seed.tasks,
  events: seed.events,
  activities: seed.activities,
  notifications: seed.notifications,
  emails: seed.emails,
  workflows: seed.workflows,
})

const logoShapes: LogoShape[] = ['hex', 'plus', 'chevron', 'wave', 'sun', 'peak', 'orbit', 'ring', 'diamond', 'leaf', 'stack', 'grid', 'spark', 'blocks', 'drop', 'mosaic']
const logoColors = ['#4c8dff', '#ffd23f', '#34d3a6', '#ff7a59', '#b18cff', '#22c7e8', '#ff6fae']

export const useCrm = create<CrmData & CrmActions>()(
  persist(
    (set, get) => ({
      ...initialData(),

      logActivity: (a) =>
        set((s) => ({
          activities: [{ id: uid('a'), at: now(), actorId: a.actorId ?? seed.CURRENT_USER_ID, ...a }, ...s.activities].slice(0, 60),
        })),

      addLead: (lead) => {
        const created: Lead = {
          id: uid('l'),
          email: '',
          phone: '',
          title: '',
          status: 'new',
          source: 'website',
          score: 50,
          value: 10_000,
          ownerId: seed.CURRENT_USER_ID,
          createdAt: now(),
          lastActivity: now(),
          hue: Math.floor(Math.random() * 360),
          tags: [],
          ...lead,
        }
        set((s) => ({ leads: [created, ...s.leads] }))
        get().logActivity({ type: 'lead', text: 'added a new lead from', target: { type: 'lead', id: created.id, label: created.company } })
        return created
      },

      updateLead: (id, patch) =>
        set((s) => ({ leads: s.leads.map((l) => (l.id === id ? { ...l, ...patch, lastActivity: now() } : l)) })),

      setLeadStatus: (ids, status) =>
        set((s) => ({ leads: s.leads.map((l) => (ids.includes(l.id) ? { ...l, status, lastActivity: now() } : l)) })),

      deleteLeads: (ids) => set((s) => ({ leads: s.leads.filter((l) => !ids.includes(l.id)) })),

      convertLead: (id) => {
        const lead = get().leads.find((l) => l.id === id)
        if (!lead) return
        let company = get().companies.find((c) => c.name.toLowerCase() === lead.company.toLowerCase())
        if (!company) company = get().addCompany({ name: lead.company })
        const [firstName, ...rest] = lead.name.split(' ')
        const contact = get().addContact({ firstName, lastName: rest.join(' '), email: lead.email, phone: lead.phone, title: lead.title, companyId: company.id })
        const deal = get().addDeal({ name: `${company.name.split(' ')[0]} · New opportunity`, companyId: company.id, contactId: contact.id, value: lead.value, stage: 'qualified' })
        set((s) => ({ leads: s.leads.filter((l) => l.id !== id) }))
        return deal
      },

      addDeal: (deal) => {
        const stage = deal.stage ?? 'discovery'
        const created: Deal = {
          id: uid('d'),
          contactId: get().contacts.find((c) => c.companyId === deal.companyId)?.id ?? '',
          stage,
          probability: stageMeta[stage].probability,
          closeDate: seed.daysFromNow(30),
          ownerId: seed.CURRENT_USER_ID,
          createdAt: now(),
          priority: 'medium',
          product: 'Volt Core',
          nextStep: 'Schedule discovery call',
          tags: [],
          ...deal,
        }
        set((s) => ({ deals: [created, ...s.deals] }))
        get().logActivity({ type: 'deal', text: 'created a deal', target: { type: 'deal', id: created.id, label: created.name } })
        return created
      },

      updateDeal: (id, patch) => set((s) => ({ deals: s.deals.map((d) => (d.id === id ? { ...d, ...patch } : d)) })),

      moveDeal: (id, stage) => {
        const deal = get().deals.find((d) => d.id === id)
        if (!deal || deal.stage === stage) return
        set((s) => ({
          deals: s.deals.map((d) => (d.id === id ? { ...d, stage, probability: stageMeta[stage].probability } : d)),
        }))
        get().logActivity({
          type: 'deal',
          text: `moved a deal to ${stageMeta[stage].label}`,
          target: { type: 'deal', id, label: deal.name },
        })
      },

      addTask: (task) => {
        const created: Task = {
          id: uid('t'),
          due: seed.daysFromNow(1, 10),
          done: false,
          priority: 'medium',
          kind: 'todo',
          assigneeId: seed.CURRENT_USER_ID,
          ...task,
        }
        set((s) => ({ tasks: [created, ...s.tasks] }))
        return created
      },

      toggleTask: (id) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })),

      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      addContact: (c) => {
        const company = get().companies.find((co) => co.id === c.companyId) ?? get().companies[0]
        const created: Contact = {
          id: uid('p'),
          email: `${c.firstName.toLowerCase()}@${company.domain}`,
          phone: '',
          title: '',
          companyId: company.id,
          city: company.city,
          tags: [],
          ownerId: seed.CURRENT_USER_ID,
          stage: 'prospect',
          lastContacted: now(),
          createdAt: now(),
          hue: Math.floor(Math.random() * 360),
          ...c,
        }
        set((s) => ({ contacts: [created, ...s.contacts] }))
        return created
      },

      addCompany: (c) => {
        const n = get().companies.length
        const created: Company = {
          id: uid('co'),
          domain: `${c.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          industry: 'Software',
          employees: 50,
          arr: 0,
          city: 'Remote',
          country: 'US',
          logo: logoShapes[n % logoShapes.length],
          color: logoColors[n % logoColors.length],
          health: 70,
          tier: 'SMB',
          ownerId: seed.CURRENT_USER_ID,
          createdAt: now(),
          description: 'New account.',
          tags: [],
          ...c,
        }
        set((s) => ({ companies: [created, ...s.companies] }))
        return created
      },

      toggleFavorite: (type, id) =>
        set((s) =>
          type === 'company'
            ? { companies: s.companies.map((c) => (c.id === id ? { ...c, favorite: !c.favorite } : c)) }
            : { contacts: s.contacts.map((c) => (c.id === id ? { ...c, favorite: !c.favorite } : c)) },
        ),

      addEvent: (e) => set((s) => ({ events: [...s.events, { ...e, id: uid('e') }] })),

      markNotificationRead: (id) =>
        set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),

      markAllNotificationsRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

      setEmailRead: (id, read) => set((s) => ({ emails: s.emails.map((e) => (e.id === id ? { ...e, unread: !read } : e)) })),

      toggleEmailStar: (id) => set((s) => ({ emails: s.emails.map((e) => (e.id === id ? { ...e, starred: !e.starred } : e)) })),

      archiveEmail: (id) =>
        set((s) => ({ emails: s.emails.map((e) => (e.id === id ? { ...e, folder: 'archive', unread: false } : e)) })),

      toggleWorkflow: (id) => set((s) => ({ workflows: s.workflows.map((w) => (w.id === id ? { ...w, active: !w.active } : w)) })),

      resetDemo: () => set(initialData()),
    }),
    { name: 'volt-crm-data', version: 1, storage: safeStorage },
  ),
)

/* ───────────── lookups (plain functions, usable anywhere) ───────────── */

export const memberById = (id?: string | null) => seed.members.find((m) => m.id === id)
export const currentUser = seed.members.find((m) => m.id === seed.CURRENT_USER_ID)!
