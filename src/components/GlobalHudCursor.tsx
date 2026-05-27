import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const cursorQuery = '(hover: hover) and (pointer: fine) and (min-width: 761px)'

export default function GlobalHudCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    const mediaQuery = window.matchMedia(cursorQuery)
    if (!mediaQuery.matches) return

    gsap.set(cursor, { xPercent: -50, yPercent: -50 })
    const moveX = gsap.quickTo(cursor, 'x', { duration: 0.18, ease: 'power3.out' })
    const moveY = gsap.quickTo(cursor, 'y', { duration: 0.18, ease: 'power3.out' })

    const isInteractive = (target: EventTarget | null) => (
      target instanceof Element &&
      Boolean(target.closest('[data-hud-click="true"]'))
    )

    const moveCursor = (event: PointerEvent) => {
      if (!mediaQuery.matches) {
        hideCursor()
        return
      }

      const isClickTarget = isInteractive(event.target)
      moveX(event.clientX)
      moveY(event.clientY)
      cursor.classList.add('global-hud-cursor--visible')
      cursor.classList.toggle('global-hud-cursor--click', isClickTarget)
    }

    const hideCursor = () => {
      cursor.classList.remove('global-hud-cursor--visible', 'global-hud-cursor--click', 'global-hud-cursor--down')
    }

    const lockCursor = () => {
      cursor.classList.add('global-hud-cursor--down')
      window.setTimeout(() => cursor.classList.remove('global-hud-cursor--down'), 140)
    }

    const releaseCursor = () => {
      cursor.classList.remove('global-hud-cursor--down')
    }

    window.addEventListener('pointermove', moveCursor)
    window.addEventListener('pointerleave', hideCursor)
    window.addEventListener('blur', hideCursor)
    window.addEventListener('pointerdown', lockCursor)
    window.addEventListener('pointerup', releaseCursor)

    return () => {
      window.removeEventListener('pointermove', moveCursor)
      window.removeEventListener('pointerleave', hideCursor)
      window.removeEventListener('blur', hideCursor)
      window.removeEventListener('pointerdown', lockCursor)
      window.removeEventListener('pointerup', releaseCursor)
      gsap.killTweensOf(cursor)
    }
  }, [])

  return (
    <div ref={cursorRef} className="global-hud-cursor" aria-hidden="true">
      <span className="global-hud-cursor__ring" />
      <span className="global-hud-cursor__line global-hud-cursor__line--h" />
      <span className="global-hud-cursor__line global-hud-cursor__line--v" />
      <span className="global-hud-cursor__corner global-hud-cursor__corner--tl" />
      <span className="global-hud-cursor__corner global-hud-cursor__corner--tr" />
      <span className="global-hud-cursor__corner global-hud-cursor__corner--bl" />
      <span className="global-hud-cursor__corner global-hud-cursor__corner--br" />
      <span className="global-hud-cursor__scan" />
      <span className="global-hud-cursor__click">
        <span className="global-hud-cursor__click-grid" />
        <span className="global-hud-cursor__click-corner global-hud-cursor__click-corner--tl" />
        <span className="global-hud-cursor__click-corner global-hud-cursor__click-corner--tr" />
        <span className="global-hud-cursor__click-corner global-hud-cursor__click-corner--bl" />
        <span className="global-hud-cursor__click-corner global-hud-cursor__click-corner--br" />
        <span className="global-hud-cursor__click-scan" />
        <span className="global-hud-cursor__click-label">CLICK</span>
      </span>
    </div>
  )
}
