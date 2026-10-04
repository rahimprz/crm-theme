import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Sparkles, X, SendHorizontal, Bot } from 'lucide-react'
import { useUI } from '@/store/ui'
import { useCrm } from '@/store/crm'
import { gsap, reducedMotion } from '@/lib/gsap'
import { usePresence } from '@/hooks/usePresence'
import { money, dayDiff } from '@/lib/format'
import { cn } from '@/lib/cn'

interface Message {
  id: number
  role: 'user' | 'ai'
  text: string
}

const suggestions = ['Summarize my pipeline', 'Which deals are at risk?', 'Who should I call today?', 'Draft a follow-up to Solstice']

/** Answers are computed from live CRM data, so they change as you edit records. */
function useAnswer() {
  const { deals, leads, companies } = useCrm()
  return (q: string): string => {
    const s = q.toLowerCase()
    const open = deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost')
    if (s.includes('pipeline') || s.includes('summar')) {
      const total = open.reduce((a, d) => a + d.value, 0)
      const weighted = open.reduce((a, d) => a + (d.value * d.probability) / 100, 0)
      const won = deals.filter((d) => d.stage === 'won')
      const neg = open.filter((d) => d.stage === 'negotiation')
      return `You have ${open.length} open deals worth ${money(total, true)} (${money(weighted, true)} weighted). ${neg.length} are in Negotiation and could close this month. You've won ${won.length} deals for ${money(won.reduce((a, d) => a + d.value, 0), true)} so far. Biggest open deal: ${[...open].sort((a, b) => b.value - a.value)[0]?.name ?? 'none'}.`
    }
    if (s.includes('risk')) {
      const risky = open
        .filter((d) => dayDiff(d.closeDate) < 21 && d.probability < 60)
        .sort((a, b) => b.value - a.value)
        .slice(0, 3)
      if (!risky.length) return 'Nothing looks at risk right now. Every deal closing in the next 3 weeks is at 60% or higher.'
      return `${risky.length} deals close within 3 weeks but are below 60%:\n${risky.map((d) => `• ${d.name} · ${money(d.value, true)} · ${d.probability}%`).join('\n')}\nI'd book a pricing call on the first one today.`
    }
    if (s.includes('call')) {
      const hot = leads.filter((l) => l.status !== 'lost').sort((a, b) => b.score - a.score).slice(0, 3)
      return `Your three hottest leads:\n${hot.map((l) => `• ${l.name} at ${l.company} · score ${l.score}`).join('\n')}\nMid-morning on Tuesday and Wednesday gets the best reply rates.`
    }
    if (s.includes('draft') || s.includes('follow')) {
      const co = companies.find((c) => s.includes(c.name.split(' ')[0].toLowerCase())) ?? companies[4]
      return `Here's a draft for ${co.name}:\n\nSubject: Next steps on your rollout\n\nHi team, thanks again for the time this week. I've attached the updated pricing with contractor SSO included and the 36-month price hold you asked about. Would Thursday at 2pm work to walk procurement through it?\n\nBest, Alex`
    }
    return 'I can summarize your pipeline, flag at-risk deals, suggest who to call, or draft follow-up emails. Try one of the suggestions below.'
  }
}

export function Assistant() {
  const open = useUI((s) => s.assistantOpen)
  const setOpen = useUI((s) => s.setAssistantOpen)
  const answer = useAnswer()
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: 'ai', text: 'Hi Alex. I can read your pipeline, leads and tasks. Ask me anything, or start with a suggestion.' },
  ])
  const [typing, setTyping] = useState(false)
  const [input, setInput] = useState('')
  const scroller = useRef<HTMLDivElement>(null)
  const fab = useRef<HTMLButtonElement>(null)

  const ask = (q: string) => {
    if (!q.trim() || typing) return
    setMessages((m) => [...m, { id: Date.now(), role: 'user', text: q }])
    setInput('')
    setTyping(true)
    window.setTimeout(() => {
      setTyping(false)
      setMessages((m) => [...m, { id: Date.now() + 1, role: 'ai', text: answer(q) }])
    }, 900)
  }

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  // Reveal the newest AI message word by word.
  useLayoutEffect(() => {
    const last = scroller.current?.querySelector('[data-msg]:last-of-type[data-role="ai"]')
    if (!last || reducedMotion()) return
    gsap.fromTo(last.querySelectorAll('[data-word]'), { opacity: 0, y: 4, filter: 'blur(4px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.3, stagger: 0.012, ease: 'power2.out' })
  }, [messages.length])

  const { mounted, ref } = usePresence<HTMLDivElement>(open, {
    enter: (el) =>
      gsap.fromTo(el, { opacity: 0, scale: 0.85, y: 20, filter: 'blur(10px)' }, { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', duration: 0.55, ease: 'volt.out', clearProps: 'filter' }),
    exit: (el) => gsap.to(el, { opacity: 0, scale: 0.9, y: 16, duration: 0.22, ease: 'power2.in' }),
  })

  return createPortal(
    <>
      <button
        ref={fab}
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close Volt AI' : 'Ask Volt AI'}
        className="group fixed right-4 bottom-[calc(84px+env(safe-area-inset-bottom))] z-[60] flex size-13 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95 md:right-6 md:bottom-6"
      >
        <span className="absolute inset-0 animate-[spin_6s_linear_infinite] rounded-full" style={{ background: 'conic-gradient(from 0deg, var(--primary), var(--accent), var(--c5), var(--primary))' }} />
        <span className="absolute inset-[2px] rounded-full bg-surface" />
        <span className="absolute inset-0 rounded-full opacity-60 blur-lg" style={{ background: 'conic-gradient(from 0deg, var(--primary), var(--accent), var(--primary))' }} />
        <span className="relative text-fg">{open ? <X className="size-5" /> : <Sparkles className="size-5 text-accent" />}</span>
      </button>
      {mounted && (
        <div
          ref={ref}
          role="dialog"
          aria-label="Volt AI assistant"
          className="popover beam fixed right-3 bottom-[calc(148px+env(safe-area-inset-bottom))] z-[60] flex h-[min(540px,64vh)] w-[min(400px,calc(100vw-24px))] origin-bottom-right flex-col overflow-hidden md:right-6 md:bottom-24"
        >
          <header className="relative flex items-center gap-3 overflow-hidden border-b border-line px-4 py-3">
            <div className="aurora opacity-60">
              <span />
              <span />
            </div>
            <span className="relative flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Bot className="size-5" />
            </span>
            <div className="relative min-w-0 flex-1">
              <h3 className="text-[14px] font-semibold">
                <span className="text-volt">Volt AI</span>
              </h3>
              <p className="flex items-center gap-1.5 text-[11.5px] text-muted">
                <span className="pulse-dot size-1.5 rounded-full bg-success text-success" /> Reading 4 objects, live
              </p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="relative flex size-8 items-center justify-center rounded-lg text-faint hover:bg-surface-3 hover:text-fg" aria-label="Close">
              <X className="size-4" />
            </button>
          </header>
          <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m) => (
              <div key={m.id} data-msg data-role={m.role} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-line',
                    m.role === 'user' ? 'rounded-br-md bg-primary text-primary-fg' : 'rounded-bl-md border border-line bg-surface-3 text-fg',
                  )}
                >
                  {m.role === 'ai'
                    ? m.text.split(/(\s+)/).map((w, i) => (
                        <span key={i} data-word={w.trim() ? '' : undefined} className="inline-block whitespace-pre">
                          {w}
                        </span>
                      ))
                    : m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-line bg-surface-3 px-3.5 py-3 w-fit">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="size-1.5 animate-bounce rounded-full bg-muted" style={{ animationDelay: `${i * 120}ms` }} />
                ))}
              </div>
            )}
          </div>
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 pb-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => ask(s)}
                className="shrink-0 rounded-full border border-line-strong bg-surface-2 px-3 py-1.5 text-[12px] text-muted transition-colors hover:border-primary/50 hover:text-fg"
              >
                {s}
              </button>
            ))}
          </div>
          <form
            className="flex items-center gap-2 border-t border-line p-3"
            onSubmit={(e) => {
              e.preventDefault()
              ask(input)
            }}
          >
            <input
              id="assistant-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about deals, leads, tasks…"
              className="h-10 flex-1 rounded-lg border border-line bg-surface-2 px-3 text-[13px] text-fg outline-none placeholder:text-faint focus:border-primary/60"
            />
            <button type="submit" disabled={!input.trim()} className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-fg transition-all hover:brightness-110 disabled:opacity-40" aria-label="Send">
              <SendHorizontal className="size-4" />
            </button>
          </form>
        </div>
      )}
    </>,
    document.body,
  )
}
