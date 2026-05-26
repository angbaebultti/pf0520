import { useCallback, useEffect, useRef, useState } from 'react'
import character07Src from '@assets/character07.png'
import character06Src from '@assets/gun_cha.png'
import '@styles/controlroom.css'

const projects = [
  { id: '01', title: 'Cloning Mini Project 1 / Web/Mobile UX/UI', hoverLabel: 'kukde', position: 'identity' },
  { id: '02', title: 'K-Brand Contents Web/Mobile UX/UI Project', hoverLabel: 'MMCA', position: 'mmca' },
  {
    id: '03',
    title: 'AI Chatbot Support Fandom Community Mobile UX/UI Project',
    hoverLabel: '집사인생',
    position: 'fandom',
  },
  { id: '04', title: 'Personal App Project', hoverLabel: 'bubbloo', position: 'app' },
]

const projectDetails = {
  '01': {
    fileName: 'KUKDE.SYS',
    status: 'ACTIVE',
    year: '2025',
    type: 'PERSONAL',
    primaryAction: 'ACCESS LIVE',
    secondaryAction: 'OPEN ARCHIVE',
    primaryUrl: 'https://angbaebultti.github.io/kukde/',
  },
  '02': {
    fileName: 'MMCA.EXE',
    status: 'ACTIVE',
    year: '2026',
    type: 'TEAM',
    primaryAction: 'ACCESS LIVE',
    secondaryAction: 'OPEN ARCHIVE',
    primaryUrl: 'https://angbaebultti.github.io/mmca02/',
    secondaryUrl: 'https://www.figma.com/deck/ZXh2NGrYdXA2vKlNkcS0iO',
  },
  '03': {
    fileName: 'JIBSA_LIFE.APP',
    status: 'ACTIVE',
    year: '2026',
    type: 'TEAM',
    primaryAction: 'ACCESS LIVE',
    secondaryAction: 'OPEN ARCHIVE',
    primaryUrl: 'https://new-jibsalife.vercel.app',
    secondaryUrl: 'https://www.figma.com/deck/twdFcOofR67TXZqo25bhVL',
  },
  '04': {
    fileName: 'BUBBLOO.SYS',
    status: 'DEVELOPMENT',
    year: '2026',
    type: 'PERSONAL',
    primaryAction: 'ACCESS LIVE',
    secondaryAction: 'OPEN ARCHIVE',
  },
} as const

const capabilities = [
  { label: 'HTML/CSS', value: 95 },
  { label: 'JS', value: 80 },
  { label: 'GSAP', value: 80 },
  { label: 'FIGMA', value: 95 },
  { label: 'UI DESIGN', value: 85 },
]

export default function ControlRoom() {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<keyof typeof projectDetails | null>(null)
  const hasResetScrollRef = useRef(false)
  const roomRef = useRef<HTMLElement>(null)
  const clickCueRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const characterRef = useRef<HTMLImageElement>(null)
  const isCharacterPixelTarget = useCallback((clientX: number, clientY: number) => {
    const character = characterRef.current

    if (!character || !character.complete || !character.naturalWidth || !character.naturalHeight) return false

    const rect = character.getBoundingClientRect()
    const scale = Math.min(rect.width / character.naturalWidth, rect.height / character.naturalHeight)
    const renderedWidth = character.naturalWidth * scale
    const renderedHeight = character.naturalHeight * scale
    const renderedLeft = rect.left + (rect.width - renderedWidth) / 2
    const renderedTop = rect.top + (rect.height - renderedHeight) / 2
    const imageX = (clientX - renderedLeft) / scale
    const imageY = (clientY - renderedTop) / scale

    if (imageX < 0 || imageY < 0 || imageX >= character.naturalWidth || imageY >= character.naturalHeight) return false

    const normalizedX = imageX / character.naturalWidth
    const normalizedY = imageY / character.naturalHeight
    const isNearCharacter = normalizedX >= 0.3 && normalizedX <= 0.72 && normalizedY >= 0.14 && normalizedY <= 0.93

    if (!isNearCharacter) return false

    const inEllipse = (centerX: number, centerY: number, radiusX: number, radiusY: number) => {
      const x = (normalizedX - centerX) / radiusX
      const y = (normalizedY - centerY) / radiusY

      return x * x + y * y <= 1
    }

    const nearLine = (startX: number, startY: number, endX: number, endY: number, width: number) => {
      const lineX = endX - startX
      const lineY = endY - startY
      const pointX = normalizedX - startX
      const pointY = normalizedY - startY
      const lengthSquared = lineX * lineX + lineY * lineY
      const progress = Math.max(0, Math.min(1, (pointX * lineX + pointY * lineY) / lengthSquared))
      const closestX = startX + lineX * progress
      const closestY = startY + lineY * progress
      const distanceX = normalizedX - closestX
      const distanceY = normalizedY - closestY

      return Math.hypot(distanceX, distanceY) <= width
    }

    return (
      inEllipse(0.51, 0.25, 0.075, 0.105) ||
      (normalizedX >= 0.42 && normalizedX <= 0.59 && normalizedY >= 0.31 && normalizedY <= 0.61) ||
      (normalizedX >= 0.39 && normalizedX <= 0.61 && normalizedY >= 0.54 && normalizedY <= 0.68) ||
      (normalizedX >= 0.43 && normalizedX <= 0.51 && normalizedY >= 0.64 && normalizedY <= 0.91) ||
      (normalizedX >= 0.53 && normalizedX <= 0.61 && normalizedY >= 0.64 && normalizedY <= 0.91) ||
      nearLine(0.39, 0.38, 0.72, 0.76, 0.025) ||
      nearLine(0.44, 0.43, 0.61, 0.57, 0.04)
    )
  }, [])

  useEffect(() => {
    const preload = document.createElement('link')
    preload.rel = 'preload'
    preload.as = 'image'
    preload.href = character06Src
    preload.setAttribute('fetchpriority', 'high')
    document.head.append(preload)

    return () => {
      preload.remove()
    }
  }, [])

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

    const getClickable = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return null
      const project = target.closest('.control-room__project')
      if (project && room.contains(project)) return project

      const characterHit = target.closest('.control-room__character-hit')
      if (characterHit && room.contains(characterHit) && isCharacterPixelTarget(event.clientX, event.clientY)) return characterHit

      return null
    }

    const moveCue = (event: PointerEvent) => {
      clickCue.style.setProperty('--click-cue-x', `${event.clientX + 18}px`)
      clickCue.style.setProperty('--click-cue-y', `${event.clientY + 16}px`)

      const clickable = getClickable(event)
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
  }, [isCharacterPixelTarget])

  const openProfileFromCharacter = (event: React.MouseEvent) => {
    if (isCharacterPixelTarget(event.clientX, event.clientY)) {
      setIsProfileOpen(true)
    }
  }

  const selectedProject = selectedProjectId ? projects.find((project) => project.id === selectedProjectId) : null
  const selectedProjectDetails = selectedProjectId ? projectDetails[selectedProjectId] : null

  useEffect(() => {
    if (!isProfileOpen) return

    const scrollY = window.scrollY
    const htmlOverflow = document.documentElement.style.overflow
    const htmlOverscrollBehavior = document.documentElement.style.overscrollBehavior
    const bodyOverflow = document.body.style.overflow
    const bodyPosition = document.body.style.position
    const bodyTop = document.body.style.top
    const bodyWidth = document.body.style.width

    const blockScroll = (event: Event) => {
      if (event.target instanceof Node && profileRef.current?.contains(event.target)) {
        event.preventDefault()
      }
    }

    document.documentElement.style.overflow = 'hidden'
    document.documentElement.style.overscrollBehavior = 'none'
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'

    window.addEventListener('wheel', blockScroll, { passive: false, capture: true })
    window.addEventListener('touchmove', blockScroll, { passive: false, capture: true })

    return () => {
      window.removeEventListener('wheel', blockScroll, { capture: true })
      window.removeEventListener('touchmove', blockScroll, { capture: true })
      document.documentElement.style.overflow = htmlOverflow
      document.documentElement.style.overscrollBehavior = htmlOverscrollBehavior
      document.body.style.overflow = bodyOverflow
      document.body.style.position = bodyPosition
      document.body.style.top = bodyTop
      document.body.style.width = bodyWidth
      window.scrollTo({ top: scrollY, left: 0, behavior: 'auto' })
    }
  }, [isProfileOpen])

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
          <button className="control-room__character-hit" type="button" onClick={openProfileFromCharacter} aria-label="Open user data">
            <img ref={characterRef} className="control-room__character" src={character06Src} alt="" loading="eager" decoding="sync" />
          </button>
        </div>

        <div className="control-room__intro">
          <p>UIUX DESIGNER</p>
          <h1>HONG JUHEE</h1>
        </div>

        <div className="control-room__projects" aria-label="Featured works">
          {projects.map((project) => {
            const details = projectDetails[project.id as keyof typeof projectDetails]

            return (
              <button
                className={`control-room__project control-room__project--${project.position}`}
                type="button"
                key={project.id}
                onClick={() => setSelectedProjectId(project.id as keyof typeof projectDetails)}
              >
                <span className="control-room__project-kicker">{project.id}</span>
                <span className="control-room__project-title">{project.title}</span>
                <span className="control-room__project-preview" aria-hidden="true">
                  <span>{project.hoverLabel}</span>
                </span>
                <span className="control-room__project-terminal" aria-hidden="true">
                  <span className="control-room__project-file">{details.fileName}</span>
                  <span>STATUS : {details.status}</span>
                  <span>YEAR : {details.year}</span>
                  <span>TYPE : {details.type}</span>
                  <span className="control-room__project-divider" />
                  <span className="control-room__project-action control-room__project-action--primary">&gt; {details.primaryAction}</span>
                  <span className="control-room__project-action">&gt; {details.secondaryAction}</span>
                  <span className="control-room__project-corner" />
                </span>
              </button>
            )
          })}
        </div>

        <button
          className={`control-room__guide-toggle${isGuideOpen ? ' control-room__guide-toggle--active' : ''}`}
          type="button"
          onClick={() => setIsGuideOpen((isOpen) => !isOpen)}
          aria-expanded={isGuideOpen}
          aria-controls="control-room-guide"
        >
          HOW TO USE
        </button>
        <aside id="control-room-guide" className={`control-room__guide${isGuideOpen ? ' control-room__guide--open' : ''}`} aria-label="How to use" aria-hidden={!isGuideOpen}>
          <button className="control-room__guide-close" type="button" onClick={() => setIsGuideOpen(false)} aria-label="Close how to use">
            ×
          </button>
          <h2>HOW TO USE</h2>
          <p>각 프로젝트 카드에 마우스를 올리면 해당 채널의 접근 메뉴가 터미널처럼 나타납니다.</p>
          <div className="control-room__guide-demo" aria-hidden="true">
            <span>02</span>
            <b>K-BRAND CONTENTS<br />WEB/MOBILE UX/UI<br />PROJECT</b>
            <div>
              <strong>MMCA.EXE</strong>
              <em>STATUS : ACTIVE</em>
              <em>YEAR : 2025</em>
              <em>TYPE : WEB / UXUI</em>
              <i>&gt; ACCESS LIVE</i>
              <em>&gt; OPEN ARCHIVE</em>
            </div>
          </div>
        </aside>
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
      <div className={`control-room__connection${selectedProject && selectedProjectDetails ? ' control-room__connection--open' : ''}`} aria-hidden={!selectedProject}>
        {selectedProject && selectedProjectDetails && (
          <div className="control-room__connection-modal" role="dialog" aria-modal="true" aria-label="Select connection">
            <button className="control-room__connection-close" type="button" onClick={() => setSelectedProjectId(null)} aria-label="Close connection">
              ×
            </button>
            <p>SELECT CONNECTION</p>
            <h2>{selectedProjectDetails.fileName}</h2>
            <dl>
              <div>
                <dt>STATUS</dt>
                <dd>{selectedProjectDetails.status}</dd>
              </div>
              <div>
                <dt>YEAR</dt>
                <dd>{selectedProjectDetails.year}</dd>
              </div>
              <div>
                <dt>TYPE</dt>
                <dd>{selectedProjectDetails.type}</dd>
              </div>
            </dl>
            <div className="control-room__connection-options">
              {'primaryUrl' in selectedProjectDetails ? (
                <a href={selectedProjectDetails.primaryUrl} target="_blank" rel="noreferrer">
                  <span>01</span>
                  &gt; {selectedProjectDetails.primaryAction} SYSTEM
                </a>
              ) : (
                <button type="button">
                  <span>01</span>
                  &gt; {selectedProjectDetails.primaryAction} SYSTEM
                </button>
              )}
              {'secondaryUrl' in selectedProjectDetails ? (
                <a href={selectedProjectDetails.secondaryUrl} target="_blank" rel="noreferrer">
                  <span>02</span>
                  &gt; {selectedProjectDetails.secondaryAction} FILE
                </a>
              ) : (
                <button type="button">
                  <span>02</span>
                  &gt; {selectedProjectDetails.secondaryAction} FILE
                </button>
              )}
            </div>
       
          </div>
        )}
      </div>
      <div ref={profileRef} className={`control-room__profile${isProfileOpen ? ' control-room__profile--open' : ''}`} aria-hidden={!isProfileOpen}>
        <div className="control-room__profile-shell" role="dialog" aria-modal="true" aria-label="User data">
          <div className="control-room__analysis">
            <header className="control-room__analysis-header">
              <div className="control-room__analysis-boot">
                <p style={{ '--typing-steps': 31, '--typing-delay': '0s' } as React.CSSProperties}>&gt;&gt; ACCESSING IDENTITY MODULE...</p>
                <p style={{ '--typing-steps': 16, '--typing-delay': '1.45s' } as React.CSSProperties}>[ 00:00:12:07 ]</p>
                <p style={{ '--typing-steps': 22, '--typing-delay': '8.7s' } as React.CSSProperties}>&gt;&gt; CONNECTION STABLE</p>
              </div>
              <h2>IDENTITY ANALYSIS SYSTEM</h2>
              <div>
                <p>USER ID : JUHEE</p>
                <p>CLEARANCE : LEVEL 1</p>
              </div>
            </header>

       

            <section className="control-room__analysis-panel control-room__analysis-panel--visual">
              <h3>ENTITY VISUAL</h3>
              <div className="control-room__analysis-portrait">
                <img src={character07Src} alt="" />
                <span>SIGNAL SOURCE<br />LIVE FEED</span>
              </div>
            </section>

            <section className="control-room__analysis-panel control-room__analysis-panel--log">
              <h3>SYSTEM LOG</h3>
              <p>[00:00:10:21] SCANNING...</p>
              <p>[00:00:10:54] FACIAL DATA SYNCHRONIZED.</p>
              <p>[00:00:11:02] VOICE PATTERN NOT FOUND.</p>
              <p>[00:00:11:18] BEHAVIOR ANALYSIS STARTED.</p>
              <p>[00:00:11:59] INTEREST PATTERN DETECTED.</p>
              <p>[00:00:12:07] IDENTITY CONFIRMED.</p>
              <b>&gt;&gt; ANALYSIS COMPLETE</b>
            </section>

            <main className="control-room__analysis-panel control-room__analysis-panel--core">
              <h3>IDENTITY CORE</h3>
              <div className="control-room__analysis-core-frame">
                <img src={character06Src} alt="" />
                <div className="control-room__analysis-status">
                  <span>STATUS</span>
                  <b>ACTIVE</b>
                </div>
              </div>
              <div className="control-room__analysis-wave">
                <span>SIGNAL STRENGTH</span>
                <svg viewBox="0 0 720 92" aria-hidden="true" focusable="false">
                  <g className="control-room__analysis-wave-flow">
                    <path className="control-room__analysis-wave-line control-room__analysis-wave-line--dim" d="M0 50 C30 42 52 58 80 50 S132 40 160 51 210 63 244 49 304 38 340 50 392 60 430 49 486 41 522 51 584 63 620 49 680 42 720 50" />
                    <path className="control-room__analysis-wave-line" d="M0 54 C16 50 24 48 34 50 S52 58 66 52 90 45 108 49 136 57 154 51 176 42 194 45 214 58 236 53 260 50 282 54 304 48 324 45 346 55 366 52 386 47 408 50 430 56 450 51 472 40 494 43 514 59 536 53 558 48 580 50 602 56 622 52 644 43 666 47 692 55 720 50" />
                    <path className="control-room__analysis-wave-line control-room__analysis-wave-line--dim" d="M720 50 C750 42 772 58 800 50 S852 40 880 51 930 63 964 49 1024 38 1060 50 1112 60 1150 49 1206 41 1242 51 1304 63 1340 49 1400 42 1440 50" />
                    <path className="control-room__analysis-wave-line" d="M720 54 C736 50 744 48 754 50 S772 58 786 52 810 45 828 49 856 57 874 51 896 42 914 45 934 58 956 53 980 50 1002 54 1024 48 1044 45 1066 55 1086 52 1106 47 1128 50 1150 56 1170 51 1192 40 1214 43 1234 59 1256 53 1278 48 1300 50 1322 56 1342 52 1364 43 1386 47 1412 55 1440 50" />
                  </g>
                </svg>
                <b>92%</b>
              </div>
            </main>

            <aside className="control-room__analysis-panel control-room__analysis-panel--data">
              <h3>USER DATA</h3>
              <dl className="control-room__analysis-data">
                <div>
                  <dt>NAME</dt>
                  <dd>HONG JUHEE</dd>
                </div>
                <div>
                  <dt>ROLE</dt>
                  <dd>UIUX DESIGNER</dd>
                </div>
                <div>
                  <dt>LOCATION</dt>
                  <dd>SEOUL, KOR</dd>
                </div>
                <div>
                  <dt>EDUCATION</dt>
                  <dd>공군사관학교(자퇴)</dd>
                </div>
                <div>
                  <dt>MBTI</dt>
                  <dd>ISTP</dd>
                </div>
              </dl>
              <p>NOTES :<br />FAST EXECUTION / STRONG MENTALITY<br />HIGH ADAPTABILITY</p>
            </aside>

            <section className="control-room__analysis-panel control-room__analysis-panel--scan">
              <h3>CAPABILITY SCAN</h3>
              {capabilities.map((capability) => (
                <div className="control-room__analysis-capability" key={`analysis-${capability.label}`}>
                  <span>{capability.label.replace('UI DESIGN', 'UI / UX')}</span>
                  <i>
                    <b style={{ width: `${capability.value}%` }} />
                  </i>
                  <strong>{capability.value}%</strong>
                </div>
              ))}
              <div className="control-room__analysis-capability">
                <span>PROTOTYPE</span>
                <i>
                  <b style={{ width: '75%' }} />
                </i>
                <strong>75%</strong>
              </div>
            </section>

            <nav className="control-room__analysis-panel control-room__analysis-panel--actions" aria-label="Profile actions">
              <button type="button" onClick={() => setIsProfileOpen(false)}>&gt; BACK TO MAIN</button>
            </nav>

            <footer className="control-room__analysis-input">
              <span>&gt; INPUT COMMAND</span>
              <i />
            </footer>
          </div>

        </div>
      </div>
      <div ref={clickCueRef} className="control-room__click-cue" aria-hidden="true">
        CLICK
      </div>
    </section>
  )
}
