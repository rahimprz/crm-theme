import { useRef, useState, type ReactNode } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { Plus } from 'lucide-react'
import { gsap, useGSAP, reducedMotion } from '@/lib/gsap'
import { cn } from '@/lib/cn'

export interface KanbanColumn<T> {
  id: string
  title: string
  color: string
  items: T[]
  summary?: ReactNode
}

interface Props<T> {
  columns: KanbanColumn<T>[]
  getId: (item: T) => string
  renderCard: (item: T, state: { overlay: boolean }) => ReactNode
  onMove: (itemId: string, toColumn: string, fromColumn: string, point?: { x: number; y: number }) => void
  onAdd?: (columnId: string) => void
}

function DraggableCard({ id, column, children }: { id: string; column: string; children: ReactNode }) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({ id, data: { column } })
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      data-kanban-card
      className={cn(
        'touch-manipulation outline-none',
        isDragging && 'rounded-[var(--radius-lg)] opacity-30 [&>*]:border-dashed [&>*]:border-primary/50',
      )}
    >
      {children}
    </div>
  )
}

function Column<T>({
  col,
  getId,
  renderCard,
  onAdd,
}: {
  col: KanbanColumn<T>
  getId: (item: T) => string
  renderCard: Props<T>['renderCard']
  onAdd?: (id: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id })
  return (
    <section
      data-kanban-col
      className={cn(
        'flex w-[min(300px,82vw)] shrink-0 snap-start flex-col rounded-[var(--radius-xl)] border bg-surface/40 transition-[border-color,background-color,box-shadow] duration-200',
        isOver ? 'border-primary/50 bg-primary/5 shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_10%,transparent)]' : 'border-line',
      )}
    >
      <header className="flex items-center gap-2 px-3.5 pt-3.5 pb-2">
        <span className="size-2 rounded-full" style={{ background: col.color, boxShadow: `0 0 10px ${col.color}` }} />
        <h3 className="text-[13px] font-semibold text-fg">{col.title}</h3>
        <span className="tabular rounded-full bg-surface-3 px-1.5 text-[11px] font-medium text-muted">{col.items.length}</span>
        {onAdd && (
          <button
            type="button"
            onClick={() => onAdd(col.id)}
            className="ml-auto flex size-6 items-center justify-center rounded-md text-faint hover:bg-surface-3 hover:text-fg"
            aria-label={`Add to ${col.title}`}
          >
            <Plus className="size-3.5" />
          </button>
        )}
      </header>
      {col.summary && <div className="px-3.5 pb-2">{col.summary}</div>}
      <div ref={setNodeRef} className="flex min-h-[140px] flex-1 flex-col gap-2.5 p-2.5 pt-1">
        {col.items.map((item) => (
          <DraggableCard key={getId(item)} id={getId(item)} column={col.id}>
            {renderCard(item, { overlay: false })}
          </DraggableCard>
        ))}
        {col.items.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-line-strong p-6 text-center text-[12.5px] text-faint">
            Drop a card here
          </div>
        )}
      </div>
    </section>
  )
}

/**
 * Drag-and-drop board. Cards lift and tilt while dragged, columns glow when
 * hovered, and cards cascade in on first render. Works with mouse, touch
 * (press and hold) and keyboard (space to pick up, arrows to move).
 */
export function KanbanBoard<T>({ columns, getId, renderCard, onMove, onAdd }: Props<T>) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<T | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  )

  useGSAP(
    () => {
      if (reducedMotion()) return
      gsap.from('[data-kanban-col]', { opacity: 0, y: 30, duration: 0.7, stagger: 0.07, ease: 'volt.out' })
      gsap.from('[data-kanban-card]', { opacity: 0, y: 24, scale: 0.97, duration: 0.6, stagger: 0.025, delay: 0.15, ease: 'volt.out', clearProps: 'transform' })
    },
    { scope: ref },
  )

  const findItem = (id: string) => {
    for (const c of columns) {
      const item = c.items.find((i) => getId(i) === id)
      if (item) return item
    }
    return null
  }

  const onStart = (e: DragStartEvent) => setActive(findItem(String(e.active.id)))
  const onEnd = (e: DragEndEvent) => {
    setActive(null)
    const from = e.active.data.current?.column as string | undefined
    const to = e.over?.id as string | undefined
    if (!from || !to || from === to) return
    const rect = e.active.rect.current.translated
    onMove(String(e.active.id), to, from, rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : undefined)
  }

  return (
    <DndContext sensors={sensors} onDragStart={onStart} onDragEnd={onEnd} onDragCancel={() => setActive(null)}>
      <div ref={ref} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 md:mx-0 md:px-0">
        {columns.map((col) => (
          <Column key={col.id} col={col} getId={getId} renderCard={renderCard} onAdd={onAdd} />
        ))}
      </div>
      <DragOverlay dropAnimation={{ duration: 280, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}>
        {active ? (
          <div className="rotate-[2.5deg] scale-[1.04] cursor-grabbing drop-shadow-[0_24px_40px_rgb(0_0_0/0.45)] transition-transform">
            {renderCard(active, { overlay: true })}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
