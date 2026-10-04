/** Shared record types. Every page and component reads from these shapes. */

export type ID = string

export interface Member {
  id: ID
  name: string
  role: string
  email: string
  /** Quarterly quota in USD. */
  quota: number
  hue: number
}

export type CompanyTier = 'Enterprise' | 'Mid-market' | 'SMB'

export type LogoShape =
  | 'hex'
  | 'plus'
  | 'chevron'
  | 'wave'
  | 'sun'
  | 'peak'
  | 'orbit'
  | 'ring'
  | 'diamond'
  | 'leaf'
  | 'stack'
  | 'grid'
  | 'spark'
  | 'blocks'
  | 'drop'
  | 'mosaic'

export interface Company {
  id: ID
  name: string
  domain: string
  industry: string
  employees: number
  arr: number
  city: string
  country: string
  logo: LogoShape
  color: string
  /** Account health 0–100. */
  health: number
  tier: CompanyTier
  ownerId: ID
  createdAt: string
  description: string
  tags: string[]
  favorite?: boolean
}

export type ContactStage = 'customer' | 'prospect' | 'partner' | 'churned'

export interface Contact {
  id: ID
  firstName: string
  lastName: string
  email: string
  phone: string
  title: string
  companyId: ID
  city: string
  tags: string[]
  ownerId: ID
  stage: ContactStage
  lastContacted: string
  createdAt: string
  hue: number
  favorite?: boolean
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'lost'
export type LeadSource = 'website' | 'referral' | 'linkedin' | 'event' | 'outbound' | 'ads'

export interface Lead {
  id: ID
  name: string
  email: string
  phone: string
  company: string
  title: string
  status: LeadStatus
  source: LeadSource
  /** Lead score 0–100. */
  score: number
  value: number
  ownerId: ID | null
  createdAt: string
  lastActivity: string
  hue: number
  tags: string[]
}

export type DealStage = 'discovery' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export interface Deal {
  id: ID
  name: string
  companyId: ID
  contactId: ID
  value: number
  stage: DealStage
  probability: number
  closeDate: string
  ownerId: ID
  createdAt: string
  priority: Priority
  product: string
  nextStep: string
  tags: string[]
}

export type TaskKind = 'call' | 'email' | 'meeting' | 'todo' | 'follow-up'

export interface RecordRef {
  type: 'deal' | 'company' | 'contact' | 'lead'
  id: ID
  label: string
}

export interface Task {
  id: ID
  title: string
  due: string
  done: boolean
  priority: Priority
  kind: TaskKind
  assigneeId: ID
  related?: RecordRef
}

export type EventType = 'meeting' | 'call' | 'demo' | 'internal' | 'deadline'

export interface CalendarEvent {
  id: ID
  title: string
  start: string
  end: string
  type: EventType
  location: string
  attendees: ID[]
  related?: RecordRef
}

export type ActivityType = 'email' | 'call' | 'meeting' | 'note' | 'deal' | 'task' | 'lead'

export interface Activity {
  id: ID
  type: ActivityType
  actorId: ID
  text: string
  target?: RecordRef
  at: string
  detail?: string
}

export type NotificationKind = 'mention' | 'deal' | 'task' | 'system' | 'lead'

export interface AppNotification {
  id: ID
  kind: NotificationKind
  title: string
  body: string
  at: string
  read: boolean
  actorId?: ID
}

export interface EmailThread {
  id: ID
  fromName: string
  fromEmail: string
  contactId?: ID
  subject: string
  preview: string
  body: string[]
  at: string
  unread: boolean
  starred: boolean
  labels: string[]
  folder: 'inbox' | 'sent' | 'archive'
  messages: number
  attachments?: { name: string; size: string }[]
  hue: number
}

export type WorkflowStepKind = 'trigger' | 'condition' | 'action' | 'delay'

export interface WorkflowStep {
  id: ID
  kind: WorkflowStepKind
  app: 'crm' | 'email' | 'slack' | 'calendar' | 'webhook' | 'ai' | 'timer'
  title: string
  detail: string
  /** Optional branch label for steps after a condition. */
  branch?: 'yes' | 'no'
}

export interface Workflow {
  id: ID
  name: string
  description: string
  active: boolean
  runs: number
  successRate: number
  lastRun: string
  steps: WorkflowStep[]
}
