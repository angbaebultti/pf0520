import { useCallback, useEffect, useRef, useState } from 'react'
import character07ProfileSrc from '@assets/character07_profile.jpg'
import character06Src from '@assets/charcter06.png'
import catArchiveSrc from '@assets/cat_archive.jpg'
import flowerArchiveSrc from '@assets/flower_archive.jpg'
import juhee2ArchiveSrc from '@assets/juhee2_archive.jpg'
import juheeArchiveSrc from '@assets/juhee_archive.jpg'
import mmcaThumbSrc from '@assets/mmca_thumb.jpg'
import nightviewArchiveSrc from '@assets/nightview_archive.jpg'
import oceanArchiveSrc from '@assets/ocean_archive.jpg'
import bubblooSrc from '@assets/bubbloo.png'
import jibsaLifeThumbSrc from '@assets/jibsa_life_thumb.jpg'
import kukdeThumbSrc from '@assets/kukde_thumb.jpg'
import '@styles/controlroom.css'

const projects = [
  { id: '01', title: 'Cloning Mini Project 1 / Web/Mobile UX/UI', position: 'identity', thumbnail: kukdeThumbSrc },
  { id: '02', title: 'K-Brand Contents Web/Mobile UX/UI Project', position: 'mmca', thumbnail: mmcaThumbSrc },
  {
    id: '03',
    title: 'AI Chatbot Support Fandom Community Mobile UX/UI Project',
    position: 'fandom',
    thumbnail: jibsaLifeThumbSrc,
  },
  { id: '04', title: 'Personal App Project', position: 'app', thumbnail: bubblooSrc },
]

const projectDetails = {
  '01': {
    fileName: '국대떡볶이',
    status: 'ACTIVE',
    year: '2025',
    type: 'PERSONAL',
    primaryAction: 'ACCESS LIVE',
    primaryUrl: 'https://angbaebultti.github.io/kukde/',
  },
  '02': {
    fileName: 'MMCA',
    status: 'ACTIVE',
    year: '2026',
    type: 'TEAM',
    primaryAction: 'ACCESS LIVE',
    secondaryAction: 'OPEN ARCHIVE',
    primaryUrl: 'https://angbaebultti.github.io/mmca02/',
    secondaryUrl: 'https://www.figma.com/deck/ZXh2NGrYdXA2vKlNkcS0iO',
  },
  '03': {
    fileName: '집사인생',
    status: 'ACTIVE',
    year: '2026',
    type: 'TEAM',
    primaryAction: 'ACCESS LIVE',
    secondaryAction: 'OPEN ARCHIVE',
    primaryUrl: 'https://new-jibsalife.vercel.app',
    secondaryUrl: 'https://www.figma.com/deck/twdFcOofR67TXZqo25bhVL',
  },
  '04': {
    fileName: 'BUBBLOO',
    status: 'DEVELOPMENT',
    year: '2026',
    type: 'PERSONAL',
    primaryAction: 'ACCESS LIVE',
  },
} as const

const capabilities = [
  { label: 'HTML/CSS', value: 95 },
  { label: 'JS', value: 80 },
  { label: 'GSAP', value: 80 },
  { label: 'FIGMA', value: 95 },
  { label: 'UI DESIGN', value: 85 },
]

const signalArchive = [
  { label: 'NIGHT VIEW', archiveLabel: 'NIGHT_VIEW.LOG', tone: 'city', image: nightviewArchiveSrc },
  { label: 'INTERFACE', archiveLabel: 'CAT.LOG', tone: 'terminal', image: catArchiveSrc },
  { label: 'SILENT MODE', archiveLabel: 'FLOWER.LOG', tone: 'coffee', image: flowerArchiveSrc },
  { label: 'ANIMATION', archiveLabel: 'JUHEE.LOG', tone: 'portrait', image: juheeArchiveSrc },
  { label: 'CODE SIGNAL', archiveLabel: 'OCEAN_ARCHIVE', tone: 'code', image: oceanArchiveSrc },
  { label: 'DEEP FOCUS', archiveLabel: 'JUHEE.LOG', tone: 'cloud', image: juhee2ArchiveSrc },
]

const profilePreloadAssets = [character07ProfileSrc, ...signalArchive.map((item) => item.image)]
const modalFadeMs = 220
const entryProfileRevealOpacity = 0.72

type HudScanButtonProps = {
  label: string
  index?: string
  variant?: 'card' | 'modal'
  isLoading?: boolean
}

function HudScanButton({ label, index, variant = 'card', isLoading = false }: HudScanButtonProps) {
  return (
    <span className={`hud-scan-button hud-scan-button--${variant}${isLoading ? ' hud-scan-button--loading' : ''}`}>
      <span className="hud-scan-button__grid" aria-hidden="true" />
      <span className="hud-scan-button__corner hud-scan-button__corner--tl" aria-hidden="true" />
      <span className="hud-scan-button__corner hud-scan-button__corner--tr" aria-hidden="true" />
      <span className="hud-scan-button__corner hud-scan-button__corner--bl" aria-hidden="true" />
      <span className="hud-scan-button__corner hud-scan-button__corner--br" aria-hidden="true" />
      <span className="hud-scan-button__scan" aria-hidden="true" />
      <span className="hud-scan-button__inner">
        {index && <span className="hud-scan-button__index">{index}</span>}
        <span className="hud-scan-button__label">{label}</span>
      </span>
    </span>
  )
}

export default function ControlRoom() {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isProfileClosing, setIsProfileClosing] = useState(false)
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<keyof typeof projectDetails | null>(null)
  const [isConnectionClosing, setIsConnectionClosing] = useState(false)
  const [isAccessingPrimary, setIsAccessingPrimary] = useState(false)
  const [isRoomInteractive, setIsRoomInteractive] = useState(false)
  const hasResetScrollRef = useRef(false)
  const hasAutoOpenedProfileRef = useRef(false)
  const shouldOpenGuideAfterProfileRef = useRef(false)
  const hasShownEntryGuideRef = useRef(false)
  const isRoomInteractiveRef = useRef(false)
  const roomRef = useRef<HTMLElement>(null)
  const guideToggleRef = useRef<HTMLButtonElement>(null)
  const guideRef = useRef<HTMLElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const profileCloseTimeoutRef = useRef<number | null>(null)
  const connectionCloseTimeoutRef = useRef<number | null>(null)
  const accessingPrimaryTimeoutRef = useRef<number | null>(null)
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
    const preloads = [character06Src, ...profilePreloadAssets].map((asset, index) => {
      const preload = document.createElement('link')
      preload.rel = 'preload'
      preload.as = 'image'
      preload.href = asset
      if (index === 0) preload.setAttribute('fetchpriority', 'high')
      document.head.append(preload)

      return preload
    })

    return () => {
      preloads.forEach((preload) => preload.remove())
    }
  }, [])

  useEffect(() => {
    let animationId = 0

    const resetScrollOnReveal = () => {
      const opacity = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--control-room-opacity')) || 0
      const shouldBeInteractive = opacity >= 0.98

      if (shouldBeInteractive !== isRoomInteractiveRef.current) {
        isRoomInteractiveRef.current = shouldBeInteractive
        setIsRoomInteractive(shouldBeInteractive)
      }

      if (opacity >= 0.98 && !hasResetScrollRef.current) {
        hasResetScrollRef.current = true
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      }

      if (opacity >= entryProfileRevealOpacity && !hasAutoOpenedProfileRef.current) {
        hasAutoOpenedProfileRef.current = true
        shouldOpenGuideAfterProfileRef.current = true
        openProfile()
      }

      if (opacity < 0.2) {
        hasResetScrollRef.current = false
      }

      animationId = requestAnimationFrame(resetScrollOnReveal)
    }

    animationId = requestAnimationFrame(resetScrollOnReveal)

    return () => cancelAnimationFrame(animationId)
  }, [])

  const clearProfileCloseTimeout = () => {
    if (profileCloseTimeoutRef.current === null) return
    window.clearTimeout(profileCloseTimeoutRef.current)
    profileCloseTimeoutRef.current = null
  }

  const clearConnectionCloseTimeout = () => {
    if (connectionCloseTimeoutRef.current === null) return
    window.clearTimeout(connectionCloseTimeoutRef.current)
    connectionCloseTimeoutRef.current = null
  }

  const clearAccessingPrimaryTimeout = () => {
    if (accessingPrimaryTimeoutRef.current === null) return
    window.clearTimeout(accessingPrimaryTimeoutRef.current)
    accessingPrimaryTimeoutRef.current = null
  }

  const openProfile = () => {
    clearProfileCloseTimeout()
    setIsProfileClosing(false)
    setIsProfileOpen(true)
  }

  const closeProfile = useCallback(() => {
    if (!isProfileOpen) return
    clearProfileCloseTimeout()
    setIsProfileClosing(true)
    setIsProfileOpen(false)
    profileCloseTimeoutRef.current = window.setTimeout(() => {
      setIsProfileClosing(false)
      if (shouldOpenGuideAfterProfileRef.current && !hasShownEntryGuideRef.current) {
        shouldOpenGuideAfterProfileRef.current = false
        hasShownEntryGuideRef.current = true
        setIsGuideOpen(true)
      }
      profileCloseTimeoutRef.current = null
    }, modalFadeMs)
  }, [isProfileOpen])

  const openConnection = (projectId: keyof typeof projectDetails) => {
    clearConnectionCloseTimeout()
    clearAccessingPrimaryTimeout()
    setIsConnectionClosing(false)
    setIsAccessingPrimary(false)
    setSelectedProjectId(projectId)
  }

  const closeConnection = useCallback(() => {
    if (!selectedProjectId) return
    clearConnectionCloseTimeout()
    clearAccessingPrimaryTimeout()
    setIsAccessingPrimary(false)
    setIsConnectionClosing(true)
    connectionCloseTimeoutRef.current = window.setTimeout(() => {
      setSelectedProjectId(null)
      setIsConnectionClosing(false)
      connectionCloseTimeoutRef.current = null
    }, modalFadeMs)
  }, [selectedProjectId])

  const previewPrimaryAccess = () => {
    clearAccessingPrimaryTimeout()
    setIsAccessingPrimary(true)
    accessingPrimaryTimeoutRef.current = window.setTimeout(() => {
      setIsAccessingPrimary(false)
      accessingPrimaryTimeoutRef.current = null
    }, 740)
  }

  const openProfileFromCharacter = (event: React.MouseEvent) => {
    if (isCharacterPixelTarget(event.clientX, event.clientY)) {
      openProfile()
    }
  }

  const updateCharacterHudTarget = (event: React.PointerEvent<HTMLButtonElement>) => {
    const isHudTarget = canUseControlRoom && isCharacterPixelTarget(event.clientX, event.clientY)
    if (isHudTarget) {
      event.currentTarget.dataset.hudClick = 'true'
    } else {
      delete event.currentTarget.dataset.hudClick
    }
  }

  const clearCharacterHudTarget = (event: React.PointerEvent<HTMLButtonElement>) => {
    delete event.currentTarget.dataset.hudClick
  }

  const openConnectionFromProject = (event: React.MouseEvent<HTMLButtonElement>, projectId: keyof typeof projectDetails) => {
    if (!(event.target instanceof Element) || !event.target.closest('.control-room__project-preview')) return
    openConnection(projectId)
  }

  const selectedProject = selectedProjectId ? projects.find((project) => project.id === selectedProjectId) : null
  const selectedProjectDetails = selectedProjectId ? projectDetails[selectedProjectId] : null
  const isProfileVisible = isProfileOpen || isProfileClosing
  const isConnectionVisible = Boolean(selectedProject && selectedProjectDetails)
  const isAnyModalVisible = isProfileVisible || isConnectionVisible
  const canUseControlRoom = isRoomInteractive || isAnyModalVisible

  useEffect(() => {
    return () => {
      clearProfileCloseTimeout()
      clearConnectionCloseTimeout()
      clearAccessingPrimaryTimeout()
    }
  }, [])

  useEffect(() => {
    if (!isAnyModalVisible) return

    const scrollY = window.scrollY
    const htmlOverflow = document.documentElement.style.overflow
    const htmlOverscrollBehavior = document.documentElement.style.overscrollBehavior
    const bodyOverflow = document.body.style.overflow
    const bodyPosition = document.body.style.position
    const bodyTop = document.body.style.top
    const bodyLeft = document.body.style.left
    const bodyWidth = document.body.style.width
    const lockedBodyWidth = document.documentElement.clientWidth

    const blockScroll = (event: Event) => {
      const isInsideModal = event.composedPath().some((target) => (
        target instanceof Element && target.matches('.control-room__profile-shell, .control-room__profile-shell *, .control-room__connection-modal, .control-room__connection-modal *')
      ))

      if (!isInsideModal) {
        event.preventDefault()
      }
    }

    document.documentElement.style.overflow = 'hidden'
    document.documentElement.style.overscrollBehavior = 'none'
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.width = `${lockedBodyWidth}px`

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
      document.body.style.left = bodyLeft
      document.body.style.width = bodyWidth
      window.scrollTo({ top: scrollY, left: 0, behavior: 'auto' })
    }
  }, [isAnyModalVisible])

  useEffect(() => {
    if (!isAnyModalVisible) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()

      if (isProfileVisible) {
        closeProfile()
        return
      }

      closeConnection()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeConnection, closeProfile, isAnyModalVisible, isProfileVisible])

  useEffect(() => {
    if (!isGuideOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (guideRef.current?.contains(target) || guideToggleRef.current?.contains(target)) return

      setIsGuideOpen(false)
    }

    window.addEventListener('pointerdown', handlePointerDown)

    return () => window.removeEventListener('pointerdown', handlePointerDown)
  }, [isGuideOpen])

  return (
    <section
      ref={roomRef}
      className={`control-room${canUseControlRoom ? ' control-room--interactive' : ''}`}
      aria-label="Dark Star Labs portfolio"
    >
      <div className="control-room__stage">
        <header className="control-room__header">
          {/* <nav className="control-room__nav" aria-label="Main navigation">
            <a href="#home" aria-current="page">KR</a>
            <a href="#home">EN</a>
            <button type="button">LIST</button>
          </nav> */}
        </header>

        <div className="control-room__hero">
          <button
            className="control-room__character-hit"
            type="button"
            onClick={openProfileFromCharacter}
            onPointerMove={updateCharacterHudTarget}
            onPointerLeave={clearCharacterHudTarget}
            aria-label="Open user data"
          >
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
                className={`control-room__project control-room__project--${project.position}${selectedProjectId === project.id ? ' control-room__project--selected' : ''}`}
                type="button"
                key={project.id}
                onClick={(event) => openConnectionFromProject(event, project.id as keyof typeof projectDetails)}
              >
                <span className="control-room__project-kicker">{project.id}</span>
                <span className="control-room__project-title">{project.title}</span>
                <span className="control-room__project-preview" aria-hidden="true" data-hud-click={canUseControlRoom ? 'true' : undefined}>
                  {'thumbnail' in project && <img src={project.thumbnail} alt="" loading="eager" decoding="async" />}
                </span>
                <span className="control-room__project-terminal" aria-hidden="true">
                  <span className="control-room__project-file">{details.fileName}</span>
                  <span>STATUS : {details.status}</span>
                  <span>YEAR : {details.year}</span>
                  <span>TYPE : {details.type}</span>
                  <span className="control-room__project-divider" />
                  <HudScanButton label={details.primaryAction} index="01" />
                  {'secondaryAction' in details && (
                    <HudScanButton label={details.secondaryAction} index="02" />
                  )}
                  <span className="control-room__project-corner" />
                </span>
              </button>
            )
          })}
        </div>

        <button
          ref={guideToggleRef}
          className={`control-room__guide-toggle${isGuideOpen ? ' control-room__guide-toggle--active' : ''}`}
          type="button"
          onClick={() => setIsGuideOpen((isOpen) => !isOpen)}
          aria-expanded={isGuideOpen}
          aria-controls="control-room-guide"
          data-hud-click={canUseControlRoom ? 'true' : undefined}
        >
         ACCESS GUIDE
        </button>
        <aside ref={guideRef} id="control-room-guide" className={`control-room__guide${isGuideOpen ? ' control-room__guide--open' : ''}`} aria-label="How to use" aria-hidden={!isGuideOpen}>
          <button className="control-room__guide-close" type="button" onClick={() => setIsGuideOpen(false)} aria-label="Close how to use" data-hud-click="true">
            ×
          </button>
          <h2>ACCESS GUIDE</h2>
          <p>각 프로젝트 카드 및 캐릭터에 마우스를 올리면 해당 채널의 접근 메뉴가 나타납니다.</p>
          <div className="control-room__guide-demo" aria-hidden="true">
            <span>02</span>
            <b>K-BRAND CONTENTS<br />WEB/MOBILE UX/UI<br />PROJECT</b>
            <div>
              <strong>MMCA</strong>
              <em>STATUS : ACTIVE</em>
              <em>YEAR : 2025</em>
              <em>TYPE : TEAM</em>
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
                <a href="mailto:103juhee@naver.com" data-hud-click={canUseControlRoom ? 'true' : undefined}>103juhee@naver.com</a>
              </dd>
            </div>
            <div>
              <dt>KAKAOTALK</dt>
              <dd>
                <a href="https://open.kakao.com/o/slx8IWvi" data-hud-click={canUseControlRoom ? 'true' : undefined}>https://open.kakao.com/o/slx8IWvi</a>
              </dd>
            </div>
          </dl>
        </div>
      </footer>
      <div
        className={`control-room__connection${isConnectionVisible && !isConnectionClosing ? ' control-room__connection--open' : ''}${isConnectionClosing ? ' control-room__connection--closing' : ''}`}
        aria-hidden={!isConnectionVisible || isConnectionClosing}
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) closeConnection()
        }}
      >
        {selectedProject && selectedProjectDetails && (
          <div
            className="control-room__connection-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Select connection"
          >
            <button className="control-room__connection-close" type="button" onClick={closeConnection} aria-label="Close connection" data-hud-click="true">
              ×
            </button>
            <p>SELECT CONNECTION</p>
            <h2>{selectedProjectDetails.fileName}</h2>
            <dl>
              <div>
                <dt>STATUS</dt>
                <dd className="control-room__connection-status">{selectedProjectDetails.status}</dd>
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
                <a href={selectedProjectDetails.primaryUrl} target="_blank" rel="noreferrer" onMouseEnter={previewPrimaryAccess} onFocus={previewPrimaryAccess} data-hud-click="true">
                  <HudScanButton
                    label={`${isAccessingPrimary ? 'ACCESSING...' : selectedProjectDetails.primaryAction} SYSTEM`}
                    index="01"
                    variant="modal"
                    isLoading={isAccessingPrimary}
                  />
                </a>
              ) : (
                <button type="button" onMouseEnter={previewPrimaryAccess} onFocus={previewPrimaryAccess} data-hud-click="true">
                  <HudScanButton
                    label={`${isAccessingPrimary ? 'ACCESSING...' : selectedProjectDetails.primaryAction} SYSTEM`}
                    index="01"
                    variant="modal"
                    isLoading={isAccessingPrimary}
                  />
                </button>
              )}
              {'secondaryAction' in selectedProjectDetails && 'secondaryUrl' in selectedProjectDetails && (
                <a href={selectedProjectDetails.secondaryUrl} target="_blank" rel="noreferrer" data-hud-click="true">
                  <HudScanButton label={`${selectedProjectDetails.secondaryAction} FILE`} index="02" variant="modal" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
      <div
        ref={profileRef}
        className={`control-room__profile${isProfileOpen ? ' control-room__profile--open' : ''}${isProfileClosing ? ' control-room__profile--closing' : ''}`}
        aria-hidden={!isProfileOpen}
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) closeProfile()
        }}
      >
        {isProfileVisible && (
        <div className="control-room__profile-shell" role="dialog" aria-modal="true" aria-label="User data">
          <div className="control-room__analysis">
            <header className="control-room__analysis-header">
              <div className="control-room__analysis-boot">
                <p style={{ '--typing-steps': 31, '--typing-delay': '0s' } as React.CSSProperties}>&gt;&gt; ACCESSING IDENTITY MODULE...</p>
                <p style={{ '--typing-steps': 16, '--typing-delay': '0.8s' } as React.CSSProperties}>[ 00:00:12:07 ]</p>
                <p style={{ '--typing-steps': 22, '--typing-delay': '4.45s' } as React.CSSProperties}>&gt;&gt; CONNECTION STABLE</p>
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
                <img src={character07ProfileSrc} alt="" loading="eager" decoding="async" />
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
                <img src={character06Src} alt="" loading="eager" decoding="async" />
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
                <b className="control-room__numeric-value">
                  <span className="control-room__numeric-digits">92</span>
                </b>
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
                  <dd className="control-room__analysis-data-value--kr">공군사관학교(자퇴)</dd>
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
                  <strong className="control-room__numeric-value">
                    <span className="control-room__numeric-digits">{capability.value}</span>
                  </strong>
                </div>
              ))}
              <div className="control-room__analysis-capability">
                <span>PROTOTYPE</span>
                <i>
                  <b style={{ width: '75%' }} />
                </i>
                <strong className="control-room__numeric-value">
                  <span className="control-room__numeric-digits">75</span>
                </strong>
              </div>
            </section>

            <section className="control-room__analysis-panel control-room__analysis-panel--archive">
              <h3>PERSONAL SIGNAL ARCHIVE</h3>
              <div className="control-room__archive-grid" aria-label="Personal signal archive">
                {signalArchive.map((item) => (
                  <figure
                    className={`control-room__archive-card control-room__archive-card--${item.tone} control-room__archive-card--image`}
                    key={item.label}
                  >
                    <img src={item.image} alt="" loading="eager" decoding="async" />
                    <figcaption>{item.archiveLabel}</figcaption>
                  </figure>
                ))}
              </div>
              <dl className="control-room__archive-status">
                <div>
                  <dt>ARCHIVE STATUS</dt>
                  <dd>STABLE</dd>
                </div>
                <div>
                  <dt>SIGNAL QUALITY</dt>
                  <dd>89%</dd>
                </div>
              </dl>
            </section>

            <nav className="control-room__analysis-panel control-room__analysis-panel--actions" aria-label="Profile actions">
              <button type="button" onClick={closeProfile} data-hud-click="true">&gt; BACK TO MAIN</button>
            </nav>

            <footer className="control-room__analysis-input">
              <span>&gt; INPUT COMMAND [ READ ONLY ]</span>
            </footer>
          </div>

        </div>
        )}
      </div>
    </section>
  )
}
