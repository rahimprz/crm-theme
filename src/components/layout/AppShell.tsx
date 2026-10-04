import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useTheme } from '@/store/theme'
import { useUI } from '@/store/ui'
import { gsap, ScrollTrigger, useGSAP, reducedMotion } from '@/lib/gsap'
import { useSpotlight } from '@/hooks/useSpotlight'
import { useSidebar } from '@/hooks/useSidebar'
import { useHotkeys } from '@/hooks/useHotkeys'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { MobileTabBar } from './MobileTabBar'
import { Drawer } from '@/components/ui/Drawer'
import { Toaster } from '@/components/ui/Toaster'
import { CommandPalette } from '@/components/crm/CommandPalette'
import { QuickCreate } from '@/components/crm/QuickCreate'
import { RecordDrawers } from '@/components/crm/RecordDrawers'
import { Assistant } from '@/components/crm/Assistant'
import { cn } from '@/lib/cn'

/** The frame around every page: sidebar, topbar, overlays and page transitions. */
export function AppShell() {
  useSpotlight()
  useHotkeys()
  const { reserveRail: collapsed } = useSidebar()
  const grain = useTheme((s) => s.grain)
  const mobileNavOpen = useUI((s) => s.mobileNavOpen)
  const setMobileNavOpen = useUI((s) => s.setMobileNavOpen)
  const location = useLocation()
  const main = useRef<HTMLElement>(null)

  useEffect(() => {
    setMobileNavOpen(false)
    window.scrollTo({ top: 0 })
  }, [location.pathname, setMobileNavOpen])

  // Page transition: each page rises out of a soft blur.
  useGSAP(
    () => {
      if (!reducedMotion()) {
        gsap.fromTo(
          main.current,
          { opacity: 0, y: 16, filter: 'blur(6px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'volt.out', clearProps: 'opacity,transform,filter' },
        )
      }
      const t = window.setTimeout(() => ScrollTrigger.refresh(), 600)
      return () => window.clearTimeout(t)
    },
    { dependencies: [location.pathname] },
  )

  // Layout width changes when the sidebar collapses; recalculate scroll triggers after.
  useEffect(() => {
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 550)
    return () => window.clearTimeout(t)
  }, [collapsed])

  return (
    <div className="relative min-h-dvh">
      {grain && <div className="grain" aria-hidden />}
      <div className="fixed inset-y-0 left-0 z-[45] hidden md:block">
        <Sidebar />
      </div>
      <Drawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} side="left" width="max-w-[300px]">
        <Sidebar mobile onNavigate={() => setMobileNavOpen(false)} onClose={() => setMobileNavOpen(false)} />
      </Drawer>

      <div className={cn('min-w-0 transition-[padding] duration-500 ease-[var(--ease-out-volt)]', collapsed ? 'md:pl-[72px]' : 'md:pl-[272px]')}>
        <Topbar />
        <main ref={main} key={location.pathname} className="mx-auto w-full max-w-[1600px] px-4 pt-6 pb-32 md:px-6 md:pb-16 lg:px-8">
          <Outlet />
        </main>
      </div>

      <MobileTabBar />
      <CommandPalette />
      <QuickCreate />
      <RecordDrawers />
      <Assistant />
      <Toaster />
    </div>
  )
}
