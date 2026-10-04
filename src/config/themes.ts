/**
 * ─────────────────────────────────────────────────────────────
 *  THEME CONFIG — the one file to edit for colors.
 * ─────────────────────────────────────────────────────────────
 *
 *  A theme is made of two independent parts:
 *
 *  1. MODE     → the neutral "canvas" (background, surfaces, borders, text).
 *                Dark, Midnight (pure black) and Light.
 *  2. PALETTE  → the brand colors painted on top (primary + accent + chart hues).
 *
 *  Any mode works with any palette, so 3 modes × 7 palettes = 21 looks.
 *
 *  To add a palette: copy one entry in `palettes`, change the id/name/colors,
 *  and it appears automatically in Settings → Appearance, the topbar palette
 *  picker and the command palette. Nothing else to wire up.
 *
 *  Neutrals are tinted slightly toward the palette's primary color
 *  (see `tint` on each mode), so every palette gets its own atmosphere.
 */

export type ModeId = 'dark' | 'midnight' | 'light'

export interface ModeColors {
  bg: string
  surface: string
  surface2: string
  surface3: string
  line: string
  lineStrong: string
  fg: string
  muted: string
  faint: string
  success: string
  warning: string
  danger: string
}

export interface Mode {
  id: ModeId
  name: string
  description: string
  isDark: boolean
  /** How strongly the neutrals are tinted toward the palette's primary (0–1). */
  tint: number
  colors: ModeColors
}

export interface PaletteColors {
  /** Buttons, active navigation, links, first chart series. */
  primary: string
  /** Highlights, badges, second chart series, celebratory moments. */
  accent: string
  /** Three extra hues used by multi-series charts (donuts, stacked bars). */
  chart: [string, string, string]
}

export interface Palette {
  id: string
  name: string
  description: string
  dark: PaletteColors
  /** Optional deeper variants so colors keep contrast on light backgrounds. */
  light?: Partial<PaletteColors>
}

export const modes: Mode[] = [
  {
    id: 'dark',
    name: 'Dark',
    description: 'Deep ink canvas, easy on the eyes',
    isDark: true,
    tint: 0.05,
    colors: {
      bg: '#08090d',
      surface: '#0f1117',
      surface2: '#151821',
      surface3: '#1c202b',
      line: '#1f2330',
      lineStrong: '#2c3243',
      fg: '#eef1f7',
      muted: '#9aa2b5',
      faint: '#5f677a',
      success: '#2fd68f',
      warning: '#ff9f43',
      danger: '#ff5d6c',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'True black for OLED screens',
    isDark: true,
    tint: 0.025,
    colors: {
      bg: '#000000',
      surface: '#07080a',
      surface2: '#0d0e12',
      surface3: '#15171c',
      line: '#18191f',
      lineStrong: '#262931',
      fg: '#f5f6f8',
      muted: '#9097a6',
      faint: '#565c69',
      success: '#2fd68f',
      warning: '#ff9f43',
      danger: '#ff5d6c',
    },
  },
  {
    id: 'light',
    name: 'Light',
    description: 'Crisp paper white for daylight',
    isDark: false,
    tint: 0.035,
    colors: {
      bg: '#f3f4f7',
      surface: '#ffffff',
      surface2: '#f7f8fa',
      surface3: '#eceef3',
      line: '#e3e6ed',
      lineStrong: '#d0d5df',
      fg: '#0c0e14',
      muted: '#586073',
      faint: '#8b92a2',
      success: '#0e9f6e',
      warning: '#d97706',
      danger: '#e11d48',
    },
  },
]

export const palettes: Palette[] = [
  {
    id: 'volt',
    name: 'Volt',
    description: 'Electric blue with a jolt of yellow',
    dark: { primary: '#4c8dff', accent: '#ffd23f', chart: ['#34d3a6', '#ff7a59', '#b18cff'] },
    light: { primary: '#2563eb', accent: '#e0a800', chart: ['#0f9f78', '#e8572f', '#7c5cff'] },
  },
  {
    id: 'hornet',
    name: 'Hornet',
    description: 'Yellow-led, with cobalt blue support',
    dark: { primary: '#ffc929', accent: '#3d8bff', chart: ['#34d3a6', '#ff7a59', '#b18cff'] },
    light: { primary: '#c98d00', accent: '#2563eb', chart: ['#0f9f78', '#e8572f', '#7c5cff'] },
  },
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Violet skies and mint light',
    dark: { primary: '#8b7cff', accent: '#3ee6b0', chart: ['#ffb547', '#ff6f91', '#4cc3ff'] },
    light: { primary: '#6d4aff', accent: '#0fa37a', chart: ['#d98a00', '#e0457b', '#0b8fd6'] },
  },
  {
    id: 'ember',
    name: 'Ember',
    description: 'Glowing coals and warm gold',
    dark: { primary: '#ff6b3d', accent: '#ffc24b', chart: ['#4cc3ff', '#34d3a6', '#c08cff'] },
    light: { primary: '#e8501f', accent: '#c98a00', chart: ['#0b8fd6', '#0f9f78', '#8b5cf6'] },
  },
  {
    id: 'lagoon',
    name: 'Lagoon',
    description: 'Tropical cyan with lime',
    dark: { primary: '#22c7e8', accent: '#b6f23e', chart: ['#ff8a5c', '#a98bff', '#ff6fae'] },
    light: { primary: '#0891b2', accent: '#5f9a0b', chart: ['#e8572f', '#7c5cff', '#db2777'] },
  },
  {
    id: 'sakura',
    name: 'Sakura',
    description: 'Blossom pink and lavender',
    dark: { primary: '#ff6fae', accent: '#a98bff', chart: ['#ffd23f', '#34d3a6', '#4cc3ff'] },
    light: { primary: '#db2777', accent: '#7c5cff', chart: ['#c98a00', '#0f9f78', '#0b8fd6'] },
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Emerald green with amber light',
    dark: { primary: '#2fd68f', accent: '#ffb547', chart: ['#4cc3ff', '#b18cff', '#ff7a59'] },
    light: { primary: '#0e9f6e', accent: '#c27c00', chart: ['#0b8fd6', '#7c5cff', '#e8572f'] },
  },
  {
    id: 'graphite',
    name: 'Graphite',
    description: 'Monochrome with a yellow signal',
    dark: { primary: '#e9ebf0', accent: '#ffd23f', chart: ['#4c8dff', '#34d3a6', '#ff7a59'] },
    light: { primary: '#15171d', accent: '#d49b00', chart: ['#2563eb', '#0f9f78', '#e8572f'] },
  },
]

/* ───────────────────────── Shape & feel ───────────────────────── */

export const radii = {
  sharp: { label: 'Sharp', base: 6 },
  soft: { label: 'Soft', base: 12 },
  round: { label: 'Round', base: 18 },
} as const
export type RadiusId = keyof typeof radii

export const DEFAULT_THEME = {
  mode: 'dark' as ModeId,
  palette: 'volt',
  radius: 'soft' as RadiusId,
}

/* ───────────────────────── Engine (no need to edit) ───────────────────────── */

export function getMode(id: string): Mode {
  return modes.find((m) => m.id === id) ?? modes[0]
}

export function getPalette(id: string): Palette {
  return palettes.find((p) => p.id === id) ?? palettes[0]
}

export function resolvePalette(palette: Palette, mode: Mode): PaletteColors {
  if (mode.isDark || !palette.light) return palette.dark
  return { ...palette.dark, ...palette.light } as PaletteColors
}

/** Returns black or white, whichever reads better on the given color. */
export function readableOn(hex: string): string {
  const c = hex.replace('#', '')
  const n = parseInt(c.length === 3 ? c.replace(/./g, '$&$&') : c, 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return lum > 0.4 ? '#0a0b10' : '#ffffff'
}

/** Writes every theme token as a CSS variable on <html>. */
export function applyTheme(opts: { mode: string; palette: string; radius: RadiusId }) {
  const mode = getMode(opts.mode)
  const pal = resolvePalette(getPalette(opts.palette), mode)
  const root = document.documentElement
  const c = mode.colors
  const vars: Record<string, string> = {
    '--bg-base': c.bg,
    '--surface-base': c.surface,
    '--surface-2-base': c.surface2,
    '--surface-3-base': c.surface3,
    '--line-base': c.line,
    '--line-strong-base': c.lineStrong,
    '--tint-amt': `${Math.round(mode.tint * 1000) / 10}%`,
    '--fg': c.fg,
    '--muted': c.muted,
    '--faint': c.faint,
    '--success': c.success,
    '--warning': c.warning,
    '--danger': c.danger,
    '--primary': pal.primary,
    '--primary-fg': readableOn(pal.primary),
    '--accent': pal.accent,
    '--accent-fg': readableOn(pal.accent),
    '--c3': pal.chart[0],
    '--c4': pal.chart[1],
    '--c5': pal.chart[2],
    '--radius': `${radii[opts.radius]?.base ?? 12}px`,
  }
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v)
  root.dataset.mode = mode.id
  root.dataset.palette = opts.palette
  root.style.colorScheme = mode.isDark ? 'dark' : 'light'
  const meta = document.querySelector('meta[name="theme-color"]')
  meta?.setAttribute('content', c.bg)
}
