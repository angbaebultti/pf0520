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
    meImage.src = meUrl
    meImage.onload = () => {
      isMeLoaded = true
      render()
    }

    const resizePortraitCanvas = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
      portraitCanvas.width = Math.max(1, Math.floor(window.innerWidth * pixelRatio))
      portraitCanvas.height = Math.max(1, Math.floor(window.innerHeight * pixelRatio))
      portraitCanvas.style.width = `${window.innerWidth}px`
      portraitCanvas.style.height = `${window.innerHeight}px`
      portraitContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
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
      const rawVoidProgress = clamp((CHARACTER_END_Z - currentZ) / (CHARACTER_END_Z - CAMERA_END_Z), 0, 1)
      const reveal = smoothstep(0.04, 1, rawVoidProgress)

      portraitContext.clearRect(0, 0, width, height)
      if (!isMeLoaded || rawVoidProgress <= 0) return

      portraitContext.globalCompositeOperation = 'source-over'
      portraitContext.fillStyle = `rgba(4, 8, 18, ${0.18 + reveal * 0.16})`
      portraitContext.fillRect(0, 0, width, height)

      const imageRatio = meImage.naturalWidth / meImage.naturalHeight
      const targetHeight = Math.min(height * 0.78, width * 0.92 / imageRatio)
      const targetWidth = targetHeight * imageRatio
      const x = (width - targetWidth) * 0.5
      const y = (height - targetHeight) * 0.5
      const decodeLine = y + targetHeight * reveal
      const clarity = smoothstep(0.16, 1, reveal)
      const readable = smoothstep(0.32, 1, reveal)

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
      portraitContext.globalAlpha = 0.08 + readable * 0.88
      portraitContext.filter = `grayscale(${0.98 - clarity * 0.18}) blur(${14 - clarity * 14}px) contrast(${0.48 + clarity * 0.58}) brightness(${0.58 + clarity * 0.46}) saturate(${0.35 + clarity * 0.38})`
      portraitContext.drawImage(meImage, x, y, targetWidth, targetHeight)
      portraitContext.restore()

      portraitContext.save()
      portraitContext.beginPath()
      portraitContext.rect(x, y, targetWidth, Math.max(0, decodeLine - y))
      portraitContext.clip()
      portraitContext.globalAlpha = 0.34 + readable * 0.56
      portraitContext.filter = `grayscale(${0.92 - clarity * 0.1}) blur(${6 - clarity * 6}px) contrast(${0.72 + clarity * 0.34}) brightness(${0.74 + clarity * 0.26}) saturate(0.58)`
      portraitContext.drawImage(meImage, x, y, targetWidth, targetHeight)
      portraitContext.restore()

      portraitContext.save()
      portraitContext.beginPath()
      portraitContext.rect(x, decodeLine - targetHeight * 0.08, targetWidth, Math.max(0, y + targetHeight - decodeLine + targetHeight * 0.08))
      portraitContext.clip()
      portraitContext.globalCompositeOperation = 'screen'
      const ditherAlpha = 0.58 * (1 - clarity) + 0.06 * (1 - reveal)
      for (let py = y; py < y + targetHeight; py += 7) {
        for (let px = x; px < x + targetWidth; px += 7) {
          const noise = Math.sin(px * 12.9898 + py * 78.233 + rawVoidProgress * 12.7)
          const bandFade = clamp((py - decodeLine + targetHeight * 0.08) / (targetHeight * 0.22), 0, 1)
          if (noise > 0.18) {
            portraitContext.fillStyle = `rgba(205, 230, 255, ${ditherAlpha * bandFade * (noise > 0.78 ? 0.9 : 0.32)})`
            portraitContext.fillRect(px, py, noise > 0.78 ? 2 : 1, noise > 0.78 ? 2 : 1)
          }
        }
      }

      portraitContext.font = '10px Consolas, monospace'
      portraitContext.textAlign = 'left'
      for (let row = 0; row < 34; row += 1) {
        const textY = y + ((row * 37 + rawVoidProgress * 18) % targetHeight)
        const bandFade = clamp((textY - decodeLine + targetHeight * 0.08) / (targetHeight * 0.3), 0, 1)
        if (bandFade <= 0) continue
        portraitContext.fillStyle = `rgba(180, 218, 255, ${0.12 * (1 - clarity) * bandFade})`
        portraitContext.fillText(row % 3 === 0 ? '01011001 0010' : row % 3 === 1 ? 'SIGNAL_REBUILD' : '1010 0110 1101', x + ((row * 83) % Math.max(1, targetWidth - 120)), textY)
      }
      portraitContext.restore()

      portraitContext.save()
      portraitContext.beginPath()
      portraitContext.rect(x, decodeLine - targetHeight * 0.1, targetWidth, targetHeight * 0.14)
      portraitContext.clip()
      portraitContext.globalAlpha = 0.1 * (1 - reveal)
      portraitContext.filter = 'grayscale(0.9) contrast(1.08) brightness(1.04)'
      for (let slice = 0; slice < 4; slice += 1) {
        const sliceY = decodeLine + (slice - 2) * 8
        const sliceHeight = 2 + (slice % 2) * 2
        const offset = ((slice % 2 === 0 ? -1 : 1) * (3 + slice)) * (1 - reveal)
        portraitContext.drawImage(
          meImage,
          0,
          clamp((sliceY - y) / targetHeight, 0, 1) * meImage.naturalHeight,
          meImage.naturalWidth,
          (sliceHeight / targetHeight) * meImage.naturalHeight,
          x + offset,
          sliceY,
          targetWidth,
          sliceHeight,
        )
      }
      portraitContext.restore()

      const grainWidth = Math.max(1, Math.floor(targetWidth))
      const grainHeight = Math.max(1, Math.floor(targetHeight))
      portraitContext.fillStyle = `rgba(210, 226, 255, ${0.025 * (1 - reveal) + 0.01})`
      for (let grain = 0; grain < 240; grain += 1) {
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
      portraitCanvas.style.opacity = String(smoothstep(0, 0.22, rawVoidProgress) * 0.96)
    }

    const render = () => {
      if (renderer.getContext().isContextLost()) {
        drawCanvasFallback(canvas)
        return
      }

      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
      renderer.setPixelRatio(pixelRatio)
      renderer.setSize(window.innerWidth, window.innerHeight, false)
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      camera.position.z = currentZ
      camera.lookAt(0, 0, currentZ - 28)
      stars.position.z = (CAMERA_START_Z - currentZ) * 0.18
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
      resizePortraitCanvas()
      render()
    }
    const onContextLost = (event: Event) => {
      event.preventDefault()
      drawCanvasFallback(canvas)
    }

    resizePortraitCanvas()
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
