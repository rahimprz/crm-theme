import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, MemoryRouter } from 'react-router-dom'
// Self-hosted variable fonts (no external requests).
import '@fontsource-variable/geist/wght.css'
import '@fontsource-variable/geist-mono/wght.css'
import '@fontsource-variable/bricolage-grotesque/wght.css'
import '@/styles/index.css'
import '@/lib/gsap'
import { bootTheme } from '@/store/theme'
import App from './App'

// Paint the saved theme before React renders, so there is no flash.
bootTheme()

// Hash routing works on any static host. Some sandboxed previews block the
// History API, so fall back to in-memory routing there.
function historyAvailable() {
  try {
    window.history.replaceState(window.history.state, '', window.location.href)
    return true
  } catch {
    return false
  }
}
const Router = historyAvailable() ? HashRouter : MemoryRouter

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
)
