# Volt CRM

An animated, themeable CRM front end built with React, GSAP and Tailwind. It's dark-first, with an electric blue and volt yellow palette on ink black, and covers everything a modern CRM like Twenty needs: leads, deals, people, companies, tasks, calendar, inbox, reports and workflows.

It's a front-end design system with realistic sample data. Every screen works: you can drag deals, convert leads, check off tasks and switch themes. Changes are saved in the browser.

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build in dist/
npm run build:single # one self-contained HTML file in dist-single/ (handy for sharing)
```

## What's inside

| Area | Highlights |
| --- | --- |
| **Dashboard** | Letter-by-letter greeting, quota gauge, KPI tiles that count up, revenue chart with crosshair tooltip, live pipeline funnel, top deals, lead-source donut, team activity, today's agenda, leaderboard, reply-rate heatmap, deals closing soon |
| **Leads** | Sortable table, filter tabs, status filter, bulk actions bar, board view with drag and drop, lead drawer with score breakdown and **Convert to deal** |
| **Deals** | Kanban pipeline with drag and drop (mouse, touch, keyboard). Dropping a deal on *Closed won* fires confetti. Includes a table view, owner filter and stage stepper drawer |
| **People** | Grid/list toggle that morphs with GSAP Flip, stage chips, quick actions |
| **Companies** | 3D tilt cards with health rings; Twenty-style record pages with fields, timeline, deals, tasks, notes and emails |
| **Tasks** | Grouped by urgency, sparkle on completion, rows glide between groups (Flip), quick add with priority |
| **Calendar** | Month grid with animated month switching, agenda panel, event popups, new-event modal |
| **Inbox** | Three-pane mail with an AI summary card and an AI reply draft |
| **Reports** | Pinned horizontal "quarter in review" story driven by scroll, stacked revenue mix, win rate, conversion funnel and forecast |
| **Workflows** | Automation list with animated switches and a node canvas with flowing connectors |
| **Settings** | Theme studio (mode, 8 palettes, corners, density, motion, grain), notifications matrix, members, integrations, API keys and billing |
| **Everywhere** | ⌘K command palette, quick-create modal, notifications popover, toasts, Volt AI assistant, collapsible sidebar, mobile drawer and bottom tab bar |

## How to manage it

### Change colors or add a theme

Everything color-related lives in **`src/config/themes.ts`**.

- **Modes** (`dark`, `midnight`, `light`) define the neutral canvas: background, surfaces, borders and text.
- **Palettes** define the brand colors painted on top: `primary`, `accent` and three chart hues.

To add a palette, copy an entry in `palettes`, give it a new `id`, `name` and colors, and save. It shows up automatically in Settings, the topbar picker and the command palette. Set the default in `DEFAULT_THEME`.

Components never use raw hex values. They use tokens like `bg-surface`, `text-muted`, `bg-primary` and `border-line`, so a palette change restyles the whole app.

### Add a page

1. Create `src/pages/MyPage.tsx` (copy any page as a starting point).
2. Add a route in `src/App.tsx`.
3. Add a nav entry in `src/config/navigation.ts`, with an icon, an optional hotkey and an optional mobile flag.

The sidebar, mobile menu and ⌘K palette all read from `navigation.ts`.

### Edit or connect data

- Sample records live in `src/data/mock.ts`. Dashboard and report time series live in `src/data/analytics.ts`.
- Record shapes are typed in `src/data/types.ts`.
- All reads and writes go through the Zustand store in `src/store/crm.ts`. To connect a real backend, replace the seed arrays with API calls and make the actions (`addLead`, `moveDeal`, …) call your API.
- Status labels and colors (lead statuses, deal stages, priorities) are defined once in `src/components/crm/meta.tsx`.

### Rearrange the dashboard

Each widget is its own file in `src/components/dashboard/`. `src/pages/Dashboard.tsx` is only a grid, so you can reorder, remove or resize widgets there.

### Animation toolkit

| Tool | Where | Use |
| --- | --- | --- |
| `data-reveal` + `useReveal(ref)` | `src/hooks/useReveal.ts` | Scroll-triggered rise-in for any element. Use `data-reveal="scale"` or `"left"` for variants |
| `<AnimatedNumber>` | `components/ui` | Counts up when visible, then tweens between values |
| `<PageHeader>` | `components/layout` | Title words rise out of a mask (SplitText) |
| `usePresence` | `src/hooks` | Mount/unmount with GSAP enter and exit animations (used by modals, drawers and popovers) |
| `.spotlight` / `.beam` | `styles/index.css` | Cursor-following glow and a travelling border light for cards |
| `celebrate()` / `sparkle()` | `src/lib/confetti.ts` | Confetti in the current theme colors |

House easings are registered in `src/lib/gsap.ts` as `volt` and `volt.out`. Settings → Motion → *Reduce motion*, or the OS setting, turns animations off everywhere.

### Keyboard shortcuts

| Keys | Action |
| --- | --- |
| `⌘K` / `Ctrl K` / `/` | Command palette |
| `N` | New lead |
| `G` then `D` `I` `T` `C` `L` `P` `O` `M` `R` `W` `S` | Go to page |
| `[` | Collapse sidebar |
| `Shift D` | Toggle light/dark |

## Project structure

```
src/
  config/       themes.ts (colors) · navigation.ts (pages)
  data/         types · mock records · analytics series
  store/        crm (records) · theme · ui · toast
  lib/          gsap setup · formatters · chart math · confetti
  hooks/        reveal · presence · spotlight · hotkeys · size · magnetic
  components/
    ui/         Button, Switch, ThemeToggle, SegmentedControl, Tabs, Modal,
                Drawer, Popover, Tooltip, Toaster, Avatar, Badge, Progress…
    charts/     AreaChart, BarChart, Donut, Sparkline, Heatmap (SVG + GSAP)
    crm/        CommandPalette, QuickCreate, KanbanBoard, record drawers,
                ActivityTimeline, NotificationsPanel, PalettePicker, Assistant
    dashboard/  one file per dashboard widget
    layout/     AppShell, Sidebar, Topbar, MobileTabBar, PageHeader
  pages/        one file per screen
  styles/       index.css (design tokens and signature effects)
```

## Tech

React 19 · TypeScript · Vite · Tailwind CSS 4 · GSAP 3 (ScrollTrigger, SplitText, Flip, CustomEase) · Zustand · dnd-kit · Lucide icons · canvas-confetti · self-hosted Geist and Bricolage Grotesque fonts.
