import { useEffect, useRef, type FC } from 'react'
import * as THREE from 'three'
import character03Url from '@assets/charcter03.png'
import character04Url from '@assets/charcter04.png'

interface GlassTunnelProps {
  onComplete?: () => void
}

const TUNNEL_WIDTH = 9
const TUNNEL_HEIGHT = 6
const TUNNEL_LENGTH = 86
const GRID_STEP = 2
const CAMERA_START_Z = 2.2
const CHARACTER_END_Z = -28
const CAMERA_END_Z = -72
const STAR_COUNT = 500
const GALAXY_DESKTOP_COUNT = 540
const GALAXY_MOBILE_COUNT = 240
const STAR_NEAR_LIMIT_Z = -7
const CONTROL_ROOM_REVEAL_START = 0.34
const CONTROL_ROOM_REVEAL_END = 0.43
const ENTITY_PANEL_REVEAL_START = -0.02
const ENTITY_PANEL_REVEAL_END = 0
const ENTITY_PANEL_FADE_START = 0.31
const ENTITY_PANEL_FADE_END = 0.37
const ENTITY_SIGNAL_FOUND_PROGRESS = 0.055
const SIGNAL_SYNC_START = 0.055
const SIGNAL_SYNC_FULL = 0.18
const WHEEL_TRAVEL_SPEED = 0.014

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

const addLine = (points: number[], ax: number, ay: number, az: number, bx: number, by: number, bz: number) => {
  points.push(ax, ay, az, bx, by, bz)
}

const buildRetroTunnelGeometry = () => {
  const points: number[] = []
  const halfW = TUNNEL_WIDTH * 0.5
  const halfH = TUNNEL_HEIGHT * 0.5
  const xSteps = Math.round(TUNNEL_WIDTH / GRID_STEP)
  const ySteps = Math.round(TUNNEL_HEIGHT / GRID_STEP)
  const zSteps = Math.round(TUNNEL_LENGTH / GRID_STEP)

  for (let i = 0; i <= xSteps; i += 1) {
    const x = -halfW + (i / xSteps) * TUNNEL_WIDTH
    addLine(points, x, -halfH, 0, x, -halfH, -TUNNEL_LENGTH)
    addLine(points, x, halfH, 0, x, halfH, -TUNNEL_LENGTH)
  }

  for (let i = 0; i <= ySteps; i += 1) {
    const y = -halfH + (i / ySteps) * TUNNEL_HEIGHT
    addLine(points, -halfW, y, 0, -halfW, y, -TUNNEL_LENGTH)
    addLine(points, halfW, y, 0, halfW, y, -TUNNEL_LENGTH)
  }

  for (let i = 0; i <= zSteps; i += 1) {
    const z = -i * GRID_STEP
    addLine(points, -halfW, -halfH, z, halfW, -halfH, z)
    addLine(points, -halfW, halfH, z, halfW, halfH, z)
    addLine(points, -halfW, -halfH, z, -halfW, halfH, z)
    addLine(points, halfW, -halfH, z, halfW, halfH, z)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
  return geometry
}

const buildStarFieldGeometry = () => {
  const positions: number[] = []
  const colors: number[] = []
  const color = new THREE.Color()

  for (let i = 0; i < STAR_COUNT; i += 1) {
    const depth = Math.random()
    const sideBias = Math.random() < 0.68
    const z = STAR_NEAR_LIMIT_Z - depth * (TUNNEL_LENGTH + 26)
    const depthSpread = 1 + depth * 2.15
    const x = (Math.random() - 0.5) * (sideBias ? 26 : 17) * depthSpread
    const y = (Math.random() - 0.5) * (sideBias ? 18 : 12) * depthSpread
    const brightness = 0.34 + Math.random() * 0.62

    positions.push(x, y, z)
    color.setRGB(0.72 * brightness, 0.86 * brightness, brightness)
    colors.push(color.r, color.g, color.b)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  return geometry
}

const buildSignalGalaxyGeometry = (count: number) => {
  const positions: number[] = []
  const colors: number[] = []
  const opacitySeeds: number[] = []
  const color = new THREE.Color()

  for (let i = 0; i < count; i += 1) {
    const depth = Math.random()
    const arm = (i % 3) * ((Math.PI * 2) / 3)
    const radius = 4.8 + Math.random() ** 0.68 * 34
    const spin = radius * 0.09 + (Math.random() - 0.5) * 0.9
    const angle = arm + spin
    const verticalNoise = (Math.random() - 0.5) * (3.5 + depth * 9)
    const centerVoid = Math.max(1, smoothstep(5.4, 12, radius))
    const x = Math.cos(angle) * radius * (1.18 + depth * 0.34) + (Math.random() - 0.5) * 5.2
    const y = Math.sin(angle) * radius * 0.34 + verticalNoise
    const z = -34 - depth * 78
    const brightness = (0.38 + Math.random() * 0.58) * centerVoid

    positions.push(x, y, z)
    color.setRGB(0.2 * brightness, 0.52 * brightness, 0.86 * brightness)
    colors.push(color.r, color.g, color.b)
    opacitySeeds.push(0.42 + Math.random() * 0.58)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geometry.setAttribute('opacitySeed', new THREE.Float32BufferAttribute(opacitySeeds, 1))
  return geometry
}

const buildRadarRingGeometry = () => {
  const points: number[] = []
  const segments = 96

  for (let i = 0; i < segments; i += 1) {
    const angle = (i / segments) * Math.PI * 2
    points.push(Math.cos(angle), Math.sin(angle), 0)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
  return geometry
}

const makeCleanCharacterTexture = (sourceTexture: THREE.Texture) => {
  const image = sourceTexture.image as HTMLImageElement | HTMLCanvasElement | ImageBitmap | undefined
  const width = image?.width ?? 0
  const height = image?.height ?? 0

  if (!image || width === 0 || height === 0) {
    return sourceTexture
  }

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d', { willReadFrequently: true })

  if (!context) {
    return sourceTexture
  }

  canvas.width = width
  canvas.height = height
  context.drawImage(image, 0, 0, width, height)

  const imageData = context.getImageData(0, 0, width, height)
  const data = imageData.data

  for (let index = 0; index < data.length; index += 4) {
    const red = data[index]
    const green = data[index + 1]
    const blue = data[index + 2]
    const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722
    const alpha = clamp((luminance - 44) / 74, 0, 1)
    const value = Math.min(255, luminance * 1.34)

    data[index] = value * 0.78
    data[index + 1] = value * 0.9
    data[index + 2] = value
    data[index + 3] = Math.round(alpha * alpha * 255)
  }

  context.putImageData(imageData, 0, 0)

  const cleanTexture = new THREE.CanvasTexture(canvas)
  cleanTexture.colorSpace = THREE.SRGBColorSpace
  cleanTexture.minFilter = THREE.LinearFilter
  cleanTexture.magFilter = THREE.LinearFilter
  cleanTexture.needsUpdate = true

  return cleanTexture
}

const drawCanvasFallback = (canvas: HTMLCanvasElement) => {
  const context = canvas.getContext('2d')
  if (!context) return

  const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
  const width = window.innerWidth
  const height = window.innerHeight
  const centerX = width * 0.5
  const centerY = height * 0.5

  canvas.width = Math.max(1, Math.floor(width * pixelRatio))
  canvas.height = Math.max(1, Math.floor(height * pixelRatio))
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  context.fillStyle = '#000'
  context.fillRect(0, 0, width, height)
  context.strokeStyle = 'rgba(0, 180, 255, 0.78)'
  context.lineWidth = 1.4
  context.shadowColor = 'rgba(0, 180, 255, 0.55)'
  context.shadowBlur = 6

  for (let i = 0; i < 18; i += 1) {
    const t = i / 17
    const w = width * (0.08 + t * 1.04)
    const h = height * (0.06 + t * 0.78)
    context.strokeRect(centerX - w * 0.5, centerY - h * 0.5, w, h)
  }
}

const GlassTunnel: FC<GlassTunnelProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const entityPanelRef = useRef<HTMLDivElement>(null)
  const scrollHintRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false,
        alpha: false,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false,
      })
    } catch (error) {
      console.error('GlassTunnel WebGL renderer creation failed:', error)
      drawCanvasFallback(canvas)
      return
    }

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)
    scene.fog = new THREE.FogExp2(0x000000, 0.012)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobileDensity = window.matchMedia('(max-width: 720px), (pointer: coarse)').matches

    const camera = new THREE.PerspectiveCamera(76, window.innerWidth / window.innerHeight, 0.1, 120)
    camera.position.set(0, 0, CAMERA_START_Z)
    camera.lookAt(0, 0, -24)

    const signalGalaxyGeometry = buildSignalGalaxyGeometry(isMobileDensity ? GALAXY_MOBILE_COUNT : GALAXY_DESKTOP_COUNT)
    const signalGalaxyMaterial = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      vertexColors: true,
      uniforms: {
        uTime: { value: 0 },
        uVisibility: { value: 0 },
        uParallax: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 1.25) },
      },
      vertexShader: `
        attribute float opacitySeed;
        varying vec3 vColor;
        varying float vOpacity;
        varying vec3 vWorldPosition;
        uniform float uTime;
        uniform float uVisibility;
        uniform float uParallax;
        uniform float uPixelRatio;

        void main() {
          vec3 transformed = position;
          float drift = uTime * 0.018 + opacitySeed * 6.28318530718;
          transformed.x += sin(drift) * 0.18 + uParallax * 0.34;
          transformed.y += cos(drift * 0.74) * 0.08;

          vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = (1.25 + opacitySeed * 1.05) * uPixelRatio;
          vColor = color;
          vOpacity = opacitySeed * uVisibility;
          vWorldPosition = transformed;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vOpacity;
        varying vec3 vWorldPosition;

        void main() {
          vec2 point = gl_PointCoord - vec2(0.5);
          float core = 1.0 - smoothstep(0.12, 0.48, length(point));
          float centerMask = smoothstep(4.4, 14.0, length(vWorldPosition.xy));
          float depth = -vWorldPosition.z;
          float farFade = smoothstep(22.0, 64.0, depth) * (1.0 - smoothstep(88.0, 112.0, depth));
          float alpha = core * centerMask * farFade * vOpacity * 0.24;

          gl_FragColor = vec4(vColor, alpha);
        }
      `,
    })
    const signalGalaxy = new THREE.Points(signalGalaxyGeometry, signalGalaxyMaterial)
    signalGalaxy.frustumCulled = false
    signalGalaxy.renderOrder = -20
    scene.add(signalGalaxy)

    const geometry = buildRetroTunnelGeometry()
    const material = new THREE.LineBasicMaterial({
      color: 0x00b8ff,
      transparent: true,
      opacity: 0.58,
    })
    const glowMaterial = new THREE.LineBasicMaterial({
      color: 0x008cff,
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const tunnel = new THREE.LineSegments(geometry, material)
    tunnel.frustumCulled = false
    scene.add(tunnel)

    const tunnelGlow = new THREE.LineSegments(geometry, glowMaterial)
    tunnelGlow.frustumCulled = false
    tunnelGlow.scale.set(1.01, 1.01, 1)
    scene.add(tunnelGlow)

    const radarRingGeometry = buildRadarRingGeometry()
    const apertureRingMaterials = [0, 1, 2, 3].map(
      () =>
        new THREE.LineBasicMaterial({
          color: 0x00d9ff,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
    )
    const apertureRings = apertureRingMaterials.map((apertureMaterial) => {
      const ring = new THREE.LineLoop(radarRingGeometry, apertureMaterial)
      ring.frustumCulled = false
      scene.add(ring)
      return ring
    })

    const starGeometry = buildStarFieldGeometry()
    const starMaterial = new THREE.PointsMaterial({
      size: 1.75,
      sizeAttenuation: false,
      vertexColors: true,
      transparent: true,
      opacity: 0.78,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const stars = new THREE.Points(starGeometry, starMaterial)
    stars.frustumCulled = false
    scene.add(stars)

    const textureLoader = new THREE.TextureLoader()
    const characterTexturesToDispose: THREE.Texture[] = []
    let character03Material: THREE.MeshBasicMaterial
    let character04Material: THREE.MeshBasicMaterial
    const applyCleanTexture = (material: THREE.MeshBasicMaterial, sourceTexture: THREE.Texture) => {
      const cleanTexture = makeCleanCharacterTexture(sourceTexture)
      characterTexturesToDispose.push(cleanTexture)
      material.map = cleanTexture
      material.needsUpdate = true
      render()
    }
    const character03Texture = textureLoader.load(character03Url, (texture) => applyCleanTexture(character03Material, texture))
    const character04Texture = textureLoader.load(character04Url, (texture) => applyCleanTexture(character04Material, texture))
    characterTexturesToDispose.push(character03Texture, character04Texture)
    character03Texture.colorSpace = THREE.SRGBColorSpace
    character04Texture.colorSpace = THREE.SRGBColorSpace
    character03Texture.minFilter = THREE.LinearFilter
    character04Texture.minFilter = THREE.LinearFilter

    const characterGeometry = new THREE.PlaneGeometry(2.2, 4.6, 1, 1)
    const createCharacterMaterial = (map: THREE.Texture, opacity: number) =>
      new THREE.MeshBasicMaterial({
        map,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      })

    character03Material = createCharacterMaterial(character03Texture, 0.9)
    character04Material = createCharacterMaterial(character04Texture, 0)
    const character03 = new THREE.Mesh(characterGeometry, character03Material)
    const character04 = new THREE.Mesh(characterGeometry, character04Material)
    const characterGroup = new THREE.Group()
    characterGroup.add(character03, character04)
    characterGroup.renderOrder = 10
    scene.add(characterGroup)

    let targetZ = CAMERA_START_Z
    let currentZ = CAMERA_START_Z
    let animationId = 0
    let isAnimating = false

    const getSequenceProgress = () => clamp((CAMERA_START_Z - currentZ) / (CAMERA_START_Z - CAMERA_END_Z), 0, 1)

    const resizeCanvases = () => {
      const rendererPixelRatio = Math.min(window.devicePixelRatio || 1, 1.25)
      renderer.setPixelRatio(rendererPixelRatio)
      renderer.setSize(window.innerWidth, window.innerHeight, false)
      signalGalaxyMaterial.uniforms.uPixelRatio.value = rendererPixelRatio
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
    }

    const updateCharacter = () => {
      const progress = clamp((CAMERA_START_Z - currentZ) / (CAMERA_START_Z - CHARACTER_END_Z), 0, 1)
      const earlyPull = smoothstep(0.18, 0.48, progress)
      const transformationPull = smoothstep(0.48, 0.78, progress)
      const finalPull = smoothstep(0.72, 1, progress)
      const suction = clamp(earlyPull * 0.22 + transformationPull * 0.32 + finalPull * 0.46, 0, 1)
      const morph = smoothstep(0.52, 0.84, progress)
      const vanish = smoothstep(0.84, 1, progress)
      const distanceFromCamera = 3.4 + earlyPull * 4.5 + transformationPull * 11 + finalPull ** 1.55 * 40
      const z = currentZ - distanceFromCamera
      const x = 0
      const y = -0.35 + suction * 0.35
      const scaleLoss = earlyPull * 0.1 + transformationPull * 0.18 + finalPull * 0.62
      const baseScale = 1.12 - scaleLoss
      const character04ScaleBoost = 1 + morph * 0.28
      const stretch = 1 + suction * 0.42
      const opacity = 1 - vanish
      const glitchIntensity = transformationPull * 0.06 + finalPull * 0.16
      const glitch = Math.sin(progress * 120) > 0.82 ? glitchIntensity : 0

      characterGroup.position.set(x + glitch * 0.08, y, z)
      characterGroup.rotation.set(suction * 0.34, -suction * 0.22, suction * 0.2)
      characterGroup.scale.set(
        baseScale * character04ScaleBoost * (1 - suction * 0.1),
        baseScale * character04ScaleBoost * stretch,
        baseScale * character04ScaleBoost,
      )

      character03Material.opacity = (1 - morph) * opacity * 0.88
      character04Material.opacity = morph * opacity * 1.12
    }

    const render = () => {
      if (renderer.getContext().isContextLost()) {
        drawCanvasFallback(canvas)
        return
      }

      const sequenceProgress = getSequenceProgress()
      const cameraZ = CAMERA_START_Z + (CAMERA_END_Z - CAMERA_START_Z) * sequenceProgress
      const controlRoomOpacity = smoothstep(CONTROL_ROOM_REVEAL_START, CONTROL_ROOM_REVEAL_END, sequenceProgress)
      const entityReveal = smoothstep(ENTITY_PANEL_REVEAL_START, ENTITY_PANEL_REVEAL_END, sequenceProgress)
      const entityFade = smoothstep(ENTITY_PANEL_FADE_START, ENTITY_PANEL_FADE_END, sequenceProgress)
      const entityOpacity = Math.min(1, entityReveal * (1 - entityFade) * 1.35)
      const syncProgress = smoothstep(SIGNAL_SYNC_START, SIGNAL_SYNC_FULL, sequenceProgress)
      const syncExit = smoothstep(CONTROL_ROOM_REVEAL_START, CONTROL_ROOM_REVEAL_END, sequenceProgress)
      const signalSync = syncProgress * (1 - syncExit)
      const galaxyVisibility = reduceMotion
        ? 0.075
        : smoothstep(ENTITY_SIGNAL_FOUND_PROGRESS, SIGNAL_SYNC_FULL, sequenceProgress) * (1 - controlRoomOpacity * 0.72) * 1.18

      camera.position.z = cameraZ
      camera.lookAt(0, 0, cameraZ - 28)
      signalGalaxy.position.z = (CAMERA_START_Z - cameraZ) * 0.055
      signalGalaxy.rotation.z = reduceMotion ? 0 : -sequenceProgress * 0.035
      signalGalaxyMaterial.uniforms.uTime.value = reduceMotion ? 0 : performance.now() * 0.001
      signalGalaxyMaterial.uniforms.uVisibility.value = galaxyVisibility
      signalGalaxyMaterial.uniforms.uParallax.value = sequenceProgress
      stars.position.z = (CAMERA_START_Z - cameraZ) * 0.18
      apertureRings.forEach((ring, index) => {
        const phase = (performance.now() * 0.00028 + index * 0.18) % 1
        const eased = smoothstep(0, 1, phase)
        const scale = 0.72 + eased * 4.6
        const material = apertureRingMaterials[index]

        ring.position.set(0, 0, cameraZ - 20 - index * 2.4)
        ring.rotation.z = performance.now() * 0.00025 * (index % 2 === 0 ? 1 : -1)
        ring.scale.set(scale * 1.15, scale * 0.72, 1)
        material.opacity = signalSync * (1 - phase) ** 1.7 * 0.26
      })
      updateCharacter()
      renderer.render(scene, camera)
      canvas.style.opacity = String(1 - controlRoomOpacity * 0.92)
      canvas.style.filter = `contrast(${1.04 + signalSync * 0.12}) saturate(${1 + signalSync * 0.18}) brightness(${0.96 + signalSync * 0.06})`
      if (entityPanelRef.current) {
        entityPanelRef.current.style.setProperty('--entity-panel-opacity', String(entityOpacity))
        entityPanelRef.current.style.setProperty('--entity-panel-progress', String(entityReveal))
        entityPanelRef.current.style.setProperty('--entity-signal-sync', String(signalSync))
        entityPanelRef.current.classList.toggle('entity-ident-panel--active', entityOpacity > 0.04)
        entityPanelRef.current.classList.toggle('entity-ident-panel--found', sequenceProgress >= ENTITY_SIGNAL_FOUND_PROGRESS)
      }
      if (scrollHintRef.current) {
        const scrollHintOpacity = (1 - smoothstep(0.015, 0.14, sequenceProgress)) * (1 - controlRoomOpacity)
        scrollHintRef.current.style.setProperty('--tunnel-scroll-hint-opacity', String(scrollHintOpacity))
      }
      document.documentElement.style.setProperty('--control-room-opacity', String(controlRoomOpacity))
      document.documentElement.classList.toggle('intro-scroll-lock', controlRoomOpacity < 0.98)
    }

    const animateToTarget = () => {
      animationId = requestAnimationFrame(animateToTarget)
      currentZ += (targetZ - currentZ) * 0.075
      render()

      if (Math.abs(targetZ - currentZ) < 0.01) {
        currentZ = targetZ
        render()
        cancelAnimationFrame(animationId)
        isAnimating = false
      }
    }

    const requestMotion = () => {
      if (isAnimating) return
      isAnimating = true
      animationId = requestAnimationFrame(animateToTarget)
    }

    const onWheel = (event: WheelEvent) => {
      const sequenceProgress = getSequenceProgress()
      const controlRoomOpacity = smoothstep(CONTROL_ROOM_REVEAL_START, CONTROL_ROOM_REVEAL_END, sequenceProgress)
      const nextTargetZ = clamp(targetZ - event.deltaY * WHEEL_TRAVEL_SPEED, CAMERA_END_Z, CAMERA_START_Z)
      const isTunnelMotion = nextTargetZ !== targetZ

      if (controlRoomOpacity < 0.98 || (isTunnelMotion && event.deltaY < 0)) {
        event.preventDefault()
        window.scrollTo(0, 0)
      }

      targetZ = nextTargetZ
      requestMotion()
    }

    const onResize = () => {
      resizeCanvases()
      render()
    }
    const onContextLost = (event: Event) => {
      event.preventDefault()
      drawCanvasFallback(canvas)
    }

    resizeCanvases()
    render()
    canvas.addEventListener('webglcontextlost', onContextLost)
    window.addEventListener('resize', onResize)
    window.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      cancelAnimationFrame(animationId)
      document.documentElement.style.setProperty('--control-room-opacity', '0')
      document.documentElement.classList.remove('intro-scroll-lock')
      canvas.removeEventListener('webglcontextlost', onContextLost)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('wheel', onWheel)
      if (entityPanelRef.current) {
        entityPanelRef.current.style.setProperty('--entity-panel-opacity', '0')
        entityPanelRef.current.style.setProperty('--entity-panel-progress', '0')
        entityPanelRef.current.classList.remove('entity-ident-panel--active')
        entityPanelRef.current.classList.remove('entity-ident-panel--found')
      }
      geometry.dispose()
      signalGalaxyGeometry.dispose()
      signalGalaxyMaterial.dispose()
      starGeometry.dispose()
      material.dispose()
      glowMaterial.dispose()
      radarRingGeometry.dispose()
      apertureRingMaterials.forEach((apertureMaterial) => apertureMaterial.dispose())
      starMaterial.dispose()
      characterTexturesToDispose.forEach((texture) => texture.dispose())
      characterGeometry.dispose()
      character03Material.dispose()
      character04Material.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none',
          background: '#000',
          display: 'block',
        }}
      />
      <div ref={entityPanelRef} className="entity-ident-panel" aria-hidden="true">
        <div className="entity-ident-panel__inner">
          <div className="entity-ident-panel__header">-- SEARCHING</div>
          <div className="entity-ident-panel__time">
            <span className="entity-ident-panel__search-state">[00:00:05]</span>
            <span className="entity-ident-panel__found-state">[00:00:07]</span>
          </div>
          <div className="entity-ident-panel__rows">
            <span className="entity-ident-panel__search-state">PATH UPDATE...</span>
            <span className="entity-ident-panel__found-state">&gt;&gt; SIGNAL DETECTED</span>
          </div>
          <div className="entity-ident-panel__access">
            <span className="entity-ident-panel__search-state">&gt;&gt; SCANNING SIGNAL</span>
            <span className="entity-ident-panel__found-state">&gt;&gt; WELCOME to my world</span>
          </div>
        </div>
      </div>
      <div ref={scrollHintRef} className="tunnel-scroll-hint" aria-hidden="true">
        <span>&gt;&gt; SIGNAL DETECTED</span>
        <b>SCROLL TO ENTER</b>
      </div>
    </>
  )
}

export default GlassTunnel
