import { NavLink } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { navigation } from '@/config/navigation'
import { useUI } from '@/store/ui'
import { cn } from '@/lib/cn'

/** Bottom navigation for phones with a center create button. */
export function MobileTabBar() {
  const openQuickCreate = useUI((s) => s.openQuickCreate)
  const items = navigation.flatMap((g) => g.items).filter((i) => i.mobile)
  const left = items.slice(0, 2)
  const right = items.slice(2, 4)

  const Tab = ({ item }: { item: (typeof items)[number] }) => (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      className={({ isActive }) => cn('relative flex flex-1 flex-col items-center gap-1 py-1.5 text-[10.5px] font-medium transition-colors', isActive ? 'text-fg' : 'text-faint')}
    >
      {({ isActive }) => (
        <>
          <item.icon className={cn('size-5 transition-transform duration-300', isActive && '-translate-y-0.5 text-primary')} />
          {item.label}
          <span className={cn('absolute -top-px h-[2px] w-6 rounded-full bg-primary shadow-[0_0_10px_var(--primary)] transition-all duration-300', isActive ? 'opacity-100' : 'opacity-0 scale-x-0')} />
        </>
      )}
    </NavLink>
  )

  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-50 border-t border-line pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex h-16 items-center px-2">
        {left.map((i) => (
          <Tab key={i.id} item={i} />
        ))}
        <div className="flex flex-1 justify-center">
          <button
            type="button"
            onClick={() => openQuickCreate('lead')}
            className="-mt-7 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-fg shadow-[0_10px_30px_-6px_var(--primary)] ring-4 ring-bg transition-transform active:scale-90"
            aria-label="Create"
          >
            <Plus className="size-6" />
          </button>
        </div>
        {right.map((i) => (
          <Tab key={i.id} item={i} />
        ))}
      </div>
    </nav>
  )
}
