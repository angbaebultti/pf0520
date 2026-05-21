import { useEffect, useRef, useState } from 'react'
import character06Src from '@assets/charcter06.png'
import '@styles/controlroom.css'

const projects = [
  { id: '01', title: 'Identity', hoverLabel: 'HONG JUHEE', position: 'identity' },
  { id: '02', title: 'K-Brand Contents Web/Mobile UX/UI Project', hoverLabel: 'MMCA', position: 'mmca' },
  {
    id: '03',
    title: 'AI Chatbot Support Fandom Community Mobile UX/UI Project',
    hoverLabel: '집사인생',
    position: 'fandom',
  },
  { id: '04', title: 'Personal App Project', hoverLabel: 'bubbloo', position: 'app' },
]

const capabilities = [
  { label: 'HTML/CSS', value: 85 },
  { label: 'JS', value: 70 },
  { label: 'GSAP', value: 80 },
  { label: 'FIGMA', value: 90 },
  { label: 'UI DESIGN', value: 75 },
]

export default function ControlRoom() {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const hasResetScrollRef = useRef(false)
  const roomRef = useRef<HTMLElement>(null)
  const clickCueRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let animationId = 0

    const resetScrollOnReveal = () => {
      const opacity = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--control-room-opacity')) || 0

      if (opacity >= 0.98 && !hasResetScrollRef.current) {
        hasResetScrollRef.current = true
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      }

      if (opacity < 0.2) {
        hasResetScrollRef.current = false
      }

      animationId = requestAnimationFrame(resetScrollOnReveal)
    }

    animationId = requestAnimationFrame(resetScrollOnReveal)

    return () => cancelAnimationFrame(animationId)
  }, [])

  useEffect(() => {
    const room = roomRef.current
    const clickCue = clickCueRef.current

    if (!room || !clickCue) return

    const getClickable = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return null
      const clickable = target.closest('a, button, [role="button"]')

      if (!clickable || !room.contains(clickable)) return null
      if (clickable instanceof HTMLButtonElement && clickable.disabled) return null

      return clickable
    }

    const moveCue = (event: PointerEvent) => {
      clickCue.style.setProperty('--click-cue-x', `${event.clientX + 18}px`)
      clickCue.style.setProperty('--click-cue-y', `${event.clientY + 16}px`)

      const clickable = getClickable(event.target)
      clickCue.classList.toggle('control-room__click-cue--active', Boolean(clickable))
    }

    const hideCue = () => {
      clickCue.classList.remove('control-room__click-cue--active')
    }

    room.addEventListener('pointermove', moveCue)
    room.addEventListener('pointerleave', hideCue)
    room.addEventListener('pointerdown', hideCue)

    return () => {
      room.removeEventListener('pointermove', moveCue)
      room.removeEventListener('pointerleave', hideCue)
      room.removeEventListener('pointerdown', hideCue)
    }
  }, [])

  return (
    <section ref={roomRef} className="control-room" aria-label="Dark Star Labs portfolio">
      <div className="control-room__stage">
        <header className="control-room__header">
          {/* <nav className="control-room__nav" aria-label="Main navigation">
            <a href="#home" aria-current="page">KR</a>
            <a href="#home">EN</a>
            <button type="button">LIST</button>
          </nav> */}
        </header>

        <div className="control-room__hero">
          <img className="control-room__backdrop" src={character06Src} alt="" />
          <button className="control-room__character-hit" type="button" onClick={() => setIsProfileOpen(true)} aria-label="Open user data">
            <img className="control-room__character" src={character06Src} alt="" />
          </button>
        </div>

        <div className="control-room__intro">
          <p>UIUX DESIGNER</p>
          <h1>HONG JUHEE</h1>
        </div>

        <div className="control-room__projects" aria-label="Featured works">
          {projects.map((project) => (
            <button
              className={`control-room__project control-room__project--${project.position}`}
              type="button"
              key={project.id}
            >
              <span className="control-room__project-kicker">{project.id}</span>
              <span className="control-room__project-title">{project.title}</span>
              <span className="control-room__project-preview" aria-hidden="true">
                <span>{project.hoverLabel}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <footer className="control-room__contact" aria-label="Contact">
        <div className="control-room__contact-inner">
          <p className="control-room__contact-copy">© 2026 HONG JUHEE Portfolio</p>
          <dl className="control-room__contact-list">
            <div>
              <dt>EMAIL</dt>
              <dd>
                <a href="mailto:103juhee@naver.com">103juhee@naver.com</a>
              </dd>
            </div>
            <div>
              <dt>KAKAOTALK</dt>
              <dd>
                <a href="https://open.kakao.com/o/slx8IWvi">https://open.kakao.com/o/slx8IWvi</a>
              </dd>
            </div>
          </dl>
        </div>
      </footer>
      <div className={`control-room__profile${isProfileOpen ? ' control-room__profile--open' : ''}`} aria-hidden={!isProfileOpen}>
        <div className="control-room__profile-shell" role="dialog" aria-modal="true" aria-label="User data">
          <button className="control-room__profile-close" type="button" onClick={() => setIsProfileOpen(false)}>
            RETURN
          </button>

          <section className="control-room__profile-panel control-room__profile-panel--user">
            <h2>&gt; USER DATA</h2>
            <dl className="control-room__profile-data">
              <div>
                <dt>EDUCATION</dt>
                <dd>공군사관학교(자퇴)</dd>
              </div>
              <div>
                <dt>TYPE</dt>
                <dd>ISTP</dd>
              </div>
              <div>
                <dt>LOCATION</dt>
                <dd>서울</dd>
              </div>
              <div>
                <dt>BLOOD TYPE</dt>
                <dd>O</dd>
              </div>
            </dl>
            <div className="control-room__profile-globe" aria-hidden="true">
              <span />
            </div>
          </section>

          <section className="control-room__profile-panel control-room__profile-panel--capability">
            <h2>&gt; CAPABILITY</h2>
            <div className="control-room__capability-list">
              {capabilities.map((capability) => (
                <div className="control-room__capability" key={capability.label}>
                  <span>{capability.label}</span>
                  <span className="control-room__capability-track">
                    <span style={{ width: `${capability.value}%` }} />
                  </span>
                  <b>{capability.value}%</b>
                </div>
              ))}
            </div>
            <p className="control-room__signal-label">( SIGNAL STRENGTH )</p>
          </section>

          <section className="control-room__profile-panel control-room__profile-panel--team">
            <h2>&gt; TEAM</h2>
            <p>PHOTO / EXTERNAL WORK<br />COOPERATION<br />POSSIBLE PEOPLE</p>
            <div className="control-room__team-strip" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <b>+5</b>
            </div>
          </section>

          <section className="control-room__profile-panel control-room__profile-panel--signal">
            <h2>&gt; PERSONAL SIGNAL</h2>
            <p>JPOP / ANIMATION /<br />NIGHT VIEW<br />TRAVEL / MUSIC</p>
            <div className="control-room__signal-strip" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </section>
        </div>
      </div>
      <div ref={clickCueRef} className="control-room__click-cue" aria-hidden="true">
        CLICK
      </div>
    </section>
  )
}
