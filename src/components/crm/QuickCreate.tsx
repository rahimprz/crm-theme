import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Magnet, Handshake, ListChecks, UserPlus, Building2, Plus } from 'lucide-react'
import { useUI, type CreateType } from '@/store/ui'
import { useCrm } from '@/store/crm'
import { toast } from '@/store/toast'
import { members, stageMeta, stageOrder } from '@/data/mock'
import type { DealStage, LeadSource, Priority, TaskKind } from '@/data/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Input'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { sourceMeta, priorityMeta, taskKindMeta } from './meta'
import { gsap, reducedMotion } from '@/lib/gsap'

const typeMeta: Record<CreateType, { label: string; icon: React.ReactNode; title: string; description: string }> = {
  lead: { label: 'Lead', icon: <Magnet />, title: 'New lead', description: 'Capture someone who might buy.' },
  deal: { label: 'Deal', icon: <Handshake />, title: 'New deal', description: 'Track an opportunity through your pipeline.' },
  task: { label: 'Task', icon: <ListChecks />, title: 'New task', description: 'Remind yourself or a teammate to follow up.' },
  contact: { label: 'Person', icon: <UserPlus />, title: 'New person', description: 'Add a contact at one of your companies.' },
  company: { label: 'Company', icon: <Building2 />, title: 'New company', description: 'Add an account you sell to.' },
}

const toInputDate = (d: Date) => d.toISOString().slice(0, 10)

/** One modal for creating any record type. Opened from ⌘K, the + button or `N`. */
export function QuickCreate() {
  const type = useUI((s) => s.quickCreate)
  const close = useUI((s) => s.closeQuickCreate)
  const open = useUI((s) => s.openQuickCreate)
  const navigate = useNavigate()
  const crm = useCrm()
  const [current, setCurrent] = useState<CreateType>('lead')
  const body = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (type) setCurrent(type)
  }, [type])

  useLayoutEffect(() => {
    if (!body.current || reducedMotion()) return
    gsap.fromTo(body.current.querySelectorAll('[data-field]'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.035, ease: 'volt.out' })
  }, [current])

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const get = (k: string) => String(f.get(k) ?? '').trim()
    if (current === 'lead') {
      if (!get('name') || !get('company')) return toast.warning('Add a name and company', 'Both are needed to create a lead.')
      const lead = crm.addLead({ name: get('name'), company: get('company'), email: get('email'), title: get('title'), value: Number(get('value')) || 10_000, source: get('source') as LeadSource })
      toast.success('Lead created', `${lead.name} · ${lead.company}`)
      navigate('/leads')
    } else if (current === 'deal') {
      if (!get('name')) return toast.warning('Name the deal', 'A short name helps your team find it.')
      const deal = crm.addDeal({ name: get('name'), companyId: get('company'), value: Number(get('value')) || 25_000, stage: get('stage') as DealStage, closeDate: new Date(get('close') || Date.now()).toISOString() })
      toast.success('Deal created', `${deal.name} added to ${stageMeta[deal.stage].label}`)
      navigate('/deals')
    } else if (current === 'task') {
      if (!get('title')) return toast.warning('Describe the task', 'Add a short title first.')
      const due = new Date(`${get('due') || toInputDate(new Date())}T${get('time') || '10:00'}`)
      crm.addTask({ title: get('title'), due: due.toISOString(), priority: get('priority') as Priority, kind: get('kind') as TaskKind, assigneeId: get('assignee') })
      toast.success('Task created', get('title'))
      navigate('/tasks')
    } else if (current === 'contact') {
      if (!get('first')) return toast.warning('Add a first name')
      const c = crm.addContact({ firstName: get('first'), lastName: get('last'), email: get('email') || undefined, title: get('title'), companyId: get('company') })
      toast.success('Person added', `${c.firstName} ${c.lastName}`)
      navigate(`/contacts/${c.id}`)
    } else {
      if (!get('name')) return toast.warning('Add a company name')
      const c = crm.addCompany({ name: get('name'), domain: get('domain') || undefined, industry: get('industry') || 'Software', employees: Number(get('employees')) || 50 })
      toast.success('Company added', c.name)
      navigate(`/companies/${c.id}`)
    }
    close()
  }

  const meta = typeMeta[current]
  const in30 = new Date(Date.now() + 30 * 86_400_000)

  return (
    <Modal
      open={Boolean(type)}
      onClose={close}
      title={meta.title}
      description={meta.description}
      icon={meta.icon}
      size="md"
      footer={
        <>
          <span className="mr-auto hidden text-[12px] text-faint sm:block">
            Press <kbd className="kbd">esc</kbd> to cancel
          </span>
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="quick-create" icon={<Plus />}>
            Create {meta.label.toLowerCase()}
          </Button>
        </>
      }
    >
      <div className="border-b border-line px-5 py-3" data-stagger>
        <div className="no-scrollbar overflow-x-auto">
          <SegmentedControl
            size="sm"
            value={current}
            onChange={(v) => open(v)}
            options={(Object.keys(typeMeta) as CreateType[]).map((k) => ({ value: k, label: typeMeta[k].label, icon: typeMeta[k].icon }))}
          />
        </div>
      </div>
      <form id="quick-create" key={current} onSubmit={submit} className="p-5">
        <div ref={body} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {current === 'lead' && (
            <>
              <div data-field><Field label="Full name"><Input id="qc-lead-name" name="name" placeholder="Ava Chen" autoFocus /></Field></div>
              <div data-field><Field label="Company"><Input id="qc-lead-company" name="company" placeholder="Northgate Labs" /></Field></div>
              <div data-field><Field label="Work email"><Input id="qc-lead-email" name="email" type="email" placeholder="ava@northgate.com" /></Field></div>
              <div data-field><Field label="Job title"><Input id="qc-lead-title" name="title" placeholder="Head of Operations" /></Field></div>
              <div data-field>
                <Field label="Source">
                  <Select id="qc-lead-source" name="source" defaultValue="website">
                    {Object.entries(sourceMeta).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </Select>
                </Field>
              </div>
              <div data-field><Field label="Estimated value (USD)"><Input id="qc-lead-value" name="value" type="number" min={0} step={500} defaultValue={15000} /></Field></div>
            </>
          )}
          {current === 'deal' && (
            <>
              <div data-field className="sm:col-span-2"><Field label="Deal name"><Input id="qc-deal-name" name="name" placeholder="Helix · Warehouse expansion" autoFocus /></Field></div>
              <div data-field>
                <Field label="Company">
                  <Select id="qc-deal-company" name="company">
                    {crm.companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Select>
                </Field>
              </div>
              <div data-field><Field label="Value (USD)"><Input id="qc-deal-value" name="value" type="number" min={0} step={1000} defaultValue={48000} /></Field></div>
              <div data-field>
                <Field label="Stage">
                  <Select id="qc-deal-stage" name="stage" defaultValue="discovery">
                    {stageOrder.map((s) => <option key={s} value={s}>{stageMeta[s].label}</option>)}
                  </Select>
                </Field>
              </div>
              <div data-field><Field label="Expected close"><Input id="qc-deal-close" name="close" type="date" defaultValue={toInputDate(in30)} /></Field></div>
            </>
          )}
          {current === 'task' && (
            <>
              <div data-field className="sm:col-span-2"><Field label="Task"><Input id="qc-task-title" name="title" placeholder="Send the revised proposal to Solstice" autoFocus /></Field></div>
              <div data-field><Field label="Due date"><Input id="qc-task-due" name="due" type="date" defaultValue={toInputDate(new Date(Date.now() + 86_400_000))} /></Field></div>
              <div data-field><Field label="Time"><Input id="qc-task-time" name="time" type="time" defaultValue="10:00" /></Field></div>
              <div data-field>
                <Field label="Type">
                  <Select id="qc-task-kind" name="kind" defaultValue="todo">
                    {Object.entries(taskKindMeta).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </Select>
                </Field>
              </div>
              <div data-field>
                <Field label="Priority">
                  <Select id="qc-task-priority" name="priority" defaultValue="medium">
                    {Object.entries(priorityMeta).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </Select>
                </Field>
              </div>
              <div data-field className="sm:col-span-2">
                <Field label="Assignee">
                  <Select id="qc-task-assignee" name="assignee" defaultValue="m1">
                    {members.map((m) => <option key={m.id} value={m.id}>{m.name} · {m.role}</option>)}
                  </Select>
                </Field>
              </div>
            </>
          )}
          {current === 'contact' && (
            <>
              <div data-field><Field label="First name"><Input id="qc-c-first" name="first" placeholder="Leila" autoFocus /></Field></div>
              <div data-field><Field label="Last name"><Input id="qc-c-last" name="last" placeholder="Haddad" /></Field></div>
              <div data-field><Field label="Email"><Input id="qc-c-email" name="email" type="email" placeholder="leila@company.com" /></Field></div>
              <div data-field><Field label="Job title"><Input id="qc-c-title" name="title" placeholder="VP of Operations" /></Field></div>
              <div data-field className="sm:col-span-2">
                <Field label="Company">
                  <Select id="qc-c-company" name="company">
                    {crm.companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Select>
                </Field>
              </div>
            </>
          )}
          {current === 'company' && (
            <>
              <div data-field><Field label="Company name"><Input id="qc-co-name" name="name" placeholder="Atlas Mobility" autoFocus /></Field></div>
              <div data-field><Field label="Website"><Input id="qc-co-domain" name="domain" placeholder="atlasmobility.com" /></Field></div>
              <div data-field><Field label="Industry"><Input id="qc-co-industry" name="industry" placeholder="Transportation" /></Field></div>
              <div data-field><Field label="Employees"><Input id="qc-co-employees" name="employees" type="number" min={1} defaultValue={120} /></Field></div>
            </>
          )}
        </div>
      </form>
    </Modal>
  )
}
