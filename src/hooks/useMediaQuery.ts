import { useEffect, useState } from 'react'

export function useMediaQuery(query: string) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatch(mql.matches)
    mql.addEventListener('change', onChange)
    onChange()
    return () => mql.removeEventListener('change', onChange)
  }, [query])
  return match
}

export const useIsMobile = () => useMediaQuery('(max-width: 767px)')
