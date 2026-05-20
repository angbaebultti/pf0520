import { useEffect, useRef, type FC } from 'react'
import * as THREE from 'three'
import character03Url from '@assets/charcter03.png'
import character04Url from '@assets/charcter04.png'
import meUrl from '@assets/me.jpeg'

interface GlassTunnelProps {
  onComplete?: () => void
}

const TUNNEL_WIDTH = 9
const TUNNEL_HEIGHT = 6
const TUNNEL_LENGTH = 46
const GRID_STEP = 2
const CAMERA_START_Z = 2.2
const CHARACTER_END_Z = -28
const CAMERA_END_Z = -42
const STAR_COUNT = 420
const PHASE_TUNNEL_END = 0.7
const PHASE_REVEAL_START = 0.8
const ASCII_CHARS = '@#%XO+=:. '

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
    const sideBias = Math.random() < 0.72
    const x = (Math.random() - 0.5) * (sideBias ? 26 : 16)
    const y = (Math.random() - 0.5) * (sideBias ? 18 : 11)
    const z = -Math.random() * (TUNNEL_LENGTH + 18) + 5
    const brightness = 0.35 + Math.random() * 0.65

    positions.push(x, y, z)
    color.setRGB(0.72 * brightness, 0.86 * brightness, brightness)
    colors.push(color.r, color.g, color.b)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  return geometry
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
  const portraitCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const portraitCanvas = portraitCanvasRef.current
    const portraitContext = portraitCanvas?.getContext('2d')
    if (!canvas || !portraitCanvas || !portraitContext) return

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

    const camera = new THREE.PerspectiveCamera(76, window.innerWidth / window.innerHeight, 0.1, 120)
    camera.position.set(0, 0, CAMERA_START_Z)
    camera.lookAt(0, 0, -24)

    const geometry = buildRetroTunnelGeometry()
    const material = new THREE.LineBasicMaterial({
      color: 0x00b8ff,
      transparent: true,
      opacity: 0.88,
    })
    const glowMaterial = new THREE.LineBasicMaterial({
      color: 0x008cff,
      transparent: true,
      opacity: 0.22,
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

    const starGeometry = buildStarFieldGeometry()
    const starMaterial = new THREE.PointsMaterial({
      size: 0.045,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const stars = new THREE.Points(starGeometry, starMaterial)
    stars.frustumCulled = false
    scene.add(stars)

    const textureLoader = new THREE.TextureLoader()
    const character03Texture = textureLoader.load(character03Url, () => render())
    const character04Texture = textureLoader.load(character04Url, () => render())
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

    const character03Material = createCharacterMaterial(character03Texture, 0.9)
    const character04Material = createCharacterMaterial(character04Texture, 0)
    const character03 = new THREE.Mesh(characterGeometry, character03Material)
    const character04 = new THREE.Mesh(characterGeometry, character04Material)
    const characterGroup = new THREE.Group()
    characterGroup.add(character03, character04)
    characterGroup.renderOrder = 10
    scene.add(characterGroup)

    const trailMaterials = [0.18, 0.11, 0.07].flatMap((opacity) => [
      createCharacterMaterial(character03Texture, opacity),
      createCharacterMaterial(character04Texture, 0),
    ])
    const trails = trailMaterials.map((trailMaterial, index) => {
      const trail = new THREE.Mesh(characterGeometry, trailMaterial)
      trail.renderOrder = 9 - index
      scene.add(trail)
      return trail
    })

    let targetZ = CAMERA_START_Z
    let currentZ = CAMERA_START_Z
    let animationId = 0
    let isAnimating = false
    const meImage = new Image()
    let isMeLoaded = false
    const asciiCanvas = document.createElement('canvas')
    const asciiContext = asciiCanvas.getContext('2d', { willReadFrequently: true })
    let asciiGlyphs: Array<{ char: string; brightness: number }> = []
    let asciiCols = 0
    let asciiRows = 0

    const buildAsciiGlyphs = () => {
      if (!asciiContext || !meImage.naturalWidth || !meImage.naturalHeight) return

      asciiCols = 64
      asciiRows = Math.max(1, Math.round(asciiCols * (meImage.naturalHeight / meImage.naturalWidth) * 0.52))
      asciiCanvas.width = asciiCols
      asciiCanvas.height = asciiRows
      asciiContext.clearRect(0, 0, asciiCols, asciiRows)
      asciiContext.drawImage(meImage, 0, 0, asciiCols, asciiRows)

      const imageData = asciiContext.getImageData(0, 0, asciiCols, asciiRows).data
      asciiGlyphs = Array.from({ length: asciiCols * asciiRows }, (_, index) => {
        const pixelIndex = index * 4
        const brightness =
          (imageData[pixelIndex] * 0.2126 + imageData[pixelIndex + 1] * 0.7152 + imageData[pixelIndex + 2] * 0.0722) / 255
        const charIndex = clamp(Math.floor(brightness * (ASCII_CHARS.length - 1)), 0, ASCII_CHARS.length - 1)
        return { char: ASCII_CHARS[charIndex], brightness }
      })
    }

    meImage.src = meUrl
    meImage.onload = () => {
      isMeLoaded = true
      buildAsciiGlyphs()
      render()
    }

    const getSequenceProgress = () => clamp((CAMERA_START_Z - currentZ) / (CAMERA_START_Z - CAMERA_END_Z), 0, 1)

    const resizeCanvases = () => {
      const rendererPixelRatio = Math.min(window.devicePixelRatio || 1, 1.25)
      const portraitPixelRatio = 1
      renderer.setPixelRatio(rendererPixelRatio)
      renderer.setSize(window.innerWidth, window.innerHeight, false)
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()

      portraitCanvas.width = Math.max(1, Math.floor(window.innerWidth * portraitPixelRatio))
      portraitCanvas.height = Math.max(1, Math.floor(window.innerHeight * portraitPixelRatio))
      portraitCanvas.style.width = `${window.innerWidth}px`
      portraitCanvas.style.height = `${window.innerHeight}px`
      portraitContext.setTransform(portraitPixelRatio, 0, 0, portraitPixelRatio, 0, 0)
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
      const x = -0.32 + suction * 0.32
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

      trails.forEach((trail, index) => {
        const pairIndex = Math.floor(index / 2)
        const isSecondCharacter = index % 2 === 1
        const lag = (pairIndex + 1) * (0.36 + suction * 1.05)
        const trailOpacity = opacity * (transformationPull * 0.08 + finalPull * 0.18) * (1 - pairIndex * 0.25)
        const material = trail.material as THREE.MeshBasicMaterial

        trail.position.set(x - suction * 0.11 * (pairIndex + 1), y, z + lag)
        trail.rotation.copy(characterGroup.rotation)
        trail.scale.set(
          baseScale * character04ScaleBoost * (1 + suction * 0.1 * (pairIndex + 1)),
          baseScale * character04ScaleBoost * (1 + suction * 0.52 + pairIndex * 0.22),
          baseScale * character04ScaleBoost,
        )
        material.opacity = trailOpacity * (isSecondCharacter ? morph * 1.16 : 1 - morph)
      })
    }

    const drawPortraitReveal = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const sequenceProgress = getSequenceProgress()
      const arrivalProgress = clamp((sequenceProgress - PHASE_TUNNEL_END) / (1 - PHASE_TUNNEL_END), 0, 1)
      const revealProgress = clamp((sequenceProgress - PHASE_REVEAL_START) / (1 - PHASE_REVEAL_START), 0, 1)
      const reveal = smoothstep(0.08, 1, revealProgress)

      portraitContext.clearRect(0, 0, width, height)
      if (!isMeLoaded || sequenceProgress < PHASE_TUNNEL_END) {
        portraitCanvas.style.opacity = '0'
        return
      }

      portraitContext.globalCompositeOperation = 'source-over'
      portraitContext.fillStyle = `rgba(4, 8, 18, ${0.18 + reveal * 0.16})`
      portraitContext.fillRect(0, 0, width, height)

      const imageRatio = meImage.naturalWidth / meImage.naturalHeight
      const targetHeight = Math.min(height * 0.78, width * 0.92 / imageRatio)
      const targetWidth = targetHeight * imageRatio
      const x = (width - targetWidth) * 0.5
      const y = (height - targetHeight) * 0.5
      const clarity = smoothstep(0.16, 1, reveal)
      const readable = smoothstep(0.32, 1, reveal)
      const asciiShift = targetHeight * 1.18 * revealProgress
      const asciiOpacity = 1 - smoothstep(0.72, 1, revealProgress) * 0.92

      portraitContext.save()
      portraitContext.globalAlpha = 0.06 + readable * 0.18
      portraitContext.filter = `grayscale(1) blur(${18 - clarity * 10}px) brightness(${0.62 + clarity * 0.18}) contrast(${0.62 + clarity * 0.16})`
      portraitContext.drawImage(
        meImage,
        x - targetWidth * 0.015,
        y - targetHeight * 0.015,
        targetWidth * 1.03,
        targetHeight * 1.03,
      )
      portraitContext.restore()

      portraitContext.save()
      portraitContext.globalAlpha = 0.04 + readable * 0.92
      portraitContext.filter = `grayscale(${0.98 - clarity * 0.18}) blur(${12 - clarity * 12}px) contrast(${0.5 + clarity * 0.62}) brightness(${0.62 + clarity * 0.42}) saturate(${0.32 + clarity * 0.4})`
      portraitContext.drawImage(meImage, x, y, targetWidth, targetHeight)
      portraitContext.restore()

      if (asciiGlyphs.length > 0 && asciiCols > 0 && asciiRows > 0) {
        const cellX = targetWidth / asciiCols
        const cellY = targetHeight / asciiRows
        const fontSize = clamp(cellY * 0.92, 6, 12)
        portraitContext.save()
        portraitContext.beginPath()
        portraitContext.rect(x, y, targetWidth, targetHeight)
        portraitContext.clip()
        portraitContext.globalCompositeOperation = 'screen'
        portraitContext.font = `${fontSize}px Consolas, 'Courier New', monospace`
        portraitContext.textAlign = 'center'
        portraitContext.textBaseline = 'middle'
        portraitContext.shadowColor = 'rgba(210, 235, 255, 0.5)'
        portraitContext.shadowBlur = 3

        for (let row = 0; row < asciiRows; row += 1) {
          const py = y + row * cellY + cellY * 0.5 + asciiShift
          if (py < y - cellY || py > y + targetHeight + cellY) continue

          const rowFade = clamp((y + targetHeight - py) / (targetHeight * 0.24), 0, 1)
          const slideFade = clamp((py - y + cellY * 2) / (targetHeight * 0.18), 0, 1)
          const lineAlpha = asciiOpacity * rowFade * slideFade
          if (lineAlpha <= 0.01) continue

          for (let col = 0; col < asciiCols; col += 1) {
            const { char, brightness } = asciiGlyphs[row * asciiCols + col]
            if (char === ' ') continue

            const noise = Math.sin((row + 1) * 18.31 + (col + 1) * 4.79 + arrivalProgress * 9.4)
            const px = x + col * cellX + cellX * 0.5 + noise * 0.45 * (1 - clarity)
            const ink = 0.32 + (1 - brightness) * 0.58
            portraitContext.fillStyle = `rgba(225, 238, 248, ${lineAlpha * ink})`
            portraitContext.fillText(char, px, py)
          }
        }
        portraitContext.restore()
      }

      const grainWidth = Math.max(1, Math.floor(targetWidth))
      const grainHeight = Math.max(1, Math.floor(targetHeight))
      portraitContext.fillStyle = `rgba(210, 226, 255, ${0.014 * (1 - reveal) + 0.008})`
      for (let grain = 0; grain < 140; grain += 1) {
        const px = x + ((grain * 97) % grainWidth)
        const py = y + ((grain * 193) % grainHeight)
        portraitContext.fillRect(px, py, 1, 1)
      }

      portraitContext.globalAlpha = 0.055 * (1 - reveal) + 0.025
      portraitContext.fillStyle = '#000'
      for (let sy = 0; sy < height; sy += 4) {
        portraitContext.fillRect(0, sy, width, 1)
      }
      portraitContext.globalAlpha = 1
      portraitCanvas.style.opacity = String(smoothstep(0, 0.16, arrivalProgress) * 0.96)
    }

    const render = () => {
      if (renderer.getContext().isContextLost()) {
        drawCanvasFallback(canvas)
        return
      }

      const sequenceProgress = getSequenceProgress()
      const tunnelProgress = clamp(sequenceProgress / PHASE_TUNNEL_END, 0, 1)
      const cameraZ = CAMERA_START_Z + (CHARACTER_END_Z - CAMERA_START_Z) * tunnelProgress

      camera.position.z = cameraZ
      camera.lookAt(0, 0, cameraZ - 28)
      stars.position.z = (CAMERA_START_Z - cameraZ) * 0.18
      updateCharacter()
      renderer.render(scene, camera)
      drawPortraitReveal()
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
      targetZ = clamp(targetZ - event.deltaY * 0.052, CAMERA_END_Z, CAMERA_START_Z)
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
    window.addEventListener('wheel', onWheel, { passive: true })

    return () => {
      cancelAnimationFrame(animationId)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('wheel', onWheel)
      geometry.dispose()
      starGeometry.dispose()
      material.dispose()
      glowMaterial.dispose()
      starMaterial.dispose()
      character03Texture.dispose()
      character04Texture.dispose()
      characterGeometry.dispose()
      character03Material.dispose()
      character04Material.dispose()
      trailMaterials.forEach((trailMaterial) => trailMaterial.dispose())
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
      <canvas
        ref={portraitCanvasRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1,
          pointerEvents: 'none',
          opacity: 0,
          mixBlendMode: 'normal',
        }}
      />
    </>
  )
}

export default GlassTunnel
