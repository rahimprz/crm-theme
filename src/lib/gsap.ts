/** Registers every GSAP plugin once. Import gsap from here, not from 'gsap'. */
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { Flip } from 'gsap/Flip'
import { CustomEase } from 'gsap/CustomEase'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, CustomEase, useGSAP)

// House easing curves: use `ease: 'volt'` for UI motion, 'volt.out' for reveals.
CustomEase.create('volt', '0.7, 0, 0.2, 1')
CustomEase.create('volt.out', '0.16, 1, 0.3, 1')

gsap.defaults({ ease: 'volt.out', duration: 0.6 })

/** True when the user (or Settings → Motion) asked for less animation. */
export function reducedMotion(): boolean {
  return (
    document.documentElement.dataset.motion === 'reduced' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export { gsap, ScrollTrigger, SplitText, Flip, useGSAP }
