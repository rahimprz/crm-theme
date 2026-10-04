import { useRef, useState } from 'react'
import {
  Palette,
  Bell,
  Building,
  Plug,
  KeyRound,
  CreditCard,
  Check,
  Moon,
  Sun,
  MonitorSmartphone,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Mail,
  MessageSquare,
  Video,
  CalendarDays,
  Receipt,
  Webhook,
  Database,
  Zap,
  RotateCcw,
  UserPlus,
  Sparkles,
  Download,
} from 'lucide-react'
import { modes, palettes, radii, getMode, resolvePalette, type Mode, type Palette as PaletteT, type RadiusId } from '@/config/themes'
import { useTheme } from '@/store/theme'
import { useCrm, currentUser } from '@/store/crm'
import { toast } from '@/store/toast'
import { members } from '@/data/mock'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Input, Select } from '@/components/ui/Input'
import { Progress, Ring } from '@/components/ui/Progress'
import { Checkbox } from '@/components/ui/Checkbox'
import { Tooltip } from '@/components/ui/Tooltip'
import { gsap, reducedMotion, useGSAP } from '@/lib/gsap'
import { cn } from '@/lib/cn'
import { sidebarSections, type SidebarSection } from '@/config/app'

type Section = 'appearance' | 'notifications' | 'workspace' | 'integrations' | 'api' | 'billing'

const sections: { id: Section; label: string; icon: React.ReactNode; hint: string }[] = [
  { id: 'appearance', label: 'Appearance', icon: <Palette />, hint: 'Theme, colors and motion' },
  { id: 'notifications', label: 'Notifications', icon: <Bell />, hint: 'What we tell you, and where' },
  { id: 'workspace', label: 'Workspace', icon: <Building />, hint: 'Members and data' },
  { id: 'integrations', label: 'Integrations', icon: <Plug />, hint: 'Email, calendar and chat' },
  { id: 'api', label: 'API & webhooks', icon: <KeyRound />, hint: 'Keys for developers' },
  { id: 'billing', label: 'Billing', icon: <CreditCard />, hint: 'Plan and invoices' },
]

function Panel({ title, description, children, action }: { title: string; description?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section data-set className="card p-5 md:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[15.5px] font-semibold text-fg">{title}</h2>
          {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

/** A miniature app screen painted with a specific mode + palette. */
function MiniPreview({ mode, palette }: { mode: Mode; palette: PaletteT }) {
  const c = mode.colors
  const p = resolvePalette(palette, mode)
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg" style={{ background: c.bg, boxShadow: `inset 0 0 0 1px ${c.line}` }}>
      <div className="absolute inset-y-0 left-0 w-[22%] p-[6%]" style={{ background: c.surface, borderRight: `1px solid ${c.line}` }}>
        <div className="mb-[18%] h-[7%] w-[60%] rounded-sm" style={{ background: p.accent }} />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="mb-[14%] h-[5%] rounded-sm" style={{ background: i === 0 ? p.primary : c.surface3, width: i === 0 ? '90%' : '70%' }} />
        ))}
      </div>
      <div className="absolute top-[8%] right-[5%] left-[27%] grid grid-cols-3 gap-[4%]">
        {[p.primary, p.accent, p.chart[0]].map((col, i) => (
          <div key={i} className="aspect-[5/3] rounded-md p-[10%]" style={{ background: c.surface, boxShadow: `inset 0 0 0 1px ${c.line}` }}>
            <div className="h-[18%] w-1/2 rounded-sm" style={{ background: c.faint, opacity: 0.6 }} />
            <div className="mt-[14%] h-[24%] w-3/4 rounded-sm" style={{ background: c.fg, opacity: 0.85 }} />
            <div className="mt-[12%] h-[10%] rounded-full" style={{ background: col }} />
          </div>
        ))}
      </div>
      <div className="absolute right-[5%] bottom-[8%] left-[27%] flex h-[38%] items-end gap-[3%] rounded-md p-[3%]" style={{ background: c.surface, boxShadow: `inset 0 0 0 1px ${c.line}` }}>
        {[40, 62, 48, 75, 58, 88, 70, 95].map((h, i) => (
          <div key={i} className="flex-1 rounded-t-[2px]" style={{ height: `${h}%`, background: i === 7 ? p.accent : p.primary, opacity: i === 7 ? 1 : 0.35 + i * 0.07 }} />
        ))}
      </div>
    </div>
  )
}

function Appearance() {
  const t = useTheme()
  const mode = getMode(t.mode)
  const icons = { dark: <Moon />, midnight: <MonitorSmartphone />, light: <Sun /> }

  return (
    <div className="space-y-4">
      <Panel title="Mode" description="The canvas everything sits on. Try the day/night switch too." action={<ThemeToggle />}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {modes.map((m) => {
            const active = m.id === t.mode
            return (
              <button
                key={m.id}
                type="button"
                onClick={(e) => t.setMode(m.id, { x: e.clientX, y: e.clientY })}
                className={cn('group rounded-[var(--radius-xl)] border p-2.5 text-left transition-all duration-300', active ? 'border-primary/60 bg-primary/[0.06] shadow-[var(--glow-primary)]' : 'border-line hover:-translate-y-0.5 hover:border-line-strong')}
              >
                <MiniPreview mode={m} palette={palettes.find((p) => p.id === t.palette) ?? palettes[0]} />
                <div className="mt-2.5 flex items-center gap-2 px-1">
                  <span className={cn('[&_svg]:size-4', active ? 'text-primary' : 'text-faint')}>{icons[m.id]}</span>
                  <span className="text-[13px] font-semibold text-fg">{m.name}</span>
                  {active && <Check className="ml-auto size-4 text-primary" />}
                </div>
                <p className="px-1 pt-0.5 text-[12px] text-faint">{m.description}</p>
              </button>
            )
          })}
        </div>
      </Panel>

      <Panel title="Color palette" description="Each palette sets a primary and an accent color. Neutrals pick up a hint of the primary.">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {palettes.map((p) => {
            const active = p.id === t.palette
            const c = resolvePalette(p, mode)
            return (
              <button
                key={p.id}
                type="button"
                onClick={(e) => t.setPalette(p.id, { x: e.clientX, y: e.clientY })}
                className={cn('group relative rounded-[var(--radius-xl)] border p-2.5 text-left transition-all duration-300', active ? 'border-primary/60 shadow-[var(--glow-primary)]' : 'border-line hover:-translate-y-0.5 hover:border-line-strong')}
              >
                <MiniPreview mode={mode} palette={p} />
                <div className="mt-2.5 flex items-center gap-2.5 px-1">
                  <span className="flex overflow-hidden rounded-full ring-1 ring-line-strong transition-transform duration-500 group-hover:rotate-180">
                    <span className="size-3.5" style={{ background: c.primary }} />
                    <span className="size-3.5" style={{ background: c.accent }} />
                  </span>
                  <span className="text-[13px] font-semibold text-fg">{p.name}</span>
                  {active && <Badge tone="primary" className="ml-auto">Active</Badge>}
                </div>
                <p className="truncate px-1 pt-0.5 text-[12px] text-faint">{p.description}</p>
              </button>
            )
          })}
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Shape & density" description="Corner roundness and how much fits on screen.">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[13.5px] font-medium text-fg">Corners</span>
              <SegmentedControl value={t.radius} onChange={(v) => t.setRadius(v as RadiusId)} options={(Object.keys(radii) as RadiusId[]).map((r) => ({ value: r, label: radii[r].label }))} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[13.5px] font-medium text-fg">Table density</span>
              <SegmentedControl value={t.density} onChange={t.setDensity} options={[{ value: 'comfortable', label: 'Comfortable' }, { value: 'compact', label: 'Compact' }]} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['Card', 'Button', 'Input'].map((x) => (
                <div key={x} className="flex h-16 items-center justify-center border border-line-strong bg-surface-2 text-[12px] text-muted transition-[border-radius] duration-500" style={{ borderRadius: 'var(--radius-lg)' }}>
                  {x}
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="Motion & layout" description="Animation and navigation preferences.">
          <div className="space-y-4">
            <Switch id="set-motion" label="Reduce motion" description="Turn off scroll reveals, count-ups and page transitions." checked={t.motion === 'reduced'} onChange={(v) => { t.setMotion(v ? 'reduced' : 'full'); toast.info(v ? 'Motion reduced' : 'Full motion on') }} />
            <Switch id="set-sidebar" label="Compact sidebar" description="Show icons only. Press [ to toggle anywhere." checked={t.sidebarCollapsed} onChange={t.toggleSidebar} />
            <Switch id="set-grain" label="Film grain" description="A subtle texture over the interface." checked={t.grain} onChange={t.setGrain} tone="accent" />
          </div>
        </Panel>
      </div>

      <Panel
        title="Sidebar"
        description="Choose what the sidebar shows. Content itself lives in src/config/navigation.ts and src/config/app.ts."
        action={
          t.collapsedGroups.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={() => { t.collapsedGroups.forEach((g) => t.toggleGroup(g)); toast.success('All sidebar groups expanded') }}>
              Unfold all groups
            </Button>
          ) : undefined
        }
      >
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
          {(Object.keys(sidebarSections) as SidebarSection[]).map((k) => (
            <Switch
              key={k}
              id={`side-${k}`}
              label={sidebarSections[k].label}
              description={sidebarSections[k].description}
              checked={t.sections[k]}
              onChange={(v) => t.setSection(k, v)}
            />
          ))}
        </div>
      </Panel>

      <Panel title="Live preview" description="Components in your current theme.">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="accent" icon={<Zap />}>Accent</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Badge tone="primary" dot>Primary</Badge>
          <Badge tone="accent" dot>Accent</Badge>
          <Badge tone="success" dot>Won</Badge>
          <Badge tone="danger" dot>Lost</Badge>
          <Checkbox checked onChange={() => {}} label="Checked" />
          <Switch checked onChange={() => {}} ariaLabel="Preview switch" />
          <Ring value={72} size={40} stroke={4}><span className="tabular text-[10px] text-muted">72</span></Ring>
          <div className="w-40"><Progress value={64} gradient /></div>
        </div>
      </Panel>
    </div>
  )
}

function Notifications() {
  const rows = [
    { id: 'deal', label: 'Deal stage changes', description: 'When a deal you own moves stage', icon: <Zap /> },
    { id: 'mention', label: 'Mentions', description: 'When a teammate @mentions you', icon: <MessageSquare /> },
    { id: 'task', label: 'Task reminders', description: '1 hour before a task is due', icon: <CalendarDays /> },
    { id: 'lead', label: 'Hot lead assigned', description: 'Score 75+ leads routed to you', icon: <Sparkles /> },
    { id: 'digest', label: 'Weekly digest', description: 'Pipeline summary every Monday', icon: <Mail /> },
  ]
  const [state, setState] = useState<Record<string, [boolean, boolean, boolean]>>({
    deal: [true, true, false],
    mention: [true, true, true],
    task: [false, true, false],
    lead: [true, true, true],
    digest: [true, false, false],
  })
  const channels = ['Email', 'Push', 'Slack']
  return (
    <Panel title="Notifications" description="Pick a channel for each kind of update.">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px]">
          <thead>
            <tr className="text-left text-[11.5px] text-faint">
              <th className="pb-3 font-medium">Event</th>
              {channels.map((c) => (
                <th key={c} className="w-20 pb-3 text-center font-medium">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-line">
                <td className="py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-surface-3 text-muted [&_svg]:size-4">{r.icon}</span>
                    <div>
                      <div className="text-[13.5px] font-medium text-fg">{r.label}</div>
                      <div className="text-[12px] text-faint">{r.description}</div>
                    </div>
                  </div>
                </td>
                {channels.map((c, i) => (
                  <td key={c} className="py-3.5 text-center">
                    <div className="flex justify-center">
                      <Switch
                        size="sm"
                        checked={state[r.id][i]}
                        ariaLabel={`${r.label} by ${c}`}
                        onChange={(v) => setState((s) => ({ ...s, [r.id]: s[r.id].map((x, j) => (j === i ? v : x)) as [boolean, boolean, boolean] }))}
                      />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}

function Workspace() {
  const resetDemo = useCrm((s) => s.resetDemo)
  const [confirm, setConfirm] = useState(false)
  const [invite, setInvite] = useState('')
  return (
    <div className="space-y-4">
      <Panel title="Members" description={`${members.length} people in Lumen Labs`}>
        <form
          className="mb-4 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault()
            if (!invite.includes('@')) return toast.warning('Enter a work email', 'For example name@company.com')
            toast.success('Invite sent', invite)
            setInvite('')
          }}
        >
          <div className="flex-1"><Input id="invite-email" type="email" value={invite} onChange={(e) => setInvite(e.target.value)} placeholder="teammate@company.com" icon={<Mail />} /></div>
          <Button type="submit" variant="primary" icon={<UserPlus />} className="h-10">Invite</Button>
        </form>
        <ul className="divide-y divide-line rounded-[var(--radius-lg)] border border-line">
          {members.map((m) => (
            <li key={m.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar name={m.name} hue={m.hue} size="md" status={m.id === currentUser.id ? 'online' : m.id === 'm3' ? 'away' : undefined} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13.5px] font-medium text-fg">
                  {m.name} {m.id === currentUser.id && <span className="text-faint">(you)</span>}
                </div>
                <div className="truncate text-[12px] text-faint">{m.email}</div>
              </div>
              <div className="hidden w-36 sm:block">
                <Select id={`role-${m.id}`} defaultValue={m.id === 'm1' ? 'admin' : 'member'} className="h-8 text-[12.5px]" aria-label={`Role for ${m.name}`} onChange={(e) => toast.success('Role updated', `${m.name} is now ${e.target.value}`)}>
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </Select>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel title="Demo data" description="Your edits are saved in this browser. Reset to start over with the sample workspace.">
        <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-danger/30 bg-danger/[0.05] p-4 sm:flex-row sm:items-center">
          <Database className="size-5 shrink-0 text-danger" />
          <p className="flex-1 text-[13px] text-muted">Restores every lead, deal, task and email to the original sample. This can’t be undone.</p>
          {confirm ? (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setConfirm(false)}>Cancel</Button>
              <Button variant="danger" size="sm" icon={<RotateCcw />} onClick={() => { resetDemo(); setConfirm(false); toast.success('Demo data restored') }}>Yes, reset</Button>
            </div>
          ) : (
            <Button variant="danger" size="sm" icon={<RotateCcw />} onClick={() => setConfirm(true)}>Reset demo data</Button>
          )}
        </div>
      </Panel>
    </div>
  )
}

function Integrations() {
  const [connected, setConnected] = useState<Record<string, boolean>>({ mail: true, cal: true, chat: true, video: false, billing: false, hooks: true })
  const items = [
    { id: 'mail', name: 'Email sync', vendor: 'Gmail and Outlook', icon: <Mail />, color: 'var(--danger)', description: 'Two-way sync of threads with people and companies.' },
    { id: 'cal', name: 'Calendar', vendor: 'Google and Microsoft', icon: <CalendarDays />, color: 'var(--primary)', description: 'Meetings appear on records and the calendar.' },
    { id: 'chat', name: 'Team chat', vendor: 'Slack', icon: <MessageSquare />, color: 'var(--c5)', description: 'Post wins and alerts to channels.' },
    { id: 'video', name: 'Video calls', vendor: 'Zoom and Meet', icon: <Video />, color: 'var(--c3)', description: 'Join links and recordings on events.' },
    { id: 'billing', name: 'Billing', vendor: 'Stripe', icon: <Receipt />, color: 'var(--accent)', description: 'Invoices and MRR on company records.' },
    { id: 'hooks', name: 'Webhooks', vendor: 'Any HTTPS endpoint', icon: <Webhook />, color: 'var(--c4)', description: 'Send record events to your own services.' },
  ]
  return (
    <Panel title="Integrations" description="Connect the tools your team already uses.">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((i) => (
          <div key={i.id} className="card spotlight flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-xl [&_svg]:size-5" style={{ background: `color-mix(in oklab, ${i.color} 15%, transparent)`, color: i.color }}>{i.icon}</span>
              <Switch
                checked={connected[i.id]}
                tone="success"
                ariaLabel={`Connect ${i.name}`}
                onChange={(v) => {
                  setConnected((c) => ({ ...c, [i.id]: v }))
                  toast[v ? 'success' : 'warning'](v ? `${i.name} connected` : `${i.name} disconnected`, i.vendor)
                }}
              />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-fg">{i.name}</div>
              <div className="text-[12px] text-faint">{i.vendor}</div>
            </div>
            <p className="text-[12.5px] text-muted">{i.description}</p>
            <Badge tone={connected[i.id] ? 'success' : 'neutral'} dot className="w-fit">{connected[i.id] ? 'Connected' : 'Not connected'}</Badge>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function Api() {
  const [shown, setShown] = useState(false)
  const key = 'volt_live_8f3k2Lq9ZtW4mN7xR1pB6sYc'
  const copy = () =>
    navigator.clipboard
      ?.writeText(key)
      .then(() => toast.success('API key copied'))
      .catch(() => toast.info('Copy the key manually', key))
  return (
    <div className="space-y-4">
      <Panel title="API keys" description="Use these to read and write records from your own code.">
        <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-line bg-surface-2 p-4 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-medium text-fg">Production key</div>
            <code className="mt-1 block truncate font-mono text-[12.5px] text-muted select-all">{shown ? key : `volt_live_${'•'.repeat(22)}`}</code>
          </div>
          <div className="flex gap-1.5">
            <Tooltip content={shown ? 'Hide' : 'Reveal'}>
              <Button variant="secondary" size="icon-sm" onClick={() => setShown((s) => !s)} aria-label={shown ? 'Hide key' : 'Reveal key'}>{shown ? <EyeOff /> : <Eye />}</Button>
            </Tooltip>
            <Tooltip content="Copy">
              <Button variant="secondary" size="icon-sm" onClick={copy} aria-label="Copy key"><Copy /></Button>
            </Tooltip>
            <Button variant="secondary" size="sm" icon={<RefreshCw />} onClick={() => toast.warning('Key rotated', 'Update your integrations with the new key.')}>Rotate</Button>
          </div>
        </div>
        <pre className="mt-4 overflow-x-auto rounded-[var(--radius-lg)] border border-line bg-bg p-4 font-mono text-[12px] leading-relaxed text-muted">
{`curl https://api.volt.app/v1/deals \\
  -H "Authorization: Bearer $VOLT_API_KEY" \\
  -d stage=negotiation -d value=48000`}
        </pre>
      </Panel>
      <Panel title="Webhooks" description="Get an HTTPS POST whenever records change.">
        <ul className="space-y-2">
          {[
            { url: 'https://hooks.lumenlabs.io/volt/deals', events: 'deal.created, deal.updated', ok: true },
            { url: 'https://billing.lumenlabs.io/won', events: 'deal.won', ok: true },
            { url: 'https://old.lumenlabs.io/leads', events: 'lead.created', ok: false },
          ].map((w) => (
            <li key={w.url} className="flex items-center gap-3 rounded-lg border border-line px-3.5 py-2.5">
              <span className={cn('size-2 shrink-0 rounded-full', w.ok ? 'bg-success' : 'bg-danger')} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-mono text-[12.5px] text-fg">{w.url}</div>
                <div className="text-[11.5px] text-faint">{w.events}</div>
              </div>
              <Badge tone={w.ok ? 'success' : 'danger'}>{w.ok ? '200 OK' : '410 Gone'}</Badge>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}

function Billing() {
  return (
    <div className="space-y-4">
      <section data-set className="card beam relative overflow-hidden p-6">
        <div className="aurora"><span /><span /></div>
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <Badge tone="accent" icon={<Sparkles />}>Pro plan</Badge>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="tabular text-[40px] leading-none font-semibold tracking-[-0.03em] text-fg">$29</span>
              <span className="text-[13px] text-muted">per seat / month, billed yearly</span>
            </div>
            <p className="mt-2 text-[13px] text-muted">6 seats · renews on January 12 · Visa ending 4242</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => toast.info('Manage seats', 'Add or remove seats any time.')}>Manage seats</Button>
            <Button variant="accent" icon={<Zap />} onClick={() => toast.info('Enterprise', 'Talk to us about SSO, audit logs and custom contracts.')}>Upgrade</Button>
          </div>
        </div>
      </section>
      <Panel title="Usage this month">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            { label: 'Seats', used: 6, total: 10 },
            { label: 'Volt AI credits', used: 6800, total: 10000 },
            { label: 'Workflow runs', used: 7210, total: 25000 },
          ].map((u) => (
            <div key={u.label}>
              <div className="mb-2 flex justify-between text-[13px]">
                <span className="text-muted">{u.label}</span>
                <span className="tabular text-fg">{u.used.toLocaleString()} / {u.total.toLocaleString()}</span>
              </div>
              <Progress value={u.used} max={u.total} gradient />
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Invoices">
        <ul className="divide-y divide-line">
          {['September', 'August', 'July', 'June'].map((m, i) => (
            <li key={m} className="flex items-center gap-3 py-3 text-[13px]">
              <Receipt className="size-4 text-faint" />
              <span className="flex-1 text-fg">{m} {new Date().getFullYear()}</span>
              <span className="tabular text-muted">${(174 - i * 0).toFixed(2)}</span>
              <Badge tone="success">Paid</Badge>
              <Button variant="ghost" size="icon-sm" aria-label={`Download ${m} invoice`} onClick={() => toast.success('Invoice ready', `${m}.pdf`)}><Download /></Button>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}

export default function Settings() {
  const [section, setSection] = useState<Section>('appearance')
  const body = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (reducedMotion()) return
      gsap.fromTo('[data-set]', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.06, ease: 'volt.out' })
    },
    { scope: body, dependencies: [section] },
  )

  return (
    <div>
      <PageHeader eyebrow="Workspace" title="Settings" description="Make Volt yours: themes, notifications, members and integrations." />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:sticky lg:top-24 lg:mx-0 lg:flex-col lg:self-start lg:px-0">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              className={cn(
                'flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors [&>span>svg]:size-4',
                section === s.id ? 'bg-surface-3 text-fg' : 'text-muted hover:bg-surface-2 hover:text-fg',
              )}
            >
              <span className={section === s.id ? 'text-primary' : 'text-faint'}>{s.icon}</span>
              <span>
                <span className="block text-[13.5px] font-medium">{s.label}</span>
                <span className="hidden text-[11.5px] text-faint lg:block">{s.hint}</span>
              </span>
            </button>
          ))}
        </nav>
        <div ref={body} className="min-w-0">
          {section === 'appearance' && <Appearance />}
          {section === 'notifications' && <Notifications />}
          {section === 'workspace' && <Workspace />}
          {section === 'integrations' && <Integrations />}
          {section === 'api' && <Api />}
          {section === 'billing' && <Billing />}
        </div>
      </div>
    </div>
  )
}
