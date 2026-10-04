import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Inbox as InboxIcon,
  Send,
  Archive,
  Star,
  Search,
  Paperclip,
  Reply,
  Forward,
  Sparkles,
  ArrowLeft,
  FileText,
  MailOpen,
  Wand2,
  SendHorizontal,
} from 'lucide-react'
import { useCrm } from '@/store/crm'
import { toast } from '@/store/toast'
import type { EmailThread } from '@/data/types'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { gsap, reducedMotion } from '@/lib/gsap'
import { relativeTime, time } from '@/lib/format'
import { cn } from '@/lib/cn'

type Folder = 'inbox' | 'starred' | 'sent' | 'archive'

const labelTone: Record<string, 'primary' | 'accent' | 'success' | 'c5' | 'neutral' | 'warning'> = {
  Deal: 'primary',
  Priority: 'accent',
  Customer: 'success',
  Internal: 'c5',
  Legal: 'warning',
  Renewal: 'primary',
  System: 'neutral',
}

function summary(t: EmailThread) {
  if (t.id === 'em1') return ['Wants a phased rollout: Denver in November, four more regions in Q1.', 'Two blockers: contractor SSO on Enterprise, and a 36-month price hold.', 'Ready to sign this month if answered by Thursday.']
  return [`${t.fromName.split(' ')[0]} is following up on “${t.subject}”.`, 'No blockers detected. Tone is positive.', 'Suggested next step: reply within 24 hours.']
}

/** Three-pane inbox: folders, threads and a reading pane with an AI summary. */
export default function Inbox() {
  const emails = useCrm((s) => s.emails)
  const setEmailRead = useCrm((s) => s.setEmailRead)
  const toggleStar = useCrm((s) => s.toggleEmailStar)
  const archive = useCrm((s) => s.archiveEmail)
  const navigate = useNavigate()
  const [folder, setFolder] = useState<Folder>('inbox')
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(emails[0]?.id ?? null)
  const [mobileReading, setMobileReading] = useState(false)
  const [reply, setReply] = useState('')
  const pane = useRef<HTMLDivElement>(null)

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return emails
      .filter((e) => (folder === 'starred' ? e.starred : e.folder === folder))
      .filter((e) => !q || e.subject.toLowerCase().includes(q) || e.fromName.toLowerCase().includes(q) || e.preview.toLowerCase().includes(q))
      .sort((a, b) => b.at.localeCompare(a.at))
  }, [emails, folder, query])

  const thread = emails.find((e) => e.id === openId)

  useEffect(() => {
    if (thread?.unread) setEmailRead(thread.id, true)
  }, [thread, setEmailRead])

  useLayoutEffect(() => {
    if (!pane.current || reducedMotion()) return
    gsap.fromTo(pane.current.querySelectorAll('[data-read]'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'volt.out' })
  }, [openId])

  const folders: { id: Folder; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'inbox', label: 'Inbox', icon: <InboxIcon />, count: emails.filter((e) => e.folder === 'inbox' && e.unread).length },
    { id: 'starred', label: 'Starred', icon: <Star />, count: emails.filter((e) => e.starred).length },
    { id: 'sent', label: 'Sent', icon: <Send /> },
    { id: 'archive', label: 'Archive', icon: <Archive /> },
  ]

  return (
    <div>
      <PageHeader eyebrow="Workspace" title="Inbox" description="Email synced with your records. Every thread links to its person and company." />
      <div className="card grid min-h-[640px] overflow-hidden md:grid-cols-[200px_minmax(0,320px)_minmax(0,1fr)] lg:grid-cols-[220px_minmax(0,380px)_minmax(0,1fr)]">
        <nav className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line p-2 md:flex-col md:border-r md:border-b-0 md:p-3">
          {folders.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFolder(f.id)}
              className={cn('flex h-9 shrink-0 items-center gap-2.5 rounded-lg px-3 text-[13px] font-medium transition-colors [&_svg]:size-4', folder === f.id ? 'bg-surface-3 text-fg' : 'text-muted hover:bg-surface-2 hover:text-fg')}
            >
              <span className={folder === f.id ? 'text-primary' : 'text-faint'}>{f.icon}</span>
              {f.label}
              {f.count ? <span className="tabular ml-auto rounded-full bg-primary/15 px-1.5 text-[11px] text-primary">{f.count}</span> : null}
            </button>
          ))}
          <div className="mt-4 hidden md:block">
            <div className="eyebrow px-3 pb-2">Labels</div>
            {Object.entries(labelTone).slice(0, 5).map(([l, t]) => (
              <div key={l} className="flex h-8 items-center gap-2.5 px-3 text-[12.5px] text-muted">
                <span className="size-2 rounded-full" style={{ background: `var(--${t === 'neutral' ? 'faint' : t})` }} />
                {l}
              </div>
            ))}
          </div>
        </nav>

        <div className={cn('flex min-w-0 flex-col border-line md:border-r', mobileReading && 'hidden md:flex')}>
          <div className="border-b border-line p-3">
            <Input id="inbox-search" icon={<Search />} placeholder="Search mail…" value={query} onChange={(e) => setQuery(e.target.value)} className="h-9" />
          </div>
          <ul className="flex-1 overflow-y-auto">
            {list.length === 0 && <EmptyState icon={<MailOpen />} title="All clear" description="No conversations here." />}
            {list.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => {
                    setOpenId(e.id)
                    setMobileReading(true)
                  }}
                  className={cn(
                    'relative flex w-full gap-3 border-b border-line/60 px-4 py-3.5 text-left transition-colors',
                    openId === e.id ? 'bg-primary/[0.07]' : 'hover:bg-surface-2',
                  )}
                >
                  {openId === e.id && <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-primary shadow-[0_0_10px_var(--primary)]" />}
                  <Avatar name={e.fromName} hue={e.hue} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn('truncate text-[13.5px]', e.unread ? 'font-semibold text-fg' : 'text-muted')}>{e.fromName}</span>
                      <span className="shrink-0 text-[11px] text-faint">{relativeTime(e.at)}</span>
                    </div>
                    <div className={cn('mt-0.5 truncate text-[13px]', e.unread ? 'font-medium text-fg' : 'text-muted')}>{e.subject}</div>
                    <div className="mt-0.5 line-clamp-1 text-[12.5px] text-faint">{e.preview}</div>
                    <div className="mt-2 flex items-center gap-1.5">
                      {e.labels.slice(0, 2).map((l) => (
                        <Badge key={l} tone={labelTone[l] ?? 'neutral'}>{l}</Badge>
                      ))}
                      {e.attachments && <Paperclip className="size-3 text-faint" />}
                      {e.messages > 1 && <span className="tabular text-[11px] text-faint">{e.messages}</span>}
                      {e.unread && <span className="ml-auto size-2 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div ref={pane} className={cn('min-w-0 flex-col', mobileReading ? 'flex' : 'hidden md:flex')}>
          {!thread ? (
            <EmptyState icon={<MailOpen />} title="Pick a conversation" description="Select a thread to read it here." />
          ) : (
            <>
              <div className="flex items-center gap-1 border-b border-line px-3 py-2" data-read>
                <Button variant="ghost" size="icon-sm" className="md:hidden" onClick={() => setMobileReading(false)} aria-label="Back">
                  <ArrowLeft />
                </Button>
                <Button variant="ghost" size="sm" icon={<Archive />} onClick={() => { archive(thread.id); toast.success('Archived', thread.subject) }}>
                  Archive
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => toggleStar(thread.id)} aria-label="Star">
                  <Star className={cn(thread.starred && 'fill-accent text-accent')} />
                </Button>
                <span className="ml-auto text-[12px] text-faint">{time(thread.at)}</span>
              </div>
              <div className="flex-1 space-y-5 overflow-y-auto p-5 md:p-6">
                <div data-read>
                  <h2 className="font-display text-[20px] leading-snug font-semibold text-fg">{thread.subject}</h2>
                  <div className="mt-3 flex items-center gap-3">
                    <Avatar name={thread.fromName} hue={thread.hue} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[13.5px] font-medium text-fg">{thread.fromName}</div>
                      <div className="truncate text-[12px] text-faint">{thread.fromEmail}</div>
                    </div>
                    {thread.contactId && (
                      <Button variant="secondary" size="sm" onClick={() => navigate(`/contacts/${thread.contactId}`)}>
                        View person
                      </Button>
                    )}
                  </div>
                </div>

                <div data-read className="beam relative overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface-2 p-4">
                  <div className="mb-2 flex items-center gap-2 text-[12.5px] font-semibold">
                    <Sparkles className="size-4 text-accent" />
                    <span className="text-volt">Volt AI summary</span>
                  </div>
                  <ul className="space-y-1.5 text-[13px] text-muted">
                    {summary(thread).map((s) => (
                      <li key={s} className="flex gap-2">
                        <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div data-read className="space-y-3 text-[14px] leading-relaxed text-fg/90">
                  {thread.body.map((p, i) => (
                    <p key={i} className="whitespace-pre-line">{p}</p>
                  ))}
                </div>

                {thread.attachments && (
                  <div data-read className="flex flex-wrap gap-2">
                    {thread.attachments.map((a) => (
                      <button key={a.name} type="button" onClick={() => toast.info('Preview', a.name)} className="flex items-center gap-2.5 rounded-lg border border-line bg-surface-2 px-3 py-2 text-left transition-colors hover:border-line-strong">
                        <span className="flex size-8 items-center justify-center rounded-md bg-primary/12 text-primary"><FileText className="size-4" /></span>
                        <span>
                          <span className="block text-[12.5px] font-medium text-fg">{a.name}</span>
                          <span className="block text-[11px] text-faint">{a.size}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <form
                data-read
                className="border-t border-line p-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!reply.trim()) return
                  toast.success('Reply sent', `To ${thread.fromName}`)
                  setReply('')
                }}
              >
                <div className="rounded-[var(--radius-lg)] border border-line bg-surface-2 p-2 focus-within:border-primary/50">
                  <textarea
                    id="inbox-reply"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder={`Reply to ${thread.fromName.split(' ')[0]}…`}
                    className="min-h-16 w-full resize-none bg-transparent px-2 py-1.5 text-[13.5px] text-fg outline-none placeholder:text-faint"
                  />
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" icon={<Wand2 />} onClick={() => setReply(`Hi ${thread.fromName.split(' ')[0]},\n\nThanks for the detail. Enterprise includes SSO for contractors via SCIM, and we can hold per-seat pricing for the full 36 months. I'll send the updated order form today.\n\nBest,\nAlex`)}>
                      Draft with AI
                    </Button>
                    <Button variant="ghost" size="icon-sm" aria-label="Attach" onClick={() => toast.info('Attach a file')}><Paperclip /></Button>
                    <Button variant="ghost" size="icon-sm" aria-label="Forward" onClick={() => toast.info('Forward', thread.subject)} className="hidden sm:inline-flex"><Forward /></Button>
                    <Button type="submit" variant="primary" size="sm" icon={reply ? <SendHorizontal /> : <Reply />} className="ml-auto" disabled={!reply.trim()}>
                      Send
                    </Button>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
