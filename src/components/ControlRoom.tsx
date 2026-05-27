import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import character06ProfileSrc from '@assets/character06_profile.jpg'
import character07ProfileSrc from '@assets/character07_profile.jpg'
import character06Src from '@assets/charcter06_profile_intro.png'
import gunCharacterSrc from '@assets/gun_cha_main.png'
import gunCharacterSyncedSrc from '@assets/gun_cha02.png'
import gunCharacterBoostedSrc from '@assets/gun_cha03.png'
import catArchiveSrc from '@assets/cat_archive.jpg'
import flowerArchiveSrc from '@assets/flower_archive.jpg'
import juhee2ArchiveSrc from '@assets/juhee2_archive.jpg'
import juheeArchiveSrc from '@assets/juhee_archive.jpg'
import jibsaLifeSrc from '@assets/jibsa_life.png'
import kukdeSrc from '@assets/kukde.png'
import mmcaSrc from '@assets/mmca.png'
import mmcaThumbSrc from '@assets/mmca_thumb.jpg'
import nightviewArchiveSrc from '@assets/nightview_archive.jpg'
import oceanArchiveSrc from '@assets/ocean_archive.jpg'
import bubblooCardSrc from '@assets/bubbloo_card.png'
import jibsaLifeThumbSrc from '@assets/jibsa_life_thumb.jpg'
import kukdeThumbSrc from '@assets/kukde_thumb.jpg'
import '@styles/controlroom.css'

const projects = [
  { id: '01', title: 'Cloning Mini Project 1 / Web/Mobile UX/UI', category: 'WEB / MOBILE UXUI', position: 'identity', thumbnail: kukdeThumbSrc, previewImage: kukdeSrc },
  { id: '02', title: 'K-Brand Contents Web/Mobile UX/UI Project', category: 'K-BRAND CONTENTS', position: 'mmca', thumbnail: mmcaThumbSrc, previewImage: mmcaSrc },
  {
    id: '03',
    title: 'AI CHATBOT PLATFORM',
    category: 'AI CHATBOT SUPPORT',
    position: 'fandom',
    thumbnail: jibsaLifeThumbSrc,
    previewImage: jibsaLifeSrc,
  },
  { id: '04', title: 'Personal App Project', category: 'PERSONAL APP', position: 'app', thumbnail: bubblooCardSrc, previewImage: bubblooCardSrc },
]

const projectDetails = {
  '01': {
    fileName: '국대떡볶이',
    status: 'ACTIVE',
    year: '2026',
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

const workflowSignals = [
  { label: 'REACT', meta: 'COMPONENT SYSTEM' },
  { label: 'GSAP', meta: 'MOTION DESIGN' },
  { label: 'THREE.JS', meta: '3D INTERACTION' },
  { label: 'FIGMA', meta: 'DESIGN / PROTOTYPE' },
  { label: 'TYPESCRIPT', meta: 'STRUCTURED FRONTEND' },
  { label: 'INTERACTION', meta: 'IMMERSIVE EXPERIENCE' },
]

const signalArchive = [
  { label: 'NIGHT VIEW', archiveLabel: 'NIGHT_VIEW.LOG', tone: 'city', image: nightviewArchiveSrc },
  { label: 'INTERFACE', archiveLabel: 'CAT.LOG', tone: 'terminal', image: catArchiveSrc },
  { label: 'SILENT MODE', archiveLabel: 'FLOWER.LOG', tone: 'coffee', image: flowerArchiveSrc },
  { label: 'ANIMATION', archiveLabel: 'JUHEE.LOG', tone: 'portrait', image: juheeArchiveSrc },
  { label: 'CODE SIGNAL', archiveLabel: 'OCEAN_ARCHIVE', tone: 'code', image: oceanArchiveSrc },
  { label: 'DEEP FOCUS', archiveLabel: 'JUHEE.LOG', tone: 'cloud', image: juhee2ArchiveSrc },
]

const profilePreloadAssets = [
  character06ProfileSrc,
  character07ProfileSrc,
  gunCharacterSrc,
  gunCharacterSyncedSrc,
  gunCharacterBoostedSrc,
  ...signalArchive.map((item) => item.image),
]
const projectThumbnailAssets = projects.map((project) => project.thumbnail)
const projectPreviewAssets = projects.map((project) => project.previewImage)
const modalFadeMs = 220
const entryProfileRevealOpacity = 0.96
type ProfileRevealMode = 'fast' | 'ready'

type HudScanButtonProps = {
  label: string
  index?: string
  variant?: 'card' | 'modal'
  isLoading?: boolean
}

type ProfilePanelId = 'visual' | 'log' | 'core' | 'data' | 'scan' | 'activity' | 'archive'

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
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<keyof typeof projectDetails | null>(null)
  const [isConnectionClosing, setIsConnectionClosing] = useState(false)
  const [isAccessingPrimary, setIsAccessingPrimary] = useState(false)
  const [isRoomInteractive, setIsRoomInteractive] = useState(false)
  const [openProfilePanel, setOpenProfilePanel] = useState<ProfilePanelId>('scan')
  const [profileRevealMode, setProfileRevealMode] = useState<ProfileRevealMode>('ready')
  const [profileLevel, setProfileLevel] = useState(1)
  const hasResetScrollRef = useRef(false)
  const hasAutoOpenedProfileRef = useRef(false)
  const shouldOpenGuideAfterProfileRef = useRef(false)
  const hasShownEntryGuideRef = useRef(false)
  const isRoomInteractiveRef = useRef(false)
  const roomRef = useRef<HTMLElement>(null)
  const guideToggleRef = useRef<HTMLButtonElement>(null)
  const guideRef = useRef<HTMLElement>(null)
  const contactToggleRef = useRef<HTMLButtonElement>(null)
  const contactRef = useRef<HTMLElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const profileCloseTimeoutRef = useRef<number | null>(null)
  const connectionCloseTimeoutRef = useRef<number | null>(null)
  const accessingPrimaryTimeoutRef = useRef<number | null>(null)
  const decodedImageAssetsRef = useRef(new Set<string>())
  const decodingImageAssetsRef = useRef(new Map<string, Promise<void>>())
  const characterRef = useRef<HTMLImageElement>(null)
  const introTitleRef = useRef<HTMLHeadingElement>(null)
  const decodeImageAsset = useCallback((asset: string) => {
    if (decodedImageAssetsRef.current.has(asset)) return Promise.resolve()

    const pendingDecode = decodingImageAssetsRef.current.get(asset)
    if (pendingDecode) return pendingDecode

    const image = new Image()
    image.decoding = 'async'
    image.src = asset

    const decodePromise = (image.decode
      ? image.decode()
      : new Promise<void>((resolve, reject) => {
          image.onload = () => resolve()
          image.onerror = () => reject(new Error(`Failed to load ${asset}`))
        }))
      .catch(() => undefined)
      .then(() => {
        decodedImageAssetsRef.current.add(asset)
        decodingImageAssetsRef.current.delete(asset)
      })

    decodingImageAssetsRef.current.set(asset, decodePromise)
    return decodePromise
  }, [])
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
    const isNearCharacter = normalizedX >= 0.18 && normalizedX <= 0.92 && normalizedY >= 0.05 && normalizedY <= 0.96

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
      inEllipse(0.51, 0.2, 0.15, 0.15) ||
      inEllipse(0.51, 0.25, 0.12, 0.11) ||
      (normalizedX >= 0.43 && normalizedX <= 0.58 && normalizedY >= 0.29 && normalizedY <= 0.39) ||
      (normalizedX >= 0.35 && normalizedX <= 0.67 && normalizedY >= 0.35 && normalizedY <= 0.64) ||
      (normalizedX >= 0.3 && normalizedX <= 0.7 && normalizedY >= 0.56 && normalizedY <= 0.72) ||
      (normalizedX >= 0.36 && normalizedX <= 0.48 && normalizedY >= 0.63 && normalizedY <= 0.94) ||
      (normalizedX >= 0.54 && normalizedX <= 0.67 && normalizedY >= 0.63 && normalizedY <= 0.94) ||
      (normalizedX >= 0.22 && normalizedX <= 0.42 && normalizedY >= 0.36 && normalizedY <= 0.56) ||
      (normalizedX >= 0.62 && normalizedX <= 0.78 && normalizedY >= 0.36 && normalizedY <= 0.68) ||
      (normalizedX >= 0.2 && normalizedX <= 0.44 && normalizedY >= 0.27 && normalizedY <= 0.43) ||
      inEllipse(0.34, 0.36, 0.12, 0.08) ||
      nearLine(0.2, 0.34, 0.72, 0.69, 0.078) ||
      nearLine(0.43, 0.43, 0.91, 0.83, 0.045) ||
      nearLine(0.5, 0.36, 0.83, 0.59, 0.05)
    )
  }, [])

  useEffect(() => {
    const criticalAssets = [gunCharacterSrc, ...projectThumbnailAssets]
    const criticalPreloads = criticalAssets.map((asset) => {
      const preload = document.createElement('link')
      preload.rel = 'preload'
      preload.as = 'image'
      preload.href = asset
      preload.setAttribute('fetchpriority', 'high')
      document.head.append(preload)
      void decodeImageAsset(asset)

      return preload
    })

    const preloads: HTMLLinkElement[] = []
    const preloadDeferredAssets = () => {
      ;[character06Src, ...profilePreloadAssets, ...projectPreviewAssets].forEach((asset) => {
        const preload = document.createElement('link')
        preload.rel = 'preload'
        preload.as = 'image'
        preload.href = asset
        document.head.append(preload)
        preloads.push(preload)
        void decodeImageAsset(asset)
      })
    }
    const idleId = 'requestIdleCallback' in window
      ? window.requestIdleCallback(preloadDeferredAssets, { timeout: 1400 })
      : globalThis.setTimeout(preloadDeferredAssets, 800)

    return () => {
      criticalPreloads.forEach((preload) => preload.remove())
      if ('cancelIdleCallback' in window && typeof idleId === 'number') {
        window.cancelIdleCallback(idleId)
      } else {
        globalThis.clearTimeout(idleId)
      }
      preloads.forEach((preload) => preload.remove())
    }
  }, [decodeImageAsset])

  useEffect(() => {
    const title = introTitleRef.current
    if (!title) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    gsap.set(title, {
      '--intro-title-brightness': 1,
      '--intro-title-glow': 0.36,
      '--intro-title-noise-x': '0px',
      '--intro-title-noise-y': '0px',
      '--intro-title-radar': 0,
      '--intro-title-scan': -0.24,
      '--intro-title-scan-boost': 0,
      '--intro-title-hover': 0,
    })

    if (reduceMotion) return

    let isFlickerActive = true
    let flickerDelay: gsap.core.Tween | undefined
    let flickerTimeline: gsap.core.Timeline | undefined
    let hoverTimeline: gsap.core.Timeline | undefined

    const context = gsap.context(() => {
      gsap.to(title, {
        '--intro-title-brightness': 1.018,
        '--intro-title-glow': 0.395,
        duration: 6.4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })

      gsap.to(title, {
        '--intro-title-radar': 1,
        duration: 4.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })

      gsap.timeline({ repeat: -1, repeatDelay: 6.4, delay: 2.1 })
        .set(title, { '--intro-title-scan': -0.24, '--intro-title-scan-boost': 0 })
        .to(title, { '--intro-title-scan-boost': 0.44, duration: 0.24, ease: 'sine.out' }, 0)
        .to(title, { '--intro-title-scan': 1.24, duration: 1.62, ease: 'power2.inOut' }, 0)
        .to(title, { '--intro-title-scan-boost': 0, duration: 0.58, ease: 'sine.in' }, 0.82)

      const flicker = () => {
        const delay = gsap.utils.random(3.4, 8.2)
        flickerDelay = gsap.delayedCall(delay, () => {
          if (!isFlickerActive) return

          flickerTimeline = gsap.timeline({ onComplete: flicker })
            .set(title, {
              '--intro-title-noise-x': `${gsap.utils.random(-0.34, 0.34)}px`,
              '--intro-title-noise-y': `${gsap.utils.random(-0.18, 0.18)}px`,
              '--intro-title-brightness': gsap.utils.random(1.016, 1.034),
            })
            .to(title, {
              '--intro-title-noise-x': '0px',
              '--intro-title-noise-y': '0px',
              '--intro-title-brightness': 1,
              duration: 0.08,
              ease: 'steps(1)',
            })
        })
      }

      flicker()
    }, title)

    const handlePointerEnter = () => {
      hoverTimeline?.kill()
      hoverTimeline = gsap.timeline()
        .to(title, { '--intro-title-hover': 1, duration: 0.62, ease: 'sine.out' }, 0)
        .set(title, { '--intro-title-scan': -0.18, '--intro-title-scan-boost': 0 }, 0)
        .to(title, { '--intro-title-scan-boost': 0.46, duration: 0.24, ease: 'sine.out' }, 0.04)
        .to(title, { '--intro-title-scan': 1.18, duration: 1.08, ease: 'power2.inOut' }, 0.04)
        .to(title, {
          '--intro-title-noise-x': `${gsap.utils.random(-0.18, 0.18)}px`,
          '--intro-title-noise-y': `${gsap.utils.random(-0.08, 0.08)}px`,
          duration: 0.06,
          ease: 'steps(1)',
        }, 0.16)
        .to(title, { '--intro-title-noise-x': '0px', '--intro-title-noise-y': '0px', duration: 0.1, ease: 'steps(1)' }, 0.25)
        .to(title, { '--intro-title-scan-boost': 0, duration: 0.56, ease: 'sine.in' }, 0.62)
    }

    const handlePointerLeave = () => {
      gsap.to(title, { '--intro-title-hover': 0, duration: 0.72, ease: 'sine.inOut' })
    }

    title.addEventListener('pointerenter', handlePointerEnter)
    title.addEventListener('pointerleave', handlePointerLeave)

    return () => {
      isFlickerActive = false
      title.removeEventListener('pointerenter', handlePointerEnter)
      title.removeEventListener('pointerleave', handlePointerLeave)
      flickerDelay?.kill()
      flickerTimeline?.kill()
      hoverTimeline?.kill()
      context.revert()
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
        openProfile('fast')
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

  const openProfile = (mode: ProfileRevealMode = 'ready') => {
    clearProfileCloseTimeout()
    setIsProfileClosing(false)
    setProfileRevealMode(mode)
    setOpenProfilePanel('scan')
    setProfileLevel(1)
    setIsProfileOpen(true)
  }

  const upgradeProfileLevel = useCallback(async () => {
    const nextLevel = Math.min(profileLevel + 1, 3)
    if (nextLevel === profileLevel) return

    if (nextLevel === 2) {
      await decodeImageAsset(gunCharacterSyncedSrc)
    }

    if (nextLevel === 3) {
      await decodeImageAsset(gunCharacterBoostedSrc)
    }

    setProfileLevel((level) => Math.max(level, nextLevel))
  }, [decodeImageAsset, profileLevel])

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

  const openConnection = async (projectId: keyof typeof projectDetails) => {
    clearConnectionCloseTimeout()
    clearAccessingPrimaryTimeout()
    setIsConnectionClosing(false)
    setIsAccessingPrimary(false)

    const project = projects.find((item) => item.id === projectId)
    if (project) {
      await Promise.all([
        decodeImageAsset(project.thumbnail),
        decodeImageAsset(project.previewImage),
      ])
    }

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
      openProfile('ready')
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

  const updateProjectGlowTarget = (event: React.PointerEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()

    event.currentTarget.style.setProperty('--project-cursor-x', `${event.clientX - rect.left}px`)
    event.currentTarget.style.setProperty('--project-cursor-y', `${event.clientY - rect.top}px`)
  }

  const openConnectionFromProject = (event: React.MouseEvent<HTMLButtonElement>, projectId: keyof typeof projectDetails) => {
    if (!(event.target instanceof Element)) return
    void openConnection(projectId)
  }

  const selectedProject = selectedProjectId ? projects.find((project) => project.id === selectedProjectId) : null
  const selectedProjectDetails = selectedProjectId ? projectDetails[selectedProjectId] : null
  const isProfileVisible = isProfileOpen || isProfileClosing
  const isConnectionVisible = Boolean(selectedProject && selectedProjectDetails)
  const isAnyModalVisible = isProfileVisible || isConnectionVisible
  const canUseControlRoom = isRoomInteractive || isAnyModalVisible
  const getProfilePanelClassName = (panelId: ProfilePanelId, modifier: string) => (
    `control-room__analysis-panel control-room__analysis-panel--${modifier}${openProfilePanel === panelId ? ' control-room__analysis-panel--accordion-open' : ''}`
  )
  const renderProfilePanelTitle = (panelId: ProfilePanelId, title: string, meta?: string) => (
    <h3>
      <button
        className="control-room__accordion-trigger"
        type="button"
        onClick={() => {
          setOpenProfilePanel(panelId)
          upgradeProfileLevel()
        }}
        aria-expanded={openProfilePanel === panelId}
        aria-controls={`profile-panel-${panelId}`}
        data-hud-click="true"
      >
        <span>{title}</span>
        {meta && <em>{meta}</em>}
      </button>
    </h3>
  )

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
    if (!isGuideOpen && !isContactOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (guideRef.current?.contains(target) || guideToggleRef.current?.contains(target)) return
      if (contactRef.current?.contains(target) || contactToggleRef.current?.contains(target)) return

      setIsGuideOpen(false)
      setIsContactOpen(false)
    }

    window.addEventListener('pointerdown', handlePointerDown)

    return () => window.removeEventListener('pointerdown', handlePointerDown)
  }, [isContactOpen, isGuideOpen])

  const profileSyncedSrc = profileLevel >= 3 ? gunCharacterBoostedSrc : gunCharacterSyncedSrc
  const profileVisualSrc = profileLevel >= 2 ? profileSyncedSrc : character07ProfileSrc
  const profileCoreSrc = profileLevel >= 2 ? profileSyncedSrc : character06Src
  const profileStatusLabel = profileLevel >= 3 ? 'BOOSTED' : profileLevel >= 2 ? 'SYNCED' : 'ACTIVE'
  const profileCommandLabel = profileLevel >= 3 ? 'MAX LEVEL REACHED' : `RUN SYNC > LEVEL ${profileLevel + 1}`

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
            <img ref={characterRef} className="control-room__character" src={gunCharacterSrc} alt="" loading="eager" decoding="sync" />
          </button>
        </div>

        <div className="control-room__intro">
          <p>UIUX DESIGNER</p>
          <h1 ref={introTitleRef} className="control-room__intro-title" data-text="HONG JUHEE">HONG JUHEE</h1>
        </div>

        <div className="control-room__projects" aria-label="Featured works">
          {projects.map((project) => {
            const details = projectDetails[project.id as keyof typeof projectDetails]

            return (
              <button
                className={`control-room__project control-room__project--${project.position}${selectedProjectId === project.id ? ' control-room__project--selected' : ''}${selectedProjectId && selectedProjectId !== project.id ? ' control-room__project--signal-lost' : ''}`}
                type="button"
                key={project.id}
                onClick={(event) => openConnectionFromProject(event, project.id as keyof typeof projectDetails)}
                onPointerMove={updateProjectGlowTarget}
              >
                <span className="control-room__project-shell" data-hud-click={canUseControlRoom ? 'true' : undefined}>
                  <span className="control-room__project-corner control-room__project-corner--tl" />
                  <span className="control-room__project-corner control-room__project-corner--tr" />
                  <span className="control-room__project-corner control-room__project-corner--bl" />
                  <span className="control-room__project-corner control-room__project-corner--br" />
                  <span className="control-room__project-scan" />
                  <span className="control-room__project-header">
                    <span className="control-room__project-kicker">SLOT {project.id}</span>
                    <span className="control-room__project-lock">TARGET READY</span>
                  </span>
                  <span className="control-room__project-title">{project.title}</span>
                  <span className="control-room__project-category">{project.category}</span>
                  <span className="control-room__project-preview" aria-hidden="true">
                    {'thumbnail' in project && <img src={project.thumbnail} alt="" loading="eager" decoding="async" />}
                  </span>
                  <span className="control-room__project-data">
                    <span><b>STATUS</b><i>{details.status}</i></span>
                    <span><b>SIGNAL</b><i>STABLE</i></span>
                    <span><b>YEAR</b><i>{details.year}</i></span>
                    <span><b>ROLE</b><i>{details.type}</i></span>
                  </span>
                  <span className="control-room__project-access">
                    <span>ACCESS PROJECT</span>
                    <span aria-hidden="true">-&gt;</span>
                  </span>
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
          <span className="control-room__hud-button-label">ACCESS GUIDE</span>
          <span className="control-room__guide-reticle" aria-hidden="true" />
        </button>
        <div
          className={`control-room__guide-backdrop${isGuideOpen ? ' control-room__guide-backdrop--open' : ''}`}
          aria-hidden="true"
          onPointerDown={() => setIsGuideOpen(false)}
        />
        <aside ref={guideRef} id="control-room-guide" className={`control-room__guide${isGuideOpen ? ' control-room__guide--open' : ''}`} aria-label="How to use" aria-hidden={!isGuideOpen}>
          <button className="control-room__guide-close" type="button" onClick={() => setIsGuideOpen(false)} aria-label="Close how to use" data-hud-click="true">
            ×
          </button>
          <h2>ACCESS GUIDE</h2>
          <p className="control-room__guide-copy">프로젝트 슬롯을 선택하면 연결 메뉴가 열립니다. 중앙 캐릭터를 선택하면 사용자 데이터를 확인할 수 있습니다.</p>
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

        <button
          ref={contactToggleRef}
          className={`control-room__contact-toggle${isContactOpen ? ' control-room__contact-toggle--active' : ''}`}
          type="button"
          onClick={() => setIsContactOpen((isOpen) => !isOpen)}
          aria-expanded={isContactOpen}
          aria-controls="control-room-contact"
          data-hud-click={canUseControlRoom ? 'true' : undefined}
        >
          <span className="control-room__hud-button-label">CONTACT SIGNAL</span>
          <span className="control-room__contact-icon" aria-hidden="true" />
        </button>
        <aside ref={contactRef} id="control-room-contact" className={`control-room__contact${isContactOpen ? ' control-room__contact--open' : ''}`} aria-label="Contact signal" aria-hidden={!isContactOpen}>
          <button className="control-room__contact-close" type="button" onClick={() => setIsContactOpen(false)} aria-label="Close contact signal" data-hud-click="true">
            X
          </button>
          <p className="control-room__contact-copy">(C) 2026 HONG JUHEE Portfolio</p>
          <dl className="control-room__contact-list">
            <div>
              <dt>EMAIL</dt>
              <dd>
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=103juhee@naver.com" target="_blank" rel="noreferrer" data-hud-click={canUseControlRoom ? 'true' : undefined}>103juhee@naver.com</a>
              </dd>
            </div>
            <div>
              <dt>KAKAOTALK</dt>
              <dd>
                <a href="https://open.kakao.com/o/slx8IWvi" target="_blank" rel="noreferrer" data-hud-click={canUseControlRoom ? 'true' : undefined}>OPEN CHAT</a>
              </dd>
            </div>
          </dl>
        </aside>
      </div>

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
            <div className={`control-room__connection-preview control-room__connection-preview--${selectedProject.position}`} aria-hidden="true">
              <img src={selectedProject.previewImage} alt="" loading="eager" decoding="async" />
              <span>LIVE PROJECT PREVIEW</span>
            </div>
            <div className="control-room__connection-info">
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
          </div>
        )}
      </div>
      <div
        ref={profileRef}
        className={`control-room__profile control-room__profile--${profileRevealMode}${isProfileOpen ? ' control-room__profile--open' : ''}${isProfileClosing ? ' control-room__profile--closing' : ''}`}
        aria-hidden={!isProfileOpen}
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) closeProfile()
        }}
      >
        {isProfileVisible && (
        <div className={`control-room__profile-shell control-room__profile-shell--level-${profileLevel}`} role="dialog" aria-modal="true" aria-label="User data">
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
                <p className="control-room__analysis-clearance">CLEARANCE : LEVEL {profileLevel}</p>
              </div>
            </header>

       

            <section className={getProfilePanelClassName('visual', 'visual')}>
              {renderProfilePanelTitle('visual', 'ENTITY VISUAL')}
              <div id="profile-panel-visual" className="control-room__accordion-content">
                <button className="control-room__analysis-portrait" type="button" onClick={upgradeProfileLevel} data-hud-click="true">
                  <img src={profileVisualSrc} alt="" loading="eager" decoding="async" />
                  <span>{profileLevel >= 2 ? 'VISUAL SOURCE' : 'SIGNAL SOURCE'}<br />{profileLevel >= 2 ? 'SYNC FEED' : 'LIVE FEED'}</span>
                  <b aria-hidden="true">&gt; SCAN VISUAL</b>
                </button>
              </div>
            </section>

            <section className={getProfilePanelClassName('log', 'log')}>
              {renderProfilePanelTitle('log', 'SYSTEM LOG')}
              <div id="profile-panel-log" className="control-room__accordion-content">
                <p>[00:00:10:21] SCANNING...</p>
                <p>[00:00:10:54] FACIAL DATA SYNCHRONIZED.</p>
                <p>[00:00:11:02] VOICE PATTERN NOT FOUND.</p>
                <p>[00:00:11:18] BEHAVIOR ANALYSIS STARTED.</p>
                <p>[00:00:11:59] INTEREST PATTERN DETECTED.</p>
                <p>[00:00:12:07] IDENTITY CONFIRMED.</p>
                <b>&gt;&gt; ANALYSIS COMPLETE</b>
              </div>
            </section>

            <main className={getProfilePanelClassName('core', 'core')}>
              {renderProfilePanelTitle('core', 'IDENTITY CORE')}
              <div id="profile-panel-core" className="control-room__accordion-content">
                <button className="control-room__analysis-core-frame" type="button" onClick={upgradeProfileLevel} data-hud-click="true">
                  <img src={profileCoreSrc} alt="" loading="eager" decoding="async" />
                  <div className="control-room__analysis-status">
                    <span>STATUS</span>
                    <b>{profileStatusLabel}</b>
                  </div>
                  <span className="control-room__analysis-core-action" aria-hidden="true">&gt; BOOST CORE</span>
                </button>
              </div>
            </main>

            <aside className={getProfilePanelClassName('data', 'data')}>
              {renderProfilePanelTitle('data', 'USER DATA')}
              <div id="profile-panel-data" className="control-room__accordion-content">
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
              </div>
            </aside>

            <section className={getProfilePanelClassName('scan', 'scan')}>
              <div className="control-room__workflow-header">
                {renderProfilePanelTitle('scan', 'WORKFLOW SIGNAL', 'SIGNAL MAP')}
              </div>
              <div id="profile-panel-scan" className="control-room__accordion-content">
              <button className="control-room__workflow-map" type="button" onClick={upgradeProfileLevel} data-hud-click="true">
                <svg viewBox="0 0 320 300" focusable="false">
                  <g className="control-room__workflow-particles">
                    <circle cx="160" cy="42" r="1.6" />
                    <circle cx="204" cy="72" r="1.2" />
                    <circle cx="228" cy="118" r="1.4" />
                    <circle cx="218" cy="190" r="1.2" />
                    <circle cx="160" cy="240" r="1.5" />
                    <circle cx="92" cy="214" r="1.2" />
                    <circle cx="72" cy="148" r="1.4" />
                    <circle cx="112" cy="92" r="1.1" />
                    <circle cx="148" cy="128" r="1.3" />
                    <circle cx="182" cy="158" r="1.1" />
                    <circle cx="134" cy="184" r="1.2" />
                    <circle cx="104" cy="152" r="1.1" />
                  </g>
                  <g className="control-room__workflow-radar">
                    <polygon className="control-room__workflow-radar-ring control-room__workflow-radar-ring--outer" points="160,34 260,92 260,208 160,266 60,208 60,92" />
                    <polygon className="control-room__workflow-radar-ring control-room__workflow-radar-ring--outer" points="160,54 243,102 243,198 160,246 77,198 77,102" />
                    <polygon className="control-room__workflow-radar-ring control-room__workflow-radar-ring--mid" points="160,74 226,112 226,188 160,226 94,188 94,112" />
                    <polygon className="control-room__workflow-radar-ring control-room__workflow-radar-ring--mid" points="160,94 208,122 208,178 160,206 112,178 112,122" />
                    <polygon className="control-room__workflow-radar-ring control-room__workflow-radar-ring--inner" points="160,114 191,132 191,168 160,186 129,168 129,132" />
                    <polygon className="control-room__workflow-radar-ring control-room__workflow-radar-ring--inner" points="160,132 176,141 176,159 160,168 144,159 144,141" />
                    <line className="control-room__workflow-radar-axis" x1="160" y1="34" x2="160" y2="266" />
                    <line className="control-room__workflow-radar-axis" x1="60" y1="92" x2="260" y2="208" />
                    <line className="control-room__workflow-radar-axis" x1="260" y1="92" x2="60" y2="208" />
                  </g>
                  <circle className="control-room__workflow-core" cx="160" cy="150" r="20" />
                  <circle className="control-room__workflow-core-dot" cx="160" cy="150" r="5" />
                  <polygon className="control-room__workflow-shape" points="160,63 251.7,96.8 226.7,188.7 160,256.3 118.3,174.2 76.7,101.7" />
                  <g className="control-room__workflow-nodes">
                    <circle cx="160" cy="63" r="7" />
                    <circle cx="251.7" cy="96.8" r="7" />
                    <circle cx="226.7" cy="188.7" r="7" />
                    <circle cx="160" cy="256.3" r="7" />
                    <circle cx="118.3" cy="174.2" r="7" />
                    <circle cx="76.7" cy="101.7" r="7" />
                  </g>
                </svg>
                <span className="control-room__workflow-action" aria-hidden="true">&gt; ANALYZE SIGNAL</span>
              </button>
              <div className="control-room__workflow-list">
                {workflowSignals.map((signal) => (
                  <div className="control-room__workflow-item" key={signal.label}>
                    <span aria-hidden="true" />
                    <b>{signal.label}</b>
                    <em>{signal.meta}</em>
                  </div>
                ))}
              </div>
              </div>
            </section>

            <section className={getProfilePanelClassName('activity', 'activity')}>
              {renderProfilePanelTitle('activity', 'SYSTEM ACTIVITY')}
              <div id="profile-panel-activity" className="control-room__accordion-content">
              <svg viewBox="0 0 720 92" aria-hidden="true" focusable="false">
                <g className="control-room__analysis-wave-flow">
                  <path className="control-room__analysis-wave-line control-room__analysis-wave-line--dim" d="M0 50 C30 42 52 58 80 50 S132 40 160 51 210 63 244 49 304 38 340 50 392 60 430 49 486 41 522 51 584 63 620 49 680 42 720 50" />
                  <path className="control-room__analysis-wave-line" d="M0 54 C16 50 24 48 34 50 S52 58 66 52 90 45 108 49 136 57 154 51 176 42 194 45 214 58 236 53 260 50 282 54 304 48 324 45 346 55 366 52 386 47 408 50 430 56 450 51 472 40 494 43 514 59 536 53 558 48 580 50 602 56 622 52 644 43 666 47 692 55 720 50" />
                  <path className="control-room__analysis-wave-line control-room__analysis-wave-line--dim" d="M720 50 C750 42 772 58 800 50 S852 40 880 51 930 63 964 49 1024 38 1060 50 1112 60 1150 49 1206 41 1242 51 1304 63 1340 49 1400 42 1440 50" />
                  <path className="control-room__analysis-wave-line" d="M720 54 C736 50 744 48 754 50 S772 58 786 52 810 45 828 49 856 57 874 51 896 42 914 45 934 58 956 53 980 50 1002 54 1024 48 1044 45 1066 55 1086 52 1106 47 1128 50 1150 56 1170 51 1192 40 1214 43 1234 59 1256 53 1278 48 1300 50 1322 56 1342 52 1364 43 1386 47 1412 55 1440 50" />
                </g>
              </svg>
              </div>
            </section>

            <section className={getProfilePanelClassName('archive', 'archive')}>
              {renderProfilePanelTitle('archive', 'PERSONAL SIGNAL ARCHIVE')}
              <div id="profile-panel-archive" className="control-room__accordion-content">
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
              </div>
            </section>

            <nav className="control-room__analysis-panel control-room__analysis-panel--actions" aria-label="Profile actions">
              <button type="button" onClick={closeProfile} data-hud-click="true">
                <span>&gt; BACK TO MAIN</span>
                <span aria-hidden="true" />
              </button>
            </nav>

            <footer className="control-room__analysis-input">
              <button type="button" onClick={upgradeProfileLevel} data-hud-click="true">&gt; INPUT COMMAND [ {profileCommandLabel} ]</button>
            </footer>
          </div>

        </div>
        )}
      </div>
    </section>
  )
}
